-- ════════════════════════════════════════════════════════════════════════════
-- Sociuly — SQL manuel non exprimable dans le DSL Prisma.
-- À appliquer dans l'ordre du runbook (voir prisma/manual/README.md) :
--   §A extensions  → AVANT `prisma migrate` (la colonne Club.geo en dépend)
--   §B..§D         → APRÈS `prisma migrate` (objets reposant sur les tables créées)
-- Idempotent (IF NOT EXISTS / OR REPLACE) : ré-exécutable sans danger.
-- ════════════════════════════════════════════════════════════════════════════


-- ─── §A. Extensions (À EXÉCUTER AVANT `prisma migrate dev`) ───────────────────
-- PostGIS : type geography(Point,4326) de Club.geo (rayon km, ST_DWithin).
-- pg_trgm : recherche floue / index trigram du catalogue.
-- pgcrypto : gen_random_uuid() (déjà natif Postgres 13+, par sécurité).
create extension if not exists postgis;
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;


-- ─── §B. Index géo + full-text (APRÈS migration) ─────────────────────────────
-- Index GiST sur Club.geo : requêtes de rayon (ST_DWithin) du marketplace.
create index if not exists "Club_geo_gist" on "Club" using gist (geo);

-- Index GIN full-text (français) sur Experience(title, description).
-- Index d'EXPRESSION (pas de colonne ajoutée → aucun drift avec le schéma Prisma).
-- Les requêtes doivent réutiliser exactement la même expression to_tsvector(...).
create index if not exists "Experience_fts_gin" on "Experience"
  using gin (
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
  );


-- ─── §C. Pont Auth (Option A) : auth.users → public.User ─────────────────────
-- FK : la ligne métier partage l'UUID de auth.users et suit son cycle de vie.
alter table public."User"
  drop constraint if exists "User_id_auth_fkey";
alter table public."User"
  add constraint "User_id_auth_fkey"
  foreign key (id) references auth.users (id) on delete cascade;

-- Trigger : à chaque création d'un utilisateur de connexion (magic link), créer
-- automatiquement la ligne public.User correspondante (même id, email recopié).
-- updatedAt n'a pas de défaut DB (Prisma @updatedAt = applicatif) → on le fournit.
--
-- Rôle initial : transmis via raw_user_meta_data au moment de l'inscription
-- (/inscription-club → club_admin, /inscription-entreprise → org_buyer ; cf. ADR
-- 0001 §4). On le valide contre l'enum UserRole (sinon repli org_buyer) puis on
-- le recopie dans raw_app_meta_data (= app_metadata, claim NON modifiable par
-- l'utilisateur) → présent dans le JWT, lu par le middleware Edge et la RLS.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := new.raw_user_meta_data ->> 'role';
  initial_role   text := case
                           when requested_role in ('org_buyer', 'club_admin', 'sociuly_admin')
                             then requested_role
                           else 'org_buyer'
                         end;
begin
  insert into public."User" (id, email, role, "createdAt", "updatedAt")
  values (new.id, new.email, initial_role::"UserRole", now(), now())
  on conflict (id) do nothing;

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                             || jsonb_build_object('role', initial_role)
   where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── §D. RLS — stratégie deny-by-default (APRÈS migration) ───────────────────
-- Modèle de sécurité v1 : TOUT le métier passe par Prisma côté serveur. Prisma se
-- connecte avec le rôle propriétaire des tables (postgres) qui CONTOURNE la RLS.
-- On active donc la RLS sur toutes les tables pour BLOQUER la clé anon Supabase
-- (PostgREST / client navigateur) par défaut, puis on ré-ouvre en SELECT seulement
-- les données réellement publiques (catalogue). Aucune policy d'écriture : les
-- écritures ne sont possibles que via Prisma (serveur).

do $$
declare t text;
begin
  foreach t in array array[
    'User','Organization','Club','ClubMember','Project','ExperienceModule',
    'Experience','ExperienceSegment','Quote','Booking','Invoice','Review'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- Lecture publique du catalogue (si jamais lu via le client Supabase anon).
drop policy if exists "Experience public read" on public."Experience";
create policy "Experience public read" on public."Experience"
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists "Club public read" on public."Club";
create policy "Club public read" on public."Club"
  for select to anon, authenticated
  using (status = 'active');

drop policy if exists "ExperienceSegment public read" on public."ExperienceSegment";
create policy "ExperienceSegment public read" on public."ExperienceSegment"
  for select to anon, authenticated
  using (
    exists (
      select 1 from public."Experience" e
      where e.id = "ExperienceSegment"."experienceId" and e.status = 'published'
    )
  );

drop policy if exists "Project public read" on public."Project";
create policy "Project public read" on public."Project"
  for select to anon, authenticated
  using (status in ('active', 'funded'));


-- ─── §E. Access Token Hook : rattachements à jour dans le JWT (APRÈS migration) ─
-- Rafraîchit `app_metadata` (role + club_ids + organization_id) à CHAQUE émission
-- de JWT, depuis l'état réel des tables — indispensable au multi-club (SPEC §11)
-- et au rattachement org_buyer postérieur à la création du compte. Le serveur lit
-- la même vérité via Prisma (lib/auth/resolve.server.ts) ; ces claims sont le
-- cache Edge consommé par le middleware (lib/auth/access.ts).
--
-- ⚠️ À déclarer aussi dans Supabase Dashboard → Auth → Hooks → « Customize Access
--    Token (JWT) Claims » en pointant sur cette fonction.
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  uid      uuid := (event ->> 'user_id')::uuid;
  app_meta jsonb := coalesce(event #> '{claims,app_metadata}', '{}'::jsonb);
  v_role   text;
  v_org    text;
  v_clubs  jsonb;
begin
  select u.role::text, u."organizationId"::text
    into v_role, v_org
    from public."User" u
   where u.id = uid;

  select coalesce(jsonb_agg(cm."clubId"::text), '[]'::jsonb)
    into v_clubs
    from public."ClubMember" cm
   where cm."userId" = uid;

  app_meta := app_meta
              || jsonb_build_object('role', v_role)
              || jsonb_build_object('club_ids', v_clubs);
  -- N'expose organization_id que s'il existe (org_buyer rattaché).
  if v_org is not null then
    app_meta := app_meta || jsonb_build_object('organization_id', v_org);
  else
    app_meta := app_meta - 'organization_id';
  end if;

  return jsonb_set(event, '{claims,app_metadata}', app_meta);
end;
$$;

-- Le hook s'exécute sous le rôle `supabase_auth_admin` : lui donner l'accès en
-- lecture aux tables interrogées, et l'exécution de la fonction. On retire
-- l'exécution aux rôles client (anon/authenticated) par principe de moindre privilège.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;
grant select on public."User", public."ClubMember" to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook(jsonb) from authenticated, anon, public;
