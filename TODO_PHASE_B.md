# Sociuly — Phase B TODO

Status snapshot (2026-05-26): Phase A complete + 4 client-flow screens of Phase B
(`/`, `/prestations`, `/prestations/[slug]`, `/reserver/[ref]`,
`/reserver/[ref]/confirmation`) shipped as static/SSR prototypes. Everything below
is needed to move from "interactive Hi-Fi" to "real product".

Ordering is rough priority, not strict sequence — items inside a section can
parallelize once their shared prerequisites are met.

---

## 0. Foundations & infra

- [ ] Provision Postgres (Supabase project, EU region — Frankfurt) with the
      `postgis` extension enabled.
- [ ] Provision Resend account, verify sending domain (`@sociuly.fr`), set up
      DKIM/SPF/DMARC.
- [ ] Provision Stripe account → enable Stripe **Connect Express**, capture
      `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONNECT_CLIENT_ID`.
- [ ] Provision MapTiler account (free tier OK for pilot) → capture
      `MAPTILER_KEY`.
- [ ] Sentry project (errors), PostHog project (product analytics) — both EU
      region. SPEC §10 mandates EU residency.
- [ ] `.env.local` template + `.env.example` checked into repo. Document every
      variable in `README.md`.
- [ ] Add `prisma`, `@prisma/client`, `@auth/core`, `next-auth@5`,
      `@auth/prisma-adapter`, `stripe`, `resend`, `react-email`,
      `maplibre-gl`, `zod`, `@sentry/nextjs`, `posthog-js` to deps.
- [ ] Add `vitest` + `@testing-library/react` + `playwright` + `@axe-core/playwright`.
- [ ] CI: GitHub Actions — lint, typecheck, vitest, playwright (smoke +
      axe-core a11y), prisma migrate dry-run on PR.

---

## 1. Data layer (Prisma)

Schema (`prisma/schema.prisma`) — see SPEC §6 entities:

- [ ] `User` — id, email (unique), name, role (`CUSTOMER` | `CLUB_ADMIN` | `STAFF`),
      createdAt. Hooked to NextAuth adapter tables.
- [ ] `Association` — id, slug, name, siret, ridet, rna, presidentName,
      iban (encrypted at-rest), city, region, geo (PostGIS Point),
      stripeAccountId, stripeAccountStatus, kycCompletedAt, createdAt.
- [ ] `AssociationMember` — userId + associationId + role
      (`OWNER` | `EDITOR`) + joinedAt.
- [ ] `Project` — id, associationId, title, slug, description, goalCents,
      raisedCents, deadline, status (`DRAFT` | `ACTIVE` | `FUNDED` | `ARCHIVED`).
- [ ] `Prestation` — id, associationId, projectId (nullable but recommended),
      title, slug, description (MD), priceCents, currency='EUR',
      category (enum), capacityMin, capacityMax, durationMin, locationKind
      (`HOST_PROVIDED` | `CLUB_VENUE`), city, geo (Point), photos (string[]),
      published (bool), createdAt.
- [ ] `Booking` — id, ref (unique, human, `SOC-YYYY-NNNNN`), prestationId,
      customerId, date (DateTime), participants, locationAddress, message,
      tipCents, totalCents (TTC), commissionCents (6%, snapshot),
      payoutCents (94%, snapshot), stripePaymentIntentId,
      stripeChargeId, status (`PENDING` | `CONFIRMED` | `CANCELLED` | `COMPLETED`),
      createdAt.
- [ ] `Review` — id, bookingId (unique 1:1), authorId, rating (1–5), body,
      createdAt.
- [ ] `Subscription` — newsletter signups: id, email, source, createdAt.
- [ ] **Indexes**: `Prestation(city, published)`, `Prestation` PostGIS GiST
      on geo, `Booking(customerId, status)`, `Booking(prestationId, date)`,
      `Project(associationId, status)`.
- [ ] **Migrations**: `prisma migrate dev` baseline.
- [ ] **Seed** (`prisma/seed.ts`): 3 pilot cities × 2 assos × 3 prestations
      each = 18 prestations, plus 1 admin user (`STAFF`), 1 demo customer.
      Reuse the slugs already linked from `app/prestations/page.tsx` so the
      detail page resolves cleanly.

---

## 2. Auth (NextAuth v5 / Auth.js)

- [ ] `lib/auth.ts` — Auth.js config with `EmailProvider` (Resend transport),
      PrismaAdapter, JWT session strategy, callbacks attaching `role` +
      `associationIds` to the session.
- [ ] `/connexion` page — single email field → POST → `signIn("email", ...)`.
      Use existing `SearchBar` and `Btn` from design system; match landing tone.
- [ ] `/api/auth/[...nextauth]/route.ts` — Auth.js handler.
- [ ] Magic-link email template (`emails/MagicLink.tsx`) via React Email.
- [ ] Middleware (`middleware.ts`) gating `/club/**`, `/admin/**`, `/compte/**`.
- [ ] `/inscription-club` page — multi-step form: SIRET/RNA lookup
      (INSEE API for SIRET validation), legal docs upload, president
      contact, initial project. On submit → create `User` (OWNER) +
      `Association` (`kycCompletedAt: null`) + first `Project (DRAFT)`, then
      kick off Stripe Connect onboarding (see §3).
- [ ] `/compte` — customer self-service: bookings list, edit profile,
      review prompts for completed bookings, GDPR export + delete (SPEC §10).

---

## 3. Stripe Connect & payments

- [ ] `/api/stripe/connect/create` — for `/inscription-club` flow: create
      Express account, return onboarding URL.
- [ ] `/api/stripe/connect/refresh` + `/return` — callback URLs for hosted
      onboarding.
- [ ] `/api/stripe/webhook` — verify signature; handle:
  - `account.updated` → flip `Association.stripeAccountStatus`,
    set `kycCompletedAt` when `charges_enabled && payouts_enabled`.
  - `payment_intent.succeeded` → mark `Booking.status = CONFIRMED`,
    send confirmation emails (customer + club), increment
    `Project.raisedCents`.
  - `payment_intent.payment_failed` → `Booking.status = CANCELLED`,
    notify customer.
  - `charge.refunded` → idempotent rollback of project totals.
- [ ] `/api/bookings/create` — Server Action: validate slot, compute
      `totalCents = priceCents + tipCents`,
      `commissionCents = round(totalCents * 0.06)` (SPEC §5),
      `payoutCents = totalCents - commissionCents`. Create `Booking (PENDING)`,
      create Stripe PaymentIntent with `application_fee_amount = commissionCents`
      and `transfer_data.destination = association.stripeAccountId`.
      Return `clientSecret` + `bookingRef`.
- [ ] Wire `/reserver/[ref]` step 3 (Paiement) to Stripe Elements via
      `@stripe/react-stripe-js`. The current step 3 is a placeholder.
- [ ] Convert `/reserver/[ref]` to use `bookingRef` (not prestation slug) for
      the URL once a `PENDING` booking is created — i.e. flow becomes:
      `/prestations/[slug] → POST /api/bookings/create → /reserver/[ref]`.
- [ ] Receipt PDF: render with `@react-pdf/renderer` server-side; expose at
      `/api/bookings/[ref]/receipt.pdf`. Hook up "Télécharger le reçu" CTA on
      confirmation page.

> **SPEC §5 reminder**: customer must NEVER see the 6% commission line. The
> total they pay = the price displayed. The split is internal. Tests must
> assert no `commission` string leaks into customer-facing HTML.

---

## 4. Marketplace / search / geo

- [ ] Replace `MarketMap` placeholder SVG with MapLibre GL JS + MapTiler
      tiles, lazy-loaded as a Client Component (`"use client"`).
- [ ] `/api/prestations/search` — accepts `?city=&cat=&minPrice=&maxPrice=&sort=&bbox=`,
      uses PostGIS `ST_DWithin` for "near me" and `ST_MakeEnvelope` for bbox
      pans. Pagination via `cursor` (createdAt + id).
- [ ] Wire `/prestations` filter chip bar + Tabs sort to real query params
      (`searchParams` server-side, push state via `useRouter` on client).
- [ ] Full-text search: Postgres `tsvector` column on
      `Prestation(title || description || category)` with trigger;
      `/api/prestations/search` ranks by `ts_rank` when `q` present.
- [ ] Detail page `/prestations/[slug]`: fetch real prestation, hydrate
      gallery/facts/included/reviews. Replace hardcoded copy.
- [ ] Availability: minimum viable = `PrestationSlot` table (prestationId,
      startsAt, capacityRemaining). Listing page only shows prestations with
      ≥1 future slot. Booking step 1 picks a slot.

---

## 5. Club console

- [ ] `/club` — dashboard: at-a-glance project progress, pending bookings,
      upcoming dates, payout balance. Cards from existing DS.
- [ ] `/club/projets` — CRUD for `Project`. Inline editor; preview pane shows
      how the project surfaces on prestation detail pages.
- [ ] `/club/prestations` — CRUD for `Prestation`. Markdown editor, photo
      upload (Supabase Storage, EU bucket), price + category + location.
- [ ] `/club/prestations/[id]/disponibilites` — slot grid editor.
- [ ] `/club/reservations` — booking inbox, statuses, customer message,
      "marquer comme terminée" CTA (triggers review email).
- [ ] `/club/finances` — payouts list (read Stripe Connect balance + transfers),
      downloadable monthly CSV (FEC-style, SPEC §10).
- [ ] `/club/equipe` — manage `AssociationMember` rows.
- [ ] All `/club/**` pages: gate by middleware → require session role
      `CLUB_ADMIN` AND `associationIds.includes(activeAssociationId)`.

---

## 6. Admin console

- [ ] `/admin` — STAFF only. Tabs:
  - **Associations en attente de KYC** — approve/reject + nudge email.
  - **Litiges** — booking disputes list (manual flag for now).
  - **Cohorte** — chart: weekly GMV, take rate, # clubs onboarded, # bookings.
  - **Audit log** — append-only `AuditEvent` table written on sensitive ops
    (refunds, role changes, KYC overrides).
- [ ] `/admin/associations/[id]` — full detail + manual KYC overrides
      (rare, logged).
- [ ] CSV exports for accounting (matches "comptabilité simple" of SPEC §10).

---

## 7. Association public profile

- [ ] `/associations/[slug]` — public page: hero (logo, name, city, verified
      chip), current project with `ImpactHero`, prestations grid (reuse
      `PrestationCard`), reviews aggregate, "à propos" markdown, "écrire au
      club" CTA (rate-limited contact form).
- [ ] Replace the "Voir l'asso" button on `/prestations/[slug]` to link here.

---

## 8. Email & lifecycle

React Email templates (`emails/`):

- [ ] `MagicLink` — auth.
- [ ] `BookingConfirmedCustomer` — sent on `payment_intent.succeeded`.
      Includes receipt link + project progress.
- [ ] `BookingConfirmedClub` — sent to all `OWNER`/`EDITOR` of the asso.
- [ ] `BookingReminder24h` — cron job 24h before slot.
- [ ] `ReviewPrompt` — sent 24h after slot end.
- [ ] `WelcomeClub` — sent on KYC complete.
- [ ] `MonthlyClubDigest` — first of each month: bookings, payouts, reviews.
- [ ] Cron jobs: Vercel Cron or Supabase scheduled functions. Document in
      `CRON.md`.

---

## 9. Static / legal / TODO pages

Currently linked from nav/footer but unbuilt:

- [ ] `/cgu` — Conditions Générales d'Utilisation (clubs + customers).
      Legal review required.
- [ ] `/confidentialite` — RGPD policy. Lists subprocessors (Stripe, Resend,
      Supabase, MapTiler, Sentry, PostHog) per SPEC §10.
- [ ] `/mentions-legales` — éditeur, hébergeur, contact, CNIL.
- [ ] `/aide` — FAQ for clubs + customers (split tabs).
- [ ] `/manifeste` — brand story page (the "why").
- [ ] `/clubs` — landing page for prospective associations
      (separate from `/inscription-club` form).
- [ ] 404 + 500 themed pages (currently default Next 404).

---

## 10. Accessibility, perf, observability

- [ ] axe-core integrated into Playwright suite — fail CI on serious/critical.
- [ ] All inputs labelled (`Field` component already does, audit raw `<input>`s
      in `SiteFooter` newsletter and SearchBar).
- [ ] Color contrast pass on `var(--accent)` on `var(--surface-2)` — Phase A
      uses the design as given, but verify ≥ 4.5:1 for body text.
- [ ] Lighthouse budget: LCP < 2.0s, CLS < 0.05, TTI < 3.0s on `/prestations`
      with cold cache (SPEC §9).
- [ ] Image strategy: replace gradient `<div>` placeholders with `next/image`
      + Supabase Storage signed URLs. Add `sizes` + `priority` on LCP image.
- [ ] Sentry: wrap Server Actions, surface Stripe webhook failures.
- [ ] PostHog: track `prestation_viewed`, `booking_started`, `booking_completed`,
      `tip_added`, with `commissionCents` on internal events only.
- [ ] Rate-limiting middleware (`@upstash/ratelimit` + Upstash Redis):
      `/api/bookings/create` (10/min/IP), contact forms (5/hour/IP),
      auth magic-link request (5/hour/email).
- [ ] CSP headers via `next.config.ts` — allow Stripe, MapTiler, Resend
      tracking pixel domains only.

---

## 11. Known design-system debt picked up during Phase A

- [ ] `Chip`, `Card`, `Tabs` currently expose `onClick` props but the
      consumers in Phase A use them in Server Components. To make
      `onClick` actually wire up on click, those callsites must move into
      a Client Component, OR the components must add `"use client"` and
      we accept the client-bundle cost. Decide per-screen as interactivity
      lands. Current shim conditionally spreads the handler so SSR
      doesn't crash when no handler is passed — see
      `components/ds/components.tsx`.
- [ ] `PrestationCard` heart button is currently a non-interactive `<span>`.
      When "favoris" ships, extract it into a `SavePrestationButton`
      client component and wire to `/api/users/me/favorites`.
- [ ] `SiteFooter` newsletter is a non-submitting `<div>`. When wired,
      convert back to `<form action={subscribeAction}>` using a Server
      Action and create the `Subscription` row.
- [ ] `/reserver/[ref]` step 2 form fields are uncontrolled with
      `defaultValue` only — convert to a Client form (`"use client"`) that
      POSTs to the booking-create Server Action and surfaces validation
      errors per field.
- [ ] `BookingStepper` `active` prop is hardcoded per page. Once the
      booking flow lives behind real state, derive `active` from
      `Booking.status`.

---

## 12. Pilot launch checklist (gate before public open)

- [ ] 3 partner clubs onboarded in Strasbourg, Nancy, Metz with at least
      2 prestations each.
- [ ] 1 end-to-end booking executed in Stripe test mode AND 1 in live mode
      (small €1 transaction, refunded after).
- [ ] Legal review of `/cgu`, `/confidentialite` complete.
- [ ] DPA signed with Supabase, Resend, Stripe.
- [ ] Sentry receiving events; alert on >5 errors/min.
- [ ] Postmortem template (`runbooks/incident.md`) committed.
- [ ] Backup verified: restore Supabase nightly snapshot to a scratch
      project, run `prisma db pull`, diff.
