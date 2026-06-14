# ADR 0001 — Résolution de rôle & RBAC

**Statut** : accepté (v1) — résolution DB autoritaire en place (maj 2026-06-14)
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

### 1. Deux sources cohérentes — claims JWT (Edge) + lecture DB autoritaire (Node)

Le rôle (`org_buyer | club_admin | sociuly_admin`) et les rattachements
(`club_ids[]`, `organization_id`) sont disponibles via deux chemins, par couche :

- **Middleware (Edge, chaque requête)** : `roleContextFromUser()` (pure, zéro I/O)
  lit les claims **`app_metadata`** du JWT Supabase. Pas d'aller-retour DB
  (Prisma incompatible Edge — cf. `.claude/rules/01-tech-stack.md`), barrage rapide.
- **Serveur (layouts/gardes/actions, Node)** : `getSession()` lit la **base via
  Prisma** (`lib/auth/resolve.server.ts`) — `User.role` + `User.organizationId`
  + `ClubMember[].clubId`. C'est la **source de vérité autoritaire** : fraîche
  même si le JWT est périmé (rattachement org récent, ajout multi-club avant
  réémission du token). Import **dynamique** pour garder Prisma hors du graphe
  Edge ; lecture **mémoïsée par requête** (`react/cache`).

Pourquoi conserver `app_metadata` :

- `app_metadata` n'est **pas modifiable par l'utilisateur** (contrairement à
  `user_metadata`) → sûr pour porter une autorisation.
- C'est la **fondation des policies RLS** (cf. décision 3) : les mêmes claims
  servent côté Postgres (`auth.jwt() -> 'app_metadata'`).

**Repli** : si la base est injoignable (build sans DB, incident transitoire),
`getSession()` retombe sur les claims JWT — on ne verrouille pas un utilisateur
légitime. En dev sans Supabase configuré, `getSession()` renvoie une **session de
démo** pilotable par `DEV_AUTH_ROLE` pour garder la maquette navigable.

Alimentation des claims (production) : le trigger `on_auth_user_created` pose le
rôle initial dans `app_metadata`, et l'**Access Token Hook**
`custom_access_token_hook` rafraîchit `role`/`club_ids`/`organization_id` à chaque
émission de JWT — cf. `prisma/manual/0001_extensions_rls_auth.sql` (§C, §E).

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
| `/compte`, `/devis`, `/reserver` | `org_buyer` | scope `organizationId` (getters /compte + ownership `/devis/:ref`, anti-IDOR) |

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

- `lib/auth/session.ts` — types, `getSession()` (résolution DB autoritaire + repli claims, mémoïsée), `roleContextFromUser()` (claims, Edge), dev stub.
- `lib/auth/resolve.server.ts` — `resolveSessionFromDb()` : lecture Prisma `User.role` / `User.organizationId` / `ClubMember[].clubId` (server-only).
- `lib/auth/access.ts` — `checkRouteAccess()`, `homePathForRole()` (pur, importé par le middleware Edge).
- `lib/auth/rbac.ts` — gardes serveur `requireSession/requireRole/requireClubAccess`.
- `lib/account/org.ts` — `currentOrgId()` : organisation de la session (scope /compte, /devis).
- `lib/supabase/middleware.ts` — gating après refresh de session (claims JWT).
- `app/auth/callback/route.ts` — redirection post-login par rôle.
- `prisma/manual/0001_extensions_rls_auth.sql` — **source unique** : pont Auth (§C), RLS (§D), Access Token Hook (§E). À appliquer post-migration (runbook `prisma/manual/README.md`).
- `supabase/migrations/0001_auth_user_trigger.sql` — déprécié (pointeur vers le fichier canonique).
