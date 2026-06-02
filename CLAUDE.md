# Sociuly — Technical Rules (Claude Code)

> This file is automatically loaded into every Claude Code session for this repo.
> While working on this project, strictly follow the constraints below.
> **Business source of truth**: `designs/SPEC.md` + mockups (`designs/Sociuly Site Hi-Fi.html`, `Sociuly Design System.html`, `screen-*.jsx`, `ds-*.jsx`).
> Any divergence between a user request and `SPEC.md` must be flagged before writing code. Never decide on your own.
> The file `.cursor/rules/sociuly.mdc` is the equivalent version for Cursor — keep both in sync whenever either is modified.

> **Language rule (non-negotiable)**: All user-facing content shipped on the site — UI copy, labels, buttons, form fields, error and success messages, emails, SEO metadata, legal pages — **must be written in French**. This product targets French users only in v1. Code (identifiers, variables, functions, types) stays in English; business-domain comments stay in French (see §12).

---

## 1. Imposed stack (do not substitute)

- **Framework**: Next.js 15 (App Router + React Server Components) in strict TypeScript.
- **DB**: PostgreSQL 16 (Supabase). **ORM**: Prisma.
- **Auth**: Supabase Auth — provider is **email magic link only**, no password in v1.
- **Payments**: Stripe Connect (Express accounts). Commission via `application_fee_amount`. Sandbox first.
- **Emails**: Resend + React Email templates.
- **Storage**: Supabase Storage (bank details/RIB, certificates, photos).
- **Search/filters**: Postgres full-text + GIN index (**not Algolia/Meilisearch**).
- **Geo**: PostGIS for km radius.
- **Map**: MapLibre GL JS + MapTiler tiles. **Forbidden: Google Maps, proprietary Mapbox.**
- **Hosting**: Vercel (frontend) + Supabase (DB).
- **Observability**: Sentry (errors) + PostHog (analytics).
- **CI/CD**: GitHub Actions + Vercel preview per PR.
- **Rate limiting**: Upstash Redis on `/api/*` (100 req/min/IP by default).

**Forbidden to add without approval**: any ORM other than Prisma, any runtime other than Node/Edge Next, any external icon library, any CSS framework other than Tailwind, any state manager (Redux/Zustand/Jotai) — RSC + URL state first.

---

## 2. Out of scope for v1 — DO NOT implement

Refuse or question any request that touches:
- Native mobile app (the site is responsive, full stop).
- **Multilingual** (FR only) / **multi-currency** (EUR only).
- Push notifications.
- Internal customer ↔ club messaging (email only).
- Marketplace beyond **Strasbourg, Nancy, Metz** (3 pilot cities in v1).
- Referrals / promo codes.
- Patronage / tax-deductible donation module (separate, v2).
- Advanced treasurer accounting.
- Design themes `outdoor`, `pitch`, `daybreak` — **only `stade` (navy blue + orange accent) ships in v1 prod**.
- `pricingModel: per_person` (v1 = `fixed` only).
- Club replies to reviews (v2).
- Full availability calendar (v1 = simple JSON of recurring days/slots).

If the user asks for one of these: flag it as "out of scope for v1 per SPEC.md §2", propose a v2 ticket, do not code it.

---

## 3. Data model (Prisma)

Mandatory entities and their invariants — follow strictly (see SPEC.md §4):

- `User`: `role` ∈ `customer | club_admin | sociuly_admin`. A user can be both `customer` AND `club_admin` via `AssociationMember`.
- `Association`: `siret` (14 chars, unique), `status` ∈ `pending_verification | active | suspended`, `geo` = PostGIS Point, `stripeAccountId`, `bankDetailsVerified`.
- `AssociationMember`: `role` ∈ `president | treasurer | member` with strict permissions (see SPEC.md §4).
- `Project`: `targetAmount`, `collectedAmount` (cents), `status` ∈ `draft | active | funded | archived`.
- `Prestation`: `category` ∈ `bbq | animation_kids | olympiades | event | coaching | tournoi | buvette`, `priceCents` (incl. tax / TTC), `location` ∈ `at_client | at_club | flexible`, `status` ∈ `draft | published | paused | archived`.
- `Booking`: `bookingNumber` in format **`SOC-YYYY-NNNNN`** (human-readable). `status` ∈ `pending_payment | confirmed | cancelled_by_customer | cancelled_by_club | completed | refunded`. Triple amount `grossAmountCents` / `feeAmountCents` / `netAmountCents`.
- `Review`: `rating` 1–5, `comment` ≤ 600 chars, `bookingId` unique (max 1 review per booking).

**All amounts in `cents` (Int)**, never floats. Implicit currency is EUR.

**Critical indexes to create**:
- `Prestation(geo, status, category)` (filtered marketplace).
- `Booking(customerId, status)`, `Booking(prestationId, requestedDate)`.
- `Association(siret)` unique.

---

## 4. Business rules — invariants to code

### Association KYC (before publishing)
`Association.status = 'active'` requires **all 4 conditions**:
1. SIRET verified via the INSEE Sirene API.
2. Federation affiliation number provided (manual admin validation).
3. Stripe Connect onboarding completed (bank details validated by Stripe).
4. At least one `AssociationMember` with `role = 'president'`.

As long as `status != 'active'` → all of the club's `Prestation` records stay `draft`. A server-side guard is mandatory.

### Sociuly commission
- **6% of the incl.-tax price (TTC)** on every confirmed `Booking`.
- Stripe: `application_fee_amount = Math.round(priceCents * 0.06)` + `transfer_data.destination = association.stripeAccountId`.
- **The customer never sees the commission.** Displayed price = amount paid incl. tax.
- No VAT on the commission (loi 1901 nonprofit). To be reconfirmed with the accountant — leave a TODO if you touch the calculation.

### Cancellation
- **Customer before D−7** (`cancellationDeadline = requestedDate - 7 days`): full Stripe refund.
- **Customer after D−7**: amount withheld, converted into a **1-year credit with the same club** (not with Sociuly).
- **Club**: full refund every time + automatic apology email. **3 club cancellations / 6 months → automatic suspension.**
- **Customer no-show**: amount withheld, no credit.

### Payout to clubs
- Automatic **D+1 after `completedAt`** via Stripe transfer.
- `completedAt = requestedDate + durationMinutes` (`confirmed → completed` transition by cron).
- 48h post-completion customer dispute window → blocks the payout, manual admin dispute handling in v1.

### Reviews
- Allowed **only between `completedAt` and D+30**.
- Rating 1–5 mandatory, comment optional (≤ 600 chars).
- Post-hoc moderation (public reporting possible).

### Geo
- Default radius **30 km**, configurable via filter.
- `at_club` → filter via `Association.geo`. `at_client` → filter via `Prestation.geoBoundary` that contains the customer's point.
- City autocomplete limited to the **3 pilot cities** in v1.

---

## 5. Routes & screens

Canonical routes (see SPEC.md §6):

| Route | Auth | Reference screen |
|---|---|---|
| `/` | public | `screen-landing.jsx` (Landing, 3 sections) |
| `/prestations` | public | `screen-marketplace.jsx` |
| `/prestations/[slug]` | public | `screen-detail.jsx` |
| `/associations/[slug]` | public | `screen-asso.jsx` |
| `/reserver/[prestationSlug]` | auth | `screen-booking.jsx` |
| `/reserver/[bookingNumber]/confirmation` | auth | `BookingConfirmDesktop` |
| `/club` | `club_admin` | `screen-dashboard.jsx` |
| `/club/projets` | `club_admin` | `screen-projects-admin.jsx` |
| `/admin` | `sociuly_admin` | (see admin wireframes) |
| `/connexion` | public | (to design, magic link) |
| `/inscription-club` | public | (to design, onboarding) |

Note: route paths stay in French as listed above (they are part of the public URL contract — do not anglicize them).

**Do not create other routes** without flagging it. Pages still to design before coding: `/connexion`, `/inscription-club`, `/compte`, `/cgu`, `/confidentialite`, `/mentions-legales`.

---

## 6. Design system — strict rules

- **Tokens**: `designs/ds-tokens.jsx` is canonical. Port them to CSS variables (`globals.css`) + Tailwind variables. **Never regenerate a palette.**
- **Atomic components**: port from `designs/ds-components.jsx` (Btn, Card, Chip, Avatar, Icon, Stars, Progress…).
- **Composite components**: port from `designs/ds-patterns.jsx` (PrestationCard, ProjectCard, AssoCard, TopNav, Footer, BookingCard…).
- **Theme**: `stade` (navy blue + orange accent) only.
- **Fonts** (Google Fonts):
  - Display: **Bricolage Grotesque** (400–800, variable opsz/wdth).
  - Sans: **Geist**.
  - Mono: **JetBrains Mono**.
  - Editorial italic: **Instrument Serif**.
- **Iconography**: use **only** the `Icon` set from `ds-components.jsx`. **Forbidden**: Lucide, Heroicons, Tabler, Phosphor, react-icons.
- **No runtime CSS-in-JS** (emotion, styled-components). Tailwind + CSS modules if needed.
- **Copy**: reuse the mockup texts **word for word** in v1, in French. No rewording without approval.

### Responsive
- Mockups are based on 1440 px.
- Mobile breakpoint: **768 px** (switch to `LandingMobile` / `MobileTopNav` patterns).
- Tablet ~1024 px: `repeat(N, 1fr)` → `repeat(N-1, 1fr)`.
- Verify each screen at **1440 / 1024 / 768 / 375** before moving on to the next.

---

## 7. Accessibility

- **WCAG 2.1 AA** minimum, non-negotiable.
- DS contrasts are computed for AA → **do not invent colors** outside the tokens.
- FAQ via native `<details>`/`<summary>`.
- Mobile hit targets **≥ 44×44 px**.
- `:focus-visible` mandatory on every interactive element.
- Tests: axe-core in CI, keyboard navigation verified every sprint.

---

## 8. Security

- HTTPS everywhere (Vercel).
- **`process.env` is never exposed to the client.** Prefix with `NEXT_PUBLIC_` only for truly public vars. Double-check.
- Stripe webhooks: **always** signed via `stripe.webhooks.constructEvent(body, sig, secret)`. Reject if the signature is invalid.
- GDPR: processing register, **3-year retention after last activity**, self-service export & deletion.
- **Never log**: card data, magic-link tokens, raw webhook content.
- Rate limiting `/api/*`: 100 req/min/IP via Upstash Redis.
- Input validation: Zod on every API route and server action.

---

## 9. Imposed implementation order (SPEC.md §12)

Do not skip a step:
1. Tokens → `globals.css` + Tailwind theme.
2. Atomic components (Btn, Card, Chip…).
3. Composite components (PrestationCard, TopNav…).
4. Screens in this order: **Landing → Marketplace → Prestation detail → Booking → Confirmation → Club console → Admin**, then Association profile and Projects.

---

## 10. Seed data (dev)

The Prisma seed must provide:
- 1 Sociuly admin (`admin@sociuly.fr`).
- 6 verified associations spread across the pilot cities (realistic names, see `screen-asso.jsx`, `screen-marketplace.jsx`).
- 12 published prestations covering all **7 categories**.
- 8 linked season projects.
- 3 customer users with bookings at different stages (`pending_payment`, `confirmed`, `completed`).
- 1 `pending_verification` association (to test the admin console).

---

## 11. Open decisions — DO NOT decide alone

See SPEC.md §11. If a request touches one of these points, **ask before coding**:
- VAT exemption on the commission (accountant confirmation).
- Apple Pay / Google Pay via Stripe Checkout.
- Late-cancellation credit: same club only, or cross-association.
- Multi-club per user (president of several clubs).
- Club rating: weighted average of prestations or a distinct score.

---

## 12. Expected reflexes during a session

- **Before coding a screen**: open the matching `screen-*.jsx` + re-read the relevant SPEC.md section.
- **Before adding an npm dependency**: check it is not already covered by the stack in §1 and does not fall under the §1/§6 bans.
- **Before touching the Prisma schema**: check the §3/§4 invariants and that the §3 indexes are present.
- **Before changing an amount or a status**: check the state machine (`Booking.status`, `Association.status`, `Prestation.status`, `Project.status`) and the allowed transitions in §4.
- **All user-facing site content in French** (UI copy, emails, legal pages); **business-domain comments in French** too. Code identifiers stay in English.
- If a user instruction conflicts with this file → flag the conflict, cite the relevant section, ask for arbitration.
