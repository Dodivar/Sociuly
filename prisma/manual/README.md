# Runbook — Initialisation base Prisma ↔ Supabase

Ordre d'exécution pour connecter le schéma Prisma à la base Supabase. À faire une
fois les variables `DATABASE_URL` et `DIRECT_URL` renseignées dans `.env.local`
(cf. `.env.example` pour le format des deux chaînes — poolée 6543 / directe 5432).

## Pourquoi cet ordre

`Club.geo` est une colonne PostGIS `geography(Point,4326)`. L'extension `postgis`
doit donc exister **avant** que Prisma ne crée la table. Les index géo/full-text,
la RLS et le trigger auth ne sont pas exprimables en DSL Prisma → fichier SQL
manuel `0001_extensions_rls_auth.sql`.

## Étapes

### 1. Activer les extensions (AVANT toute migration)

Dans **Supabase Dashboard → SQL Editor**, exécuter la section **§A** de
`0001_extensions_rls_auth.sql` :

```sql
create extension if not exists postgis;
create extension if not exists pg_trgm;
create extension if not exists pgcrypto;
```

(Ou Dashboard → Database → Extensions → activer `postgis`, `pg_trgm`.)

### 2. Créer les tables

Deux options selon le besoin :

**a) Bootstrap rapide (dev v1) — recommandé pour démarrer :**
```bash
npx prisma db push
```
Synchronise le schéma sans historique de migration ni shadow database (évite les
pièges shadow DB de Supabase). Idéal tant que le schéma bouge encore.

**b) Migrations versionnées (pour la prod) :**
```bash
npx prisma migrate dev --name init
```
⚠️ Sur Supabase, la *shadow database* utilisée par `migrate dev` est recréée vide
et ne contient pas `postgis` → la création de `Club.geo` y échoue. Deux parades :
- éditer le `migration.sql` généré pour préfixer `create extension if not exists postgis;`,
- ou définir un `shadowDatabaseUrl` (base vide dédiée) dans `prisma.config.ts`.

> Conseil : démarrer en **(a)** pendant le dev, puis figer une 1ʳᵉ migration
> baseline en **(b)** quand le schéma est stable.

### 3. Appliquer le SQL manuel (APRÈS création des tables)

Exécuter les sections **§B, §C, §D** de `0001_extensions_rls_auth.sql` dans le
SQL Editor Supabase (index géo + full-text, pont auth `auth.users → public.User`,
RLS deny-by-default + lectures publiques du catalogue).

### 4. Générer le client + seed

```bash
npx prisma generate   # déjà lancé par postinstall
npx prisma db seed     # données de dev (CLAUDE.md §10) — Phase 3
```

## Vérification

- Dashboard Supabase → Table editor : les 12 tables + enums sont présents.
- Créer un utilisateur de test (Auth → magic link) → une ligne apparaît
  automatiquement dans `public.User` (trigger §C OK).
- `select postgis_version();` retourne une version (extension §A OK).

## Côté Vercel (déploiement)

- Définir `DATABASE_URL` (poolée) et `DIRECT_URL` (directe) dans les variables
  d'environnement Vercel (Production / Preview / Development).
- `prisma generate` tourne via le script `postinstall`.
- Migrations en CI/CD : `npx prisma migrate deploy` (script `db:deploy`).
