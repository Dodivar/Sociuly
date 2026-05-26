# Sociuly — Specification produit & technique

> Document de référence pour le développement. Source de vérité visuelle : `Sociuly Site Hi-Fi.html` + `Sociuly Design System.html`.
> **Toute divergence entre ce document et les maquettes doit être remontée avant implémentation.**

---

## 1. Pitch & promesse

Sociuly est une marketplace qui relie particuliers et entreprises aux **associations sportives loi 1901 locales** pour des prestations de services (BBQ, animations, événements, olympiades, coaching, tournois). Chaque réservation finance un **projet de saison réel** du club (équipement, déplacement, formation).

**Promesse aux trois faces :**
- **Particuliers / entreprises** : réserver une animation près de chez soi, avec un impact local visible.
- **Clubs / associations** : monétiser leurs compétences pour financer leurs projets de saison.
- **Sociuly** : prendre une commission de 6% et garantir la qualité (vérification + paiement sécurisé).

---

## 2. Périmètre v1 (MVP)

### Inclus
- Marketplace publique (liste + filtres + carte) sur **3 villes : Strasbourg, Nancy et Metz**.
- Fiche prestation publique avec lien vers le projet financé et la fiche club.
- Tunnel de réservation + paiement **Stripe** (sandbox d'abord).
- Page de confirmation avec récapitulatif d'impact.
- **Console club** (back-office association) : gestion des prestations, projets, réservations, encaissements.
- **Console admin Sociuly** : validation des clubs (KYC), modération.
- Authentification email + magic link (pas de mot de passe v1).
- Notifications transactionnelles par email (Resend ou équivalent).
- Langue : **FR uniquement**. Devise : **EUR uniquement**.

### Hors-scope v1 (explicite — ne pas implémenter)
- App mobile native (le site doit être responsive, c'est tout).
- Multilingue / multi-devise.
- Notifications push.
- Système de messagerie interne client ↔ club (utiliser email pour v1).
- Marketplace au-delà des 4 villes pilotes.
- Programme de parrainage / codes promo.
- Module mécénat / dons défiscalisés (séparé de la marketplace, à prévoir v2).
- Application "trésorier" comptable avancée.

### Calendrier indicatif
- **v1 (3 mois)** : marketplace + booking + console club + admin.
- **v1.1 (mois 4)** : reviews & ratings, page projets côté public.
- **v2 (printemps 2027)** : déploiement national, mécénat, app mobile.

---

## 3. Stack technique

### Proposition par défaut
- **Front + Back** : **Next.js 15** (App Router, React Server Components) en TypeScript.
- **DB** : **PostgreSQL 16** (hébergé sur Supabase).
- **ORM** : **Prisma**.
- **Auth** : **Auth.js (NextAuth v5)** avec provider email magic link.
- **Paiement** : **Stripe Connect (Express accounts)** — chaque association = un compte connecté ; Sociuly est la plateforme, prélève 6% via `application_fee_amount`.
- **Emails transactionnels** : **Resend** + templates React Email.
- **Stockage fichiers** (RIB, attestations, photos prestations) : **Supabase Storage**.
- **Recherche & filtres** : Postgres full-text + index GIN (pas besoin d'Algolia v1).
- **Géo** : **PostGIS** pour la requête "prestations dans un rayon de X km".
- **Carte** : **MapLibre GL JS** + tuiles MapTiler (pas de Google Maps).
- **Hosting** : **Vercel** (front) + **Supabase** (DB).
- **Observabilité** : **Sentry** (erreurs) + **PostHog** (analytics produit).
- **CI/CD** : GitHub Actions, déploiement preview Vercel par PR.

---

## 4. Modèle de données

### Entités

#### `User`
- `id` (uuid)
- `email` (unique)
- `name`
- `phone` (nullable)
- `role` : `customer` | `club_admin` | `sociuly_admin` (un user peut être à la fois `customer` et `club_admin` via la table `AssociationMember`)
- `createdAt`, `lastLoginAt`

#### `Association`
- `id`
- `name`, `slug` (unique, pour URL)
- `siret` (14 chars, unique)
- `federation` : enum (FFF, FFR, FFHB, FFBB, FFT, autre)
- `federationAffiliationNumber`
- `description` (markdown)
- `coverImageUrl`, `logoUrl`
- `address`, `city`, `postalCode`, `geo` (PostGIS Point)
- `status` : `pending_verification` | `active` | `suspended`
- `stripeAccountId` (Stripe Connect)
- `bankDetailsVerified` (bool)
- `createdAt`

#### `AssociationMember` (join table)
- `userId`, `associationId`
- `role` : `president` | `treasurer` | `member`
- Permissions :
  - `president` : tout faire (créer prestations, modifier asso, voir réservations, retirer membres)
  - `treasurer` : voir finances, gérer projets, créer prestations
  - `member` : voir uniquement

#### `Project` (projet de saison du club)
- `id`
- `associationId`
- `title` (ex: "Tournoi national Espagne U17")
- `description`
- `coverImageUrl`
- `targetAmount` (cents)
- `collectedAmount` (cents, calculé : somme des `Booking.netAmount` liés via leurs `Prestation.projectId`)
- `deadline` (date)
- `status` : `draft` | `active` | `funded` | `archived`
- `createdAt`

#### `Prestation` (service vendu)
- `id`
- `associationId`
- `projectId` (un projet financé par cette prestation, nullable mais fortement encouragé)
- `title`, `slug`
- `category` : enum (`bbq`, `animation_kids`, `olympiades`, `event`, `coaching`, `tournoi`, `buvette`)
- `description` (markdown)
- `priceCents` (montant TTC payé par le client)
- `pricingModel` : `fixed` | `per_person` (v1 : `fixed` only)
- `minParticipants`, `maxParticipants`
- `durationMinutes`
- `images` (array of URLs)
- `location` : `at_client` | `at_club` | `flexible`
- `geoBoundary` (rayon en km dans lequel ils se déplacent, si `at_client`)
- `availability` (JSON : jours / créneaux récurrents) — simple v1, calendrier complet v2
- `cancellationPolicy` : `standard` (J-7 gratuite, après → avoir 1 an) — un seul mode v1
- `status` : `draft` | `published` | `paused` | `archived`
- `createdAt`

#### `Booking`
- `id`, `bookingNumber` (humain : `SOC-2026-00042`)
- `prestationId`, `customerId` (User)
- `requestedDate` (datetime), `participants` (int)
- `addressForService` (si `location = at_client`)
- `grossAmountCents` (montant payé par client)
- `feeAmountCents` (commission Sociuly = 6% du gross)
- `netAmountCents` (versé au club = gross − fee)
- `stripePaymentIntentId`, `stripeTransferId`
- `status` : `pending_payment` | `confirmed` | `cancelled_by_customer` | `cancelled_by_club` | `completed` | `refunded`
- `cancellationDeadline` (datetime, = requestedDate − 7 days)
- `customerNotes`
- `createdAt`, `confirmedAt`, `completedAt`

#### `Review`
- `id`, `bookingId` (unique), `customerId`, `prestationId`, `associationId`
- `rating` (1-5), `comment`
- `publishedAt`

### Relations clés
```
Association 1───* Prestation *───1 Project
Association 1───* AssociationMember *───1 User
Prestation  1───* Booking *───1 User (customer)
Booking     1───0..1 Review
```

### Index critiques
- `Prestation(geo, status, category)` — pour la marketplace filtrée.
- `Booking(customerId, status)`, `Booking(prestationId, requestedDate)`.
- `Association(siret)` unique.

---

## 5. Règles métier

### Vérification d'une association (KYC plateforme)
Avant qu'une asso puisse publier une prestation, **toutes** ces conditions doivent être vraies :
1. SIRET vérifié via API INSEE (Sirene).
2. Numéro d'affiliation fédérale renseigné (vérification manuelle par admin Sociuly).
3. Onboarding Stripe Connect complété (RIB validé par Stripe).
4. Au moins un président identifié (User lié avec rôle `president`).

Tant que `Association.status != 'active'`, ses prestations restent `draft`.

### Commission
- **6% du montant TTC** prélevé sur chaque `Booking` confirmé.
- Implémentation Stripe : `payment_intent` avec `application_fee_amount = round(price * 0.06)` et `transfer_data.destination = association.stripeAccountId`.
- **Pas de TVA sur la commission** (associations loi 1901 exonérées). À reconfirmer avec comptable.
- Affichage prix : **prix TTC visible pour le client = montant payé**. La commission n'est pas surfacée publiquement.

### Annulation
- **Par le client** :
  - Avant `cancellationDeadline` (= J−7) : remboursement intégral.
  - Après : montant retenu et converti en **avoir valable 1 an** chez le même club (pas chez Sociuly).
- **Par le club** : remboursement intégral systématique + email d'excuse automatique. 3 annulations club en 6 mois → suspension.
- **No-show client** : montant retenu, pas d'avoir.

### Versement aux clubs
- Versement **automatique J+1 après `completedAt`** via Stripe transfer.
- `completedAt` = `requestedDate + durationMinutes` (passage automatique de `confirmed` à `completed` par cron).
- Possibilité pour le client de signaler un problème dans les 48h post-completion → bloque le versement, ouvre un litige (process manuel admin Sociuly en v1).

### Reviews
- Le client peut laisser un avis **uniquement après `completedAt`** et **avant J+30**.
- Note minimale 1, max 5. Commentaire optionnel (max 600 caractères).
- Pas de réponse club en v1 (à prévoir v2).
- Modération a posteriori par admin Sociuly (signalement par n'importe qui).

### Géolocalisation
- Le client saisit une ville (autocomplete des 3 villes pilotes) ou utilise sa géoloc.
- Recherche : prestations dont `geo` est dans un rayon de **30 km par défaut** (configurable par filtre).
- Pour les prestations `at_club`, on cherche par `Association.geo`. Pour `at_client`, on filtre par `geoBoundary` qui contient le point client.

---

## 6. Écrans & routes

> Les **9 écrans déjà maquettés** sont la référence visuelle. Chaque URL ci-dessous correspond à un fichier `screen-*.jsx` dans le projet de maquettes.

| Route | Public ? | Écran de référence | Notes |
|---|---|---|---|
| `/` | public | `LandingDesktop` + `LandingDesktop2` + `LandingDesktop3` | Landing 3 sections + footer |
| `/prestations` | public | `MarketplaceDesktop` | Filtres : catégorie, prix, rayon, date |
| `/prestations/[slug]` | public | `DetailDesktop` | Fiche + booking rail sticky |
| `/associations/[slug]` | public | `AssoProfileDesktop` | Profil club + ses prestations + projets |
| `/reserver/[prestationSlug]` | auth | `BookingDesktop` | Tunnel paiement Stripe |
| `/reserver/[bookingNumber]/confirmation` | auth | `BookingConfirmDesktop` | Page post-paiement |
| `/club` | auth (club_admin) | `ClubDashboardDesktop` | Console association |
| `/club/projets` | auth (club_admin) | `ProjectsDesktop` | Gestion projets |
| `/admin` | auth (sociuly_admin) | `AdminDesktop` | KYC, modération |
| `/connexion` | public | (à concevoir, simple) | Email magic link |
| `/inscription-club` | public | (à concevoir, formulaire) | Onboarding asso étape 1 |

### Pages manquantes à concevoir (signaler avant code)
- `/connexion` (login magic link).
- `/inscription-club` (formulaire onboarding asso étape 1 — SIRET, fédération, contact président).
- `/compte` (mes réservations, mes avis, mes coordonnées).
- `/cgu`, `/confidentialite`, `/mentions-legales`.

---

## 7. Design system

- **Tous les tokens** (couleurs, typo, radius, espacements, ombres) sont dans `ds-tokens.jsx`.
- **Composants atomiques** : `ds-components.jsx` (Btn, Card, Chip, Avatar, Icon, Stars, Progress, …).
- **Composants composites** : `ds-patterns.jsx` (PrestationCard, ProjectCard, AssoCard, TopNav, Footer, BookingCard, …).
- **Thème par défaut v1** : `stade` (palette bleu marine + accent orange). Les autres thèmes (`outdoor`, `pitch`, `daybreak`) sont **hors-scope v1**, ne pas les porter en production.

### Fonts
- Display : **Bricolage Grotesque** (Google Fonts, weights 400-800, opsz/wdth variable).
- Sans : **Geist** (Google Fonts).
- Mono : **JetBrains Mono** (Google Fonts).
- Italique éditorial : **Instrument Serif** (utilisé ponctuellement).

### Iconographie
- Set propre, stroke-based, déjà présent dans `ds-components.jsx` (composant `Icon`). **Ne pas importer Lucide / Heroicons** — porter le set existant.

### Responsive
- Maquettes faites en `1440 × ?`. Le code doit faire un breakpoint mobile à `768px` et reprendre les patterns `LandingMobile` / `MobileTopNav`.
- Tablette (~ 1024px) : grilles `repeat(N, 1fr)` deviennent `repeat(N-1, 1fr)`.

---

## 8. Accessibilité

- WCAG 2.1 AA minimum.
- Tous les contrastes du DS sont calculés pour AA — ne pas inventer de couleurs.
- `<details>`/`<summary>` natifs pour les FAQ (déjà en place).
- Hit targets ≥ 44×44px sur mobile.
- Focus visible obligatoire sur tous les éléments interactifs (utiliser `:focus-visible`).
- Tests : axe-core dans la CI, navigation clavier vérifiée manuellement à chaque sprint.

---

## 9. Sécurité

- HTTPS partout (assuré par Vercel).
- Variables sensibles uniquement côté serveur (`process.env` jamais exposé client).
- Stripe : webhooks signés vérifiés via `stripe.webhooks.constructEvent`.
- RGPD : registre des traitements, durée de conservation 3 ans post-dernière activité, export & suppression de compte self-service.
- Rate limiting sur `/api/*` (Upstash Redis ou équivalent) : 100 req/min/IP par défaut.
- Logs : ne pas logger les données carte ni les magic-link tokens.

---

## 10. Données de seed (pour dev)

Fournir un seed Prisma avec :
- 1 admin Sociuly (email : `admin@sociuly.fr`).
- 6 associations vérifiées réparties sur les 4 villes pilotes (cf. `screen-asso.jsx` et `screen-marketplace.jsx` pour les noms : USB Volley, US Cesson HB, RC Rennes XV, etc.).
- 12 prestations publiées couvrant les 7 catégories.
- 8 projets de saison liés.
- 3 utilisateurs clients avec quelques réservations à différents stades (`pending_payment`, `confirmed`, `completed`).
- 1 association en `pending_verification` (pour tester la console admin).

---

## 11. Décisions ouvertes (à arbitrer)

- [ ] **TVA sur la commission** : confirmer exonération avec expert-comptable.
- [ ] **Mode paiement** : Stripe seul, ou aussi Apple Pay / Google Pay ? (Recommandé : oui, c'est gratuit via Stripe Checkout.)
- [ ] **Annulation tardive** : avoir 1 an chez le club, ou avoir convertible chez n'importe quelle asso Sociuly ? (Maquette dit "chez le club" — confirmer.)
- [ ] **Multi-club par user** : un président peut-il gérer plusieurs clubs ? (Modèle actuel dit oui via `AssociationMember`.)
- [ ] **Notation des clubs vs prestations** : note globale du club = moyenne pondérée des notes de ses prestations, ou note distincte ? (Recommandé : calculée.)

---

## 12. Pour Claude Code — instructions de démarrage

1. **Lire ce document en entier**, puis ouvrir `Sociuly Site Hi-Fi.html` dans un navigateur pour comprendre le look & feel.
2. **Initialiser le repo** : Next.js + TS + Prisma + Tailwind (configurer Tailwind pour reprendre les tokens CSS de `ds-tokens.jsx`, ne **pas** régénérer une palette).
3. **Porter le design system avant les pages** : d'abord les tokens en `globals.css` + variables Tailwind, ensuite les composants atomiques (Btn, Card, Chip…), enfin les composites (PrestationCard, TopNav…).
4. **Ordre des écrans** : Landing → Marketplace → Détail prestation → Booking → Confirmation → Console club → Admin. Profil asso et page projets après.
5. **Ne pas inventer de copy** — reprendre les textes des maquettes au mot près en v1. Les modifs éditoriales viendront après revue.
6. **Tester chaque écran sur 1440, 1024, 768, 375** avant de passer au suivant.
