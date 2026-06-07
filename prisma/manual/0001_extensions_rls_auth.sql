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
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."User" (id, email, "createdAt", "updatedAt")
  values (new.id, new.email, now(), now())
  on conflict (id) do nothing;
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
