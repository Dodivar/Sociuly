# Stack technique — règles à respecter

## Ce qui est en place et autorisé

| Domaine | Outil | Notes |
|---|---|---|
| Framework | Next.js 15 — App Router | Pas de Pages Router |
| Langage | TypeScript 5.6 | Strict, pas de `any` sans justification |
| Runtime UI | React 19 | |
| ORM | Prisma + `@prisma/client` | Supabase PostgreSQL EU-Frankfurt |
| Auth | Supabase Auth + PrismaAdapter | Magic-link via Resend |
| Paiements | Stripe Connect Express (`stripe`) | |
| Email | Resend + React Email (`resend`, `react-email`) | Templates dans `emails/` |
| Validation | Zod | Toutes les entrées : Server Actions, routes API, webhooks |
| Cartes | MapLibre GL JS + MapTiler | Client Component lazy-loadé uniquement |
| Observabilité | Sentry EU + PostHog EU | `@sentry/nextjs`, `posthog-js` |
| Tests | Vitest + @testing-library/react + Playwright + axe-core | |
| Rate-limiting | @upstash/ratelimit + Upstash Redis | Routes sensibles uniquement |
| PDF | @react-pdf/renderer | Reçus, exports comptables |
| Stockage fichiers | Supabase Storage (EU bucket) | Photos de prestations, logos clubs |

## Ce qui est interdit

- **Tailwind CSS** — le projet a son propre système de design CSS (classes `sy-*`). Ne pas installer.
- **CSS-in-JS** (styled-components, emotion, stitches) — non compatible avec la stratégie CSS variable.
- **Redux / Zustand / Jotai / Recoil** — pas de state manager global. Utiliser React state + Server Components. Exception : si un formulaire multi-étapes complexe le nécessite vraiment, poser la question avant d'ajouter une dépendance.
- **clsx / classnames** — le projet utilise `cx()` de `@/lib/cx`. Ne pas introduire d'autres utilitaires de merge de classes.
- **Lodash / Ramda** — utiliser les méthodes natives ES2024.
- **Moment.js** — utiliser `date-fns` si une lib de dates est nécessaire (ou l'API `Intl` native pour les formats simples).
- **Axios** — utiliser `fetch` natif (Next.js l'augmente pour le caching).
- **react-query / SWR** — les routes de données passent par Server Components ou Server Actions. Pour les mutations avec feedback UI, utiliser `useActionState` (React 19).

## Patterns à respecter

### Server Components par défaut
Toute nouvelle page ou composant est un Server Component. Ajouter `"use client"` uniquement
quand l'interactivité le requiert (événements, hooks d'état, MapLibre, Stripe Elements).

### Server Actions pour les mutations
Les formulaires et mutations passent par des Server Actions dans `app/` ou `lib/actions/`.
Pas d'endpoints REST custom sauf pour les webhooks Stripe et les routes nécessitant
un format non-JSON (ex : `/api/bookings/[ref]/receipt.pdf`).

### Validation systématique avec Zod
Chaque Server Action et route API valide ses entrées avec un schéma Zod avant tout traitement.
Les schémas sont co-localisés avec le code qui les utilise ou dans `lib/schemas/`.

### Variables d'environnement
- Toutes les clés secrètes dans `.env.local` (non committé).
- Toutes les variables documentées dans `.env.example` (committé, sans valeurs).
- Les variables exposées au client sont préfixées `NEXT_PUBLIC_` et ne contiennent rien de secret.

### Contrainte commission Stripe
Le calcul `commissionCents = round(totalCents * 0.06)` se fait uniquement côté serveur.
