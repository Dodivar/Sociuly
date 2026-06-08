# Sociuly — Technical Rules (Claude Code)

> This file is automatically loaded into every Claude Code session for this repo.
> While working on this project, strictly follow the constraints below.
> **Business source of truth**: `designs/SPEC.md` + mockups (`designs/Sociuly Site Hi-Fi.html`, `Sociuly Design System.html`, `screen-*.jsx`, `ds-*.jsx`).
> Any divergence between a user request and `SPEC.md` must be flagged before writing code. Never decide on your own.
> The file `.cursor/rules/sociuly.mdc` is the equivalent version for Cursor — keep both in sync whenever either is modified.

> **⚠️ Model v2 (B2B pivot)**: Sociuly is now a **B2B-only** platform that designs and operates **bespoke premium sports experiences for companies**, delivered by local sports clubs (amateur loi 1901 **and** professional clubs). All consumer/individual (B2C) flows are **dropped** (see §2). The existing `screen-*.jsx` mockups still reflect the old B2C marketplace: use them as a **visual** reference (design system, layout) only — their **business logic and copy must be realigned** to this spec before production.

> **Language rule (non-negotiable)**: All user-facing content shipped on the site — UI copy, labels, buttons, form fields, error and success messages, emails, SEO metadata, legal pages — **must be written in French**. This product targets French users only in v1. Code (identifiers, variables, functions, types) stays in English; business-domain comments stay in French (see §12).

---

## 1. Imposed stack (do not substitute)

> Unchanged by the pivot — only the product scope changes.

- **Framework**: Next.js 15 (App Router + React Server Components) in strict TypeScript.
- **DB**: PostgreSQL 16 (Supabase). **ORM**: Prisma.
- **Auth**: Supabase Auth — provider is **email magic link only**, no password in v1.
- **Payments**: Stripe Connect (Express accounts). Commission via `application_fee_amount`. Supports **deposit + balance** (two-step payment). Sandbox first.
- **Emails**: Resend + React Email templates.
- **Storage**: Supabase Storage (bank details/RIB, certificates, photos, quote/invoice PDFs).
- **Search/filters**: Postgres full-text + GIN index (**not Algolia/Meilisearch**).
- **Geo**: PostGIS for km radius.
- **Map**: MapLibre GL JS + **OpenFreeMap** tiles (open-source OSM vector tiles, no API key / no quota, self-hostable). **Forbidden: Google Maps, proprietary Mapbox, MapTiler (dropped — paid above free tier).**
- **PDF**: `@react-pdf/renderer` for quotes and invoices.
- **Hosting**: Vercel (frontend) + Supabase (DB).
- **Observability**: Sentry (errors) + PostHog (analytics).
- **CI/CD**: GitHub Actions + Vercel preview per PR.
- **Rate limiting**: Upstash Redis on `/api/*` (100 req/min/IP by default).

**Forbidden to add without approval**: any ORM other than Prisma, any runtime other than Node/Edge Next, any external icon library, any CSS framework other than Tailwind, any state manager (Redux/Zustand/Jotai) — RSC + URL state first.

---

## 2. Out of scope for v1 — DO NOT implement

Refuse or question any request that touches:
- **Any consumer / individual (B2C) flow.** Sociuly is **B2B only**. No individual booking, no consumer cart, no individual checkout. The buyer is always an `Organization`.
- **Unit prestations sold in self-service / one-click checkout.** The product is the **bespoke experience sold through a quote** — not an instant-booking catalog.
- **Consumer tipping / donation mechanic** ("100% reversé au projet") — removed, it was a B2C pattern.
- Native mobile app (the site is responsive, full stop).
- **Multilingual** (FR only) / **multi-currency** (EUR only).
- Push notifications.
- Internal organization ↔ club messaging (email + quotes only).
- Marketplace beyond **Strasbourg, Nancy, Metz** (3 pilot cities in v1).
- Referrals / promo codes.
- Patronage / tax-deductible donation module (separate, v2).
- Advanced treasurer accounting.
- Design themes `outdoor`, `pitch`, `daybreak` — **only `stade` (navy blue + orange accent) ships in v1 prod**.
- Club replies to reviews (v2).
- Full availability calendar (v1 = simple JSON of recurring days/slots).

If the user asks for one of these: flag it as "out of scope for v1 per SPEC.md §2", propose a v2 ticket, do not code it.

---

## 3. Data model (Prisma)

> No `schema.prisma` exists yet — this is the **target** model to implement, not a migration of existing tables.

Mandatory entities and their invariants — follow strictly (see SPEC.md §4):

- `User`: `role` ∈ `org_buyer | club_admin | sociuly_admin`. `organizationId` nullable (set for `org_buyer`). No `customer` role anymore. A user can be `club_admin` (via `ClubMember`) and/or `org_buyer`.
- `Organization` (buyer company): `siret` (14 chars, unique), `name`, `slug`, `tvaIntracom`, `sector`, `sizeBucket`, billing fields, `primaryContactUserId`.
- `Club` (formerly `Association`; covers amateur AND pro): `clubType` ∈ `association_1901 | club_pro | sasp | autre`, `vatLiable` (bool), `siret` (14 chars, unique), `geo` = PostGIS Point, venue fields (`hasVenue`, `venueCapacity`, `canHostVipMatch`), `status` ∈ `pending_verification | active | suspended`, `corporateReady` (bool, derived), `stripeAccountId`, `bankDetailsVerified`.
- `ClubMember`: `role` ∈ `president | manager | treasurer | member` with strict permissions (see SPEC.md §4). `manager` handles quote requests.
- `Project`: `clubId`, `targetAmount`, `collectedAmount` (cents), `status` ∈ `draft | active | funded | archived`.
- `ExperienceModule` (reusable "moment"): `type` ∈ `presentation_coach | atelier_cohesion | initiation | exercice_adapte | mini_tournoi | match_vip | cocktail | visite_coulisses | masterclass_joueur | autre`, `assetsIncluded` (JSON), `location` ∈ `at_client | at_club | at_venue | flexible`, `priceModel` ∈ `fixed | per_person`, `status`.
- `Experience` (the sold product, composed of segments): `clubId`, `slug`, `format` ∈ `demi_journee | journee | soiree | sur_mesure`, `capacityMin/Max`, `basePriceCents`, `priceModel`, `isTemplate` (bool), `projectId` (nullable), `status` ∈ `draft | published | paused | archived`.
- `ExperienceSegment`: `experienceId`, `order`, `daypart` ∈ `matin | apres_midi | soir`, `moduleId` (nullable), `durationMinutes`, `assetsSnapshot`.
- `Quote`: `quoteNumber` format **`DEV-YYYY-NNNNN`**, `organizationId`, `clubId`, `experienceId` (nullable), `amountHTCents` / `vatCents` / `amountTTCCents`, `feeAmountCents`, `netAmountCents`, `status` ∈ `draft | sent | accepted | refused | expired`, `validUntil`.
- `Booking`: `bookingNumber` format **`SOC-YYYY-NNNNN`**, `quoteId`, `organizationId`, `clubId`, `experienceId`. Amounts: `grossAmountTTCCents` / `vatCents` / `feeAmountCents` / `netAmountCents` + `depositCents`. `status` ∈ `pending_quote | quote_accepted | deposit_paid | confirmed | in_progress | completed | cancelled_by_org | cancelled_by_club | refunded`.
- `Invoice`: sequential legal `invoiceNumber`, `bookingId` (unique), `amountHTCents` / `vatCents` / `amountTTCCents`, `pdfUrl`.
- `Review`: `rating` 1–5, `comment` ≤ 600 chars, `bookingId` unique (max 1 review per booking), `organizationId`.

**All amounts in `cents` (Int)**, never floats. Implicit currency is EUR. **HT / VAT / TTC triplet** is now required (pro clubs are VAT-liable — see §4/§11).

**Critical indexes to create**:
- `Experience(status, format)` + geo join via `Club.geo` (filtered catalog).
- `Booking(organizationId, status)`, `Booking(clubId, requestedDate)`.
- `Quote(organizationId, status)`, `Quote(clubId, status)`.
- `Club(siret)` unique, `Organization(siret)` unique.

---

## 4. Business rules — invariants to code

### Club KYC (before publishing)
`Club.status = 'active'` requires **all 4 conditions**:
1. SIRET verified via the INSEE Sirene API.
2. For `association_1901`: federation affiliation number provided (manual admin validation). For `club_pro` / `sasp`: proof of professional status.
3. Stripe Connect onboarding completed (bank details validated by Stripe).
4. At least one `ClubMember` with `role = 'president'`.

**"Corporate-ready" KYC** (extra gate to sell B2B → sets `corporateReady = true`): valid RC pro insurance certificate, at least one certified instructor declared (BPJEPS / APA diploma per module), ability to issue a compliant invoice.

As long as `status != 'active'` → all `Experience` / `ExperienceModule` stay `draft`. As long as `corporateReady = false` → experiences cannot be set to `published`. Server-side guard is mandatory.

### Sociuly commission
- **6% of the incl.-tax total (TTC)** on every confirmed `Booking`.
- Stripe: `application_fee_amount = Math.round(grossAmountTTCCents * 0.06)` + `transfer_data.destination = club.stripeAccountId`.
- Commission is computed **server-side only**.
- The quote TTC = amount paid by the company. The commission is not surfaced separately to the buyer (but the club sees its net payout).
- **VAT**: `Club.vatLiable` drives whether VAT applies to the prestation. **Open decision (§11)**: exact base + VAT on the Sociuly commission itself → confirm with the accountant. Leave an explicit TODO if you touch the calculation. **Blocking for any amount calculation.**

### Quote & contracting (core B2B flow)
1. Company requests a quote from an `Experience` (template) or fully custom → `Quote (draft/sent)`.
2. Club (`manager`/`president`) adjusts and sends it → `sent`, with `validUntil`.
3. Company accepts → `accepted`, creates `Booking (quote_accepted)`.
4. Deposit payment (default **30%**, see §11) → `deposit_paid`.
5. Balance payment before D−X (see §11) → `confirmed`.
6. On the day: `in_progress` → `completed`.

### Cancellation (B2B terms — replaces the consumer credit)
> ⚠️ Old B2C rules ("1-year club credit", customer no-show) are **removed**. B2B schedule to be validated legally (§11). Default target:
- **Deposit is non-refundable** once the quote is accepted.
- **Company cancellation**: sliding scale by date (e.g. > D−30: deposit withheld; D−30 to D−7: 50%; < D−7: 100%).
- **Club cancellation**: full refund every time + automatic apology email. **3 club cancellations / 6 months → automatic suspension.**

### Payout to clubs
- Automatic **D+1 after `completedAt`** via Stripe transfer.
- `completedAt` = end of the last `ExperienceSegment` (`confirmed → in_progress → completed` transition by cron, based on `requestedDate` + cumulative segment durations).
- 48h post-completion dispute window for the company → blocks the payout, manual admin dispute handling in v1.

### Reviews
- Allowed **only between `completedAt` and D+30**.
- Rating 1–5 mandatory, comment optional (≤ 600 chars).
- Post-hoc moderation (public reporting possible).

### Geo
- Default radius **30 km**, configurable via filter.
- `at_venue` / `at_club` → filter via `Club.geo`. `at_client` → filter via the club's intervention radius that contains the company's point.
- City autocomplete limited to the **3 pilot cities** in v1.

---

## 5. Routes & screens

Canonical routes (see SPEC.md §6). The mockups stay a **visual** reference; their logic/copy must be realigned to B2B. The current `/prestations` and `/associations` routes must be **renamed** (`/experiences`, `/clubs`).

| Route | Auth | Reference screen |
|---|---|---|
| `/` | public | `screen-landing.jsx` (B2B landing) |
| `/experiences` | public | `screen-marketplace.jsx` (experience catalog) |
| `/experiences/[slug]` | public | `screen-detail.jsx` (+ "Demander un devis" CTA) |
| `/clubs/[slug]` | public | `screen-asso.jsx` (club showcase) |
| `/devis/[ref]` | `org_buyer` | (to design — quote tracking) |
| `/reserver/[ref]` | `org_buyer` | `screen-booking.jsx` (deposit/balance payment) |
| `/reserver/[ref]/confirmation` | `org_buyer` | `BookingConfirmDesktop` |
| `/compte` | `org_buyer` | (to design — company space: quotes, invoices, team) |
| `/console/[clubId]/dashboard` | `club_admin` | `screen-dashboard.jsx` |
| `/console/[clubId]/experiences` | `club_admin` | (adapt `prestations`) |
| `/console/[clubId]/devis` | `club_admin` | (to design — incoming quote requests) |
| `/console/[clubId]/reservations` | `club_admin` | (existing) |
| `/console/[clubId]/projets` | `club_admin` | `screen-projects-admin.jsx` |
| `/admin` | `sociuly_admin` | (admin wireframes — KYC, moderation, disputes) |
| `/connexion` | public | (to design, magic link) |
| `/inscription-club` | public | (existing — club onboarding + corporate KYC) |
| `/inscription-entreprise` | public | (to design — organization onboarding) |

Note: route paths stay in French (part of the public URL contract — do not anglicize them).

**Do not create other routes** without flagging it. Pages still to design before coding: `/devis/[ref]`, `/compte`, `/inscription-entreprise`, `/cgu` (pro CGV), `/confidentialite`, `/mentions-legales`.

---

## 6. Design system — strict rules

> Unchanged by the pivot.

- **Tokens**: `designs/ds-tokens.jsx` is canonical. Port them to CSS variables (`globals.css`) + Tailwind variables. **Never regenerate a palette.**
- **Atomic components**: port from `designs/ds-components.jsx` (Btn, Card, Chip, Avatar, Icon, Stars, Progress…).
- **Composite components**: port from `designs/ds-patterns.jsx` (PrestationCard, ProjectCard, AssoCard, TopNav, Footer, BookingCard…). Rename toward "experience / club" vocabulary as you port them.
- **Theme**: `stade` (navy blue + orange accent) only.
- **Fonts** (Google Fonts):
  - Display: **Bricolage Grotesque** (400–800, variable opsz/wdth).
  - Sans: **Geist**.
  - Mono: **JetBrains Mono**.
  - Editorial italic: **Instrument Serif**.
- **Iconography**: use **only** the `Icon` set from `ds-components.jsx`. **Forbidden**: Lucide, Heroicons, Tabler, Phosphor, react-icons.
- **No runtime CSS-in-JS** (emotion, styled-components). Tailwind + CSS modules if needed.
- **Copy**: the mockup copy is B2C — any reuse must be **rewritten in a B2B tone** and approved. No invented product copy without approval.

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
- GDPR: processing register, **3-year retention after last activity**, self-service export & deletion (organization and club side).
- **Never log**: card data, magic-link tokens, raw webhook content.
- Rate limiting `/api/*`: 100 req/min/IP via Upstash Redis.
- Input validation: Zod on every API route and server action.

---

## 9. Imposed implementation order (SPEC.md §12)

Do not skip a step:
1. Tokens → `globals.css` + Tailwind theme.
2. Atomic components (Btn, Card, Chip…).
3. Composite components (ExperienceCard, TopNav…).
4. Screens in this order: **Landing → Experience catalog → Experience detail → Quote request → Contracting/Payment → Confirmation → Club console → Admin**, then Company space and Projects.

---

## 10. Seed data (dev)

The Prisma seed must provide:
- 1 Sociuly admin (`admin@sociuly.fr`).
- 6 verified clubs across the 3 pilot cities, including **at least 1 `club_pro`** (SIG Strasbourg-style basketball, `canHostVipMatch = true`) plus amateur associations.
- 1 `pending_verification` club (to test the admin console).
- 2–3 `ExperienceModule` per club covering key types (`presentation_coach`, `atelier_cohesion`, `initiation`, `mini_tournoi`, `match_vip`, `cocktail`).
- **8 published `Experience`**, including the **full SIG day** (6 segments, §1 example), across `demi_journee` / `journee` / `soiree` formats.
- 6 linked club projects.
- 3 buyer organizations with `org_buyer` users.
- Several `Quote` and `Booking` at different stages (`sent`, `quote_accepted`, `deposit_paid`, `confirmed`, `completed`) + 1 `Invoice`.

---

## 11. Open decisions — DO NOT decide alone

See SPEC.md §11. If a request touches one of these points, **ask before coding**:
- **VAT**: base per `Club.vatLiable` (pro club liable vs loi 1901 exempt) AND VAT on the Sociuly commission — accountant confirmation. **Blocking for amount calculations.**
- **Pro vs amateur scope**: pro clubs only, or pros + amateur associations (current model = both via `Club.clubType`).
- **Deposit & schedule**: deposit % (default 30%), balance due date (D−X).
- **Pro CGV / cancellation scale**: legally validate the sliding scale in §4.
- **VIP / match ticketing**: who provides and collects the tickets (club quota vs Sociuly intermediation), liability, no-show.
- **B2B minimum basket**: floor price per experience (premium positioning).
- **Apple Pay / Google Pay** via Stripe (relevance in B2B where card/transfer dominate).
- **Multi-club per user** (president of several clubs — current model says yes via `ClubMember`).
- **Club rating**: weighted average of experiences or a distinct score.

---

## 12. Expected reflexes during a session

- **Before coding a screen**: open the matching `screen-*.jsx` for the visual, but **realign its logic/copy to B2B** per SPEC.md (the mockups are the old B2C model). Re-read the relevant SPEC.md section.
- **Before adding an npm dependency**: check it is not already covered by the stack in §1 and does not fall under the §1/§6 bans.
- **Before touching the Prisma schema**: check the §3/§4 invariants and that the §3 indexes are present.
- **Before changing an amount or a status**: check the state machine (`Booking.status`, `Quote.status`, `Club.status`, `Experience.status`, `Project.status`) and the allowed transitions in §4.
- **All user-facing site content in French** (UI copy, emails, legal pages); **business-domain comments in French** too. Code identifiers stay in English.
- If a user instruction conflicts with this file → flag the conflict, cite the relevant section, ask for arbitration.
