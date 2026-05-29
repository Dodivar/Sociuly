# Sociuly — Contexte projet

Sociuly est une marketplace B2C/B2B de prestations proposées par des associations sportives
loi 1901. Chaque réservation finance un projet de saison d'un club local (équipement, déplacement,
formation). Lancé sur Strasbourg / Nancy / Metz, déploiement national cible printemps 2027.

## Statut

Phase A (Hi-Fi statique) terminée. Phase B en cours : transformation en produit réel avec
data layer, auth, paiements, console club.

Voir `TODO_PHASE_B.md` pour la feuille de route complète.

## Architecture

- **Framework** : Next.js 15, App Router, SSR/SSG selon les pages
- **Langage** : TypeScript strict — pas de `any`, pas de `@ts-ignore` sans justification
- **BDD** : PostgreSQL sur Supabase (EU — Frankfurt) via Prisma ORM
- **Auth** : Supabase Auth, magic-link email via Resend, PrismaAdapter
- **Paiements** : Stripe Connect Express — commission 6% prélevée côté serveur uniquement
- **Email** : Resend + React Email (templates dans `emails/`)
- **Cartes** : MapLibre GL JS + tuiles MapTiler (lazy-loadé, Client Component)
- **Validation** : Zod — toutes les données entrantes (Server Actions, API routes, webhooks)
- **Observabilité** : Sentry (EU) pour les erreurs, PostHog (EU) pour le product analytics
- **Tests** : Vitest + @testing-library/react (unitaires), Playwright + axe-core (E2E + a11y)
- **Rate-limiting** : @upstash/ratelimit + Upstash Redis sur les routes sensibles

## Structure des dossiers

```
app/                  # Routes Next.js App Router (pages, layouts, Server Actions)
components/
  ds/                 # Design System — seule source de primitives UI
  booking/            # Composants domaine : flow de réservation
  marketplace/        # Composants domaine : listing, filtres, carte
emails/               # Templates React Email
lib/                  # Utilitaires partagés (auth, db, stripe, zod schemas…)
prisma/               # schema.prisma, migrations, seed
```

## Règles importantes

- Les règles de stack et de design system sont dans `.claude/rules/`.
- Respecter la contrainte RGPD : toutes les données personnelles restent en EU.
