-- Migration : création de la ligne User au premier login + squelette RLS.
--
-- ⚠️ À APPLIQUER APRÈS la première migration Prisma (CLAUDE.md §3) : ce script
--    suppose l'existence de `public.users` (et, à terme, `public.club_members`,
--    `public.organizations`). Tant que le schéma Prisma n'est pas posé, ce
--    fichier sert de référence d'archi (cf. docs/adr/0001-rbac-role-resolution.md).
--
-- Décisions couvertes :
--   • §4 ADR — trigger on_auth_user_created → insère public.users + rôle initial.
--   • §1 ADR — rôle + rattachements portés dans app_metadata (claims JWT).
--   • §3 ADR — RLS-first : activation RLS + exemple de policy basée sur les claims.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Création de la ligne applicative au premier login
-- ─────────────────────────────────────────────────────────────────────────────
-- Le rôle initial est transmis via raw_user_meta_data au moment de l'inscription
-- (/inscription-club → club_admin, /inscription-entreprise → org_buyer). On le
-- recopie dans raw_app_meta_data (= app_metadata, claim NON modifiable par l'user)
-- pour qu'il devienne une autorisation de confiance.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  initial_role text := coalesce(new.raw_user_meta_data ->> 'role', 'org_buyer');
begin
  -- Insère la ligne applicative (idempotent).
  insert into public.users (id, email, role)
  values (new.id, new.email, initial_role)
  on conflict (id) do nothing;

  -- Pose le rôle dans app_metadata → présent dans le JWT (lu par le middleware
  -- et par les policies RLS via auth.jwt()).
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Access Token Hook (rafraîchit club_ids / organization_id à chaque JWT)
-- ─────────────────────────────────────────────────────────────────────────────
-- À déclarer aussi dans Supabase Dashboard → Auth → Hooks (Customize Access Token).
-- Injecte dans app_metadata les rattachements à jour, sans dépendre du moment
-- d'inscription (utile pour le multi-club, SPEC §11).

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims    jsonb := event -> 'claims';
  app_meta  jsonb := coalesce(claims -> 'app_metadata', '{}'::jsonb);
  uid       uuid  := (event ->> 'user_id')::uuid;
  v_role    text;
  v_clubs   jsonb;
  v_org     text;
begin
  select u.role into v_role from public.users u where u.id = uid;

  -- Clubs dont l'utilisateur est membre (club_admin) — table à venir.
  -- select coalesce(jsonb_agg(cm.club_id), '[]'::jsonb) into v_clubs
  --   from public.club_members cm where cm.user_id = uid;
  v_clubs := '[]'::jsonb;

  -- Organisation acheteuse rattachée (org_buyer) — colonne à venir.
  -- select u.organization_id into v_org from public.users u where u.id = uid;

  app_meta := app_meta
              || jsonb_build_object('role', v_role)
              || jsonb_build_object('club_ids', v_clubs);
  if v_org is not null then
    app_meta := app_meta || jsonb_build_object('organization_id', v_org);
  end if;

  return jsonb_set(event, '{claims,app_metadata}', app_meta);
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RLS-first — activation + exemple de policy (cf. §3 ADR)
-- ─────────────────────────────────────────────────────────────────────────────
-- Chaque table lisible côté client DOIT activer RLS. Les policies s'appuient sur
-- les claims app_metadata du JWT. Exemple sur public.users :

alter table public.users enable row level security;

-- Un utilisateur lit/écrit sa propre ligne.
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users
  for select using (auth.uid() = id);

-- Un sociuly_admin lit tout (helper basé sur le claim de rôle).
drop policy if exists users_admin_select on public.users;
create policy users_admin_select on public.users
  for select using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'sociuly_admin'
  );

-- NB : les opérations service_role (KYC, attribution de rôle) bypassent la RLS.
