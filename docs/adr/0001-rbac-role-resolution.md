# ADR 0001 — Résolution de rôle & RBAC

**Statut** : accepté (v1, partiellement stubbé)
**Date** : 2026-06-08
**Périmètre** : SPEC §4 (rôles), §6 (routes & auth), CLAUDE.md §3/§8

---

## Contexte

L'auth Sociuly est en **magic link Supabase uniquement** (pas de mot de passe, SPEC §1).
Avant cette décision :

- Le callback magic link (`app/auth/callback/route.ts`) retombait sur un fallback
  dev (`DEV_CONSOLE_HOME`) — la redirection par rôle était en `TODO(prisma)`.
- Le middleware (`lib/supabase/middleware.ts`) ne faisait que **rafraîchir la
  session** — aucun gating de route.
- Aucun helper de session centralisé.
- **Le schéma Prisma n'existe pas encore** (CLAUDE.md §3 = modèle cible). Impossible
  de lire `User.role` / `ClubMember` / `Organization` depuis une DB pour l'instant.

## Décisions

### 1. Source du rôle — claims `app_metadata` du JWT (seam unique)

Le rôle (`org_buyer | club_admin | sociuly_admin`) et les rattachements
(`club_ids[]`, `organization_id`) sont lus depuis les claims **`app_metadata`**
du JWT Supabase, via une fonction **pure** `roleContextFromUser()`
(`lib/auth/session.ts`).

Pourquoi `app_metadata` plutôt qu'une lecture DB :

- Le **middleware tourne sur chaque requête** → un aller-retour DB par requête
  serait coûteux. Les claims sont déjà dans le JWT (zéro I/O).
- `app_metadata` n'est **pas modifiable par l'utilisateur** (contrairement à
  `user_metadata`) → sûr pour porter une autorisation.
- C'est la **fondation des policies RLS** (cf. décision 3) : les mêmes claims
  servent côté Postgres (`auth.jwt() -> 'app_metadata'`).

**État actuel (« dev stub + clean seam »)** : tant que les tables Prisma et le
trigger ne sont pas posés, les claims peuvent être vides → `role = null`
(utilisateur authentifié mais sans accès aux espaces protégés). En dev sans
Supabase configuré, `getSession()` renvoie une **session de démo** pilotable par
`DEV_AUTH_ROLE` pour garder la maquette navigable.

> **TODO(prisma)** : une fois `User/ClubMember/Organization` créés, alimenter
> `app_metadata` via le trigger `on_auth_user_created` (rôle initial) + un
> **Access Token Hook** Supabase (rafraîchit `club_ids`/`organization_id` à
> chaque émission de JWT). Aucun changement requis dans le middleware ni les
> gardes.

### 2. RBAC à deux niveaux

- **Middleware (barrage principal)** : `checkRouteAccess(pathname, session)`
  (pur, `lib/auth/rbac.ts`) applique la matrice SPEC §6 et redirige :
  - non authentifié → `/connexion?redirect=<cible>` ;
  - rôle/appartenance insuffisant → espace de l'utilisateur (`homePathForRole`).
- **Gardes serveur (défense en profondeur)** : `requireRole()` /
  `requireClubAccess()` appelées dans les layouts/pages protégés
  (`/admin`, `/console/:id/**`, `/compte`, `/devis/:ref`, `/reserver/:ref`).

Matrice appliquée :

| Préfixe | Rôle requis | Contrôle fin |
|---|---|---|
| `/admin/**` | `sociuly_admin` | — |
| `/console/:clubId/**` | `club_admin` | `clubId ∈ session.clubIds` (ClubMember) |
| `/compte`, `/devis`, `/reserver` | `org_buyer` | (à venir : scope `organizationId`) |

En **mode maquette** (Supabase non configuré), l'auth n'est pas appliquée :
le middleware passe outre et les gardes sont permissives — la navigation des
écrans reste ouverte (`isAuthEnforced()`).

### 3. Accès aux données — lectures client + policies RLS

**Décision** : modèle **RLS-first**. Les lectures peuvent se faire côté client
avec la clé **anon**, **les Row Level Security policies sont obligatoires** sur
chaque table et constituent la frontière d'autorisation réelle (la clé anon ne
donne accès qu'aux lignes que les policies autorisent, à partir des claims
`app_metadata`). La clé **`service_role`** est réservée aux opérations
d'administration server-only (validation KYC, modération, attribution de rôle) —
jamais exposée au client.

Conséquences :
- Toute table créée DOIT avoir RLS activé + policies avant d'être lue côté client.
- Les claims d'autorisation (`role`, `club_ids`, `organization_id`) doivent être
  présents dans le JWT (cf. Access Token Hook) pour que les policies fonctionnent.

> Cette décision est **bloquée tant que le schéma n'existe pas** : pas de policies
> à écrire sur des tables absentes. Le squelette SQL (trigger + activation RLS +
> exemple de policy) est fourni dans `supabase/migrations/0001_auth_user_trigger.sql`,
> à appliquer **après** la première migration Prisma.

### 4. Création de la ligne `User` au premier login

À la création d'un utilisateur Supabase (`auth.users`), un trigger Postgres
**`on_auth_user_created`** insère la ligne applicative `public.users` et pose le
rôle initial dans `app_metadata`. Le rôle est déduit du contexte d'inscription
(`/inscription-club` → `club_admin`, `/inscription-entreprise` → `org_buyer`),
transmis via `raw_user_meta_data` au moment du `signInWithOtp`/invitation.

## Alternatives écartées

- **Lecture DB du rôle dans le middleware** : coût I/O par requête, et nécessite
  Prisma compatible Edge (incompatible — cf. `.claude/rules/01-tech-stack.md`).
- **Tout server-only via `service_role`** : écarté au profit du modèle RLS-first
  (décision 3), pour permettre des lectures client sûres sans relayer chaque
  requête par un Server Action.

## Fichiers

- `lib/auth/session.ts` — types, `getSession()`, `roleContextFromUser()`, dev stub.
- `lib/auth/rbac.ts` — `checkRouteAccess()`, `homePathForRole()`, gardes serveur.
- `lib/supabase/middleware.ts` — gating après refresh de session.
- `app/auth/callback/route.ts` — redirection post-login par rôle.
- `supabase/migrations/0001_auth_user_trigger.sql` — trigger + squelette RLS (à appliquer post-Prisma).
