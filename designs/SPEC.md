# Sociuly — Specification produit & technique

> Document de référence pour le développement. Source de vérité visuelle : `Sociuly Site Hi-Fi.html` + `Sociuly Design System.html`.
> **Toute divergence entre ce document et les maquettes doit être remontée avant implémentation.**
>
> ⚠️ **v2 du modèle (pivot B2B)** : Sociuly est désormais une plateforme **B2B uniquement**. Les parcours grand public / particuliers (B2C) sont **abandonnés** (cf. §2). Les maquettes `screen-*.jsx` actuelles reflètent encore l'ancien modèle marketplace grand public : elles servent de référence **visuelle** (design system, mise en page) mais leur **logique métier et leur copy sont à réaligner** sur cette spec avant production.

---

## 1. Pitch & promesse

Sociuly conçoit et opère des **expériences sportives premium sur-mesure pour les entreprises**, délivrées par des **clubs sportifs locaux** — de l'association amateur loi 1901 au club professionnel.

Une **expérience** combine plusieurs **moments** sur une demi-journée, une journée ou une soirée : présentation par un coach, atelier de cohésion, initiation ou exercices adaptés, mini-tournoi, cocktail, accès à un match en places VIP. L'entreprise offre un grand moment fédérateur à ses équipes ; le club monétise ses actifs (coachs, joueurs, infrastructure, accès aux matchs) pour financer ses projets.

**Promesse (B2B — deux faces + Sociuly) :**
- **Entreprises (l'acheteur)** : offrir à leurs équipes un grand moment sportif clé-en-main, à fort impact local (RSE / marque employeur), sans gérer la logistique.
- **Clubs / associations (l'offre)** : monétiser leurs compétences et leurs actifs pour financer un projet réel (centre de formation, équipement, déplacement, projet associatif).
- **Sociuly** : conçoit l'expérience sur-mesure, garantit la qualité (clubs vérifiés, encadrants diplômés, assurance), gère devis / contrat / facture / paiement, et prend une **commission de 6 %**.

### Exemple-cible — journée avec la SIG Strasbourg (basket pro)

> Référence de ce que le produit doit savoir composer et vendre.

**Matin**
- Présentation par un coach de la SIG.
- Atelier « performance collective ».

**Après-midi**
- Exercices de basket adaptés.
- Mini-tournoi.

**Soir**
- Cocktail.
- Match de la SIG avec places VIP.

Cette journée = **une `Experience`** composée de **6 `ExperienceSegment`** répartis sur 3 `daypart` (matin / après-midi / soir), rattachée à un `Club` de type `club_pro`, vendue à une `Organization` via un `Quote` (devis), puis facturée.

---

## 2. Périmètre v1 (MVP)

### Inclus
- **Catalogue d'expériences premium** (templates par club) + configurateur sur-mesure, sur **3 villes : Strasbourg, Nancy, Metz**.
- **Vitrine club** : présentation du club, de ses actifs (infrastructure, coachs, joueurs, accès matchs), des moments proposables et des projets soutenus.
- **Parcours B2B complet** : découverte → demande de devis → devis → contractualisation → paiement (acompte + solde via **Stripe**, sandbox d'abord) → facture.
- **Page de confirmation** avec récapitulatif de l'expérience et de l'impact financé.
- **Console club** (back-office) : gestion des modules/expériences, demandes de devis entrantes, planning, projets, encaissements, factures.
- **Console admin Sociuly** : vérification des clubs (KYC), modération, gestion des litiges.
- **Espace entreprise** : devis, factures, expériences passées, membres de l'organisation.
- Authentification email + magic link (pas de mot de passe v1).
- Notifications transactionnelles par email (Resend).
- Langue : **FR uniquement**. Devise : **EUR uniquement**.

### Hors-scope v1 (explicite — ne pas implémenter)
- **Tout parcours grand public / particulier (B2C).** Sociuly est **B2B uniquement**. Pas de réservation par un particulier, pas de panier grand public.
- **Vente de prestations unitaires en self-service / paiement en un clic.** Le produit est l'**expérience sur-mesure passant par un devis** — pas un catalogue à réservation instantanée.
- **Mécanique de pourboire / don grand public** (« 100 % reversé au projet ») — retirée, c'était une logique B2C.
- App mobile native (le site doit être responsive, c'est tout).
- Multilingue / multi-devise.
- Notifications push.
- Système de messagerie interne entreprise ↔ club (email + devis pour v1).
- Marketplace au-delà des 3 villes pilotes.
- Programme de parrainage / codes promo.
- Module mécénat / dons défiscalisés (séparé, à prévoir v2).
- Application « trésorier » comptable avancée.

### Calendrier indicatif
- **v1 (3 mois)** : catalogue expériences + devis/contractualisation + console club + admin + espace entreprise.
- **v1.1 (mois 4)** : reviews & ratings, page projets côté public, configurateur d'expérience enrichi.
- **v2 (printemps 2027)** : déploiement national, mécénat, app mobile.

---

## 3. Stack technique

> Inchangée par le pivot — seul le périmètre produit change.

- **Front + Back** : **Next.js 15** (App Router, React Server Components) en TypeScript.
- **DB** : **PostgreSQL 16** (hébergé sur Supabase).
- **ORM** : **Prisma**.
- **Auth** : **Supabase Auth** avec provider email magic link.
- **Paiement** : **Stripe Connect (Express accounts)** — chaque club = un compte connecté ; Sociuly est la plateforme, prélève 6 % via `application_fee_amount`. Gestion **acompte + solde** (deux PaymentIntents ou un PaymentIntent capturé en deux temps).
- **Emails transactionnels** : **Resend** + templates React Email.
- **Stockage fichiers** (RIB, attestations, photos, devis/factures PDF) : **Supabase Storage**.
- **Recherche & filtres** : Postgres full-text + index GIN (pas besoin d'Algolia v1).
- **Géo** : **PostGIS** pour la requête « expériences dans un rayon de X km ».
- **Carte** : **MapLibre GL JS** + tuiles MapTiler (pas de Google Maps).
- **PDF** : `@react-pdf/renderer` pour devis et factures.
- **Hosting** : **Vercel** (front) + **Supabase** (DB).
- **Observabilité** : **Sentry** (erreurs) + **PostHog** (analytics produit).
- **CI/CD** : GitHub Actions, déploiement preview Vercel par PR.

---

## 4. Modèle de données

> ⚠️ Aucun `schema.prisma` n'existe encore : ce modèle est la cible à implémenter, pas une migration d'existant.

### Entités

#### `User`
- `id` (uuid)
- `email` (unique)
- `name`
- `phone` (nullable)
- `role` : `org_buyer` | `club_admin` | `sociuly_admin`
- `organizationId` (nullable — rempli pour un `org_buyer`)
- `createdAt`, `lastLoginAt`

> Plus de rôle `customer` (particulier). L'acheteur agit **au nom d'une organisation**. Un même user peut être `club_admin` (via `ClubMember`) et/ou `org_buyer`.

#### `Organization` (entreprise cliente)
- `id`
- `name`, `slug`
- `siret` (14 chars, unique)
- `tvaIntracom` (nullable)
- `sector` (secteur d'activité), `sizeBucket` (tranche d'effectif)
- `billingAddress`, `city`, `postalCode`
- `primaryContactUserId`
- `createdAt`

#### `Club` (anciennement `Association` — englobe amateur ET professionnel)
- `id`
- `name`, `slug` (unique, pour URL)
- `clubType` : `association_1901` | `club_pro` | `sasp` | `autre`
- `legalForm`
- `vatLiable` (bool) — **un club pro/SASP est en général assujetti à la TVA**, une asso loi 1901 généralement exonérée (cf. §5 + §11)
- `siret` (14 chars, unique)
- `federation` : enum (FFF, FFR, FFHB, FFBB, FFT, autre)
- `federationAffiliationNumber` (nullable pour clubs non affiliés)
- `description` (markdown)
- `coverImageUrl`, `logoUrl`
- `address`, `city`, `postalCode`, `geo` (PostGIS Point)
- `hasVenue` (bool), `venueName`, `venueCapacity`, `canHostVipMatch` (bool)
- `status` : `pending_verification` | `active` | `suspended`
- `corporateReady` (bool — calculé, cf. KYC corporate §5 : assurance RC pro, encadrants diplômés, capacité à émettre/recevoir une facture)
- `stripeAccountId` (Stripe Connect)
- `bankDetailsVerified` (bool)
- `createdAt`

#### `ClubMember` (anciennement `AssociationMember`, join table)
- `userId`, `clubId`
- `role` : `president` | `treasurer` | `manager` | `member`
- Permissions :
  - `president` : tout faire (créer modules/expériences, modifier le club, voir devis & réservations, retirer membres)
  - `manager` : gérer les expériences, **répondre aux demandes de devis**, gérer le planning
  - `treasurer` : voir finances, gérer projets, émettre factures
  - `member` : voir uniquement

#### `Project` (projet financé du club)
- `id`
- `clubId`
- `title` (ex : « Centre de formation U17 », « Déplacement coupe d'Europe »)
- `description`
- `coverImageUrl`
- `targetAmount` (cents)
- `collectedAmount` (cents, calculé : somme des `Booking.netAmount` liés via leurs `Experience.projectId`)
- `deadline` (date)
- `status` : `draft` | `active` | `funded` | `archived`
- `createdAt`

#### `ExperienceModule` (brique réutilisable — un « moment » que le club sait délivrer)
- `id`
- `clubId`
- `type` : enum (`presentation_coach`, `atelier_cohesion`, `initiation`, `exercice_adapte`, `mini_tournoi`, `match_vip`, `cocktail`, `visite_coulisses`, `masterclass_joueur`, `autre`)
- `title`, `description`
- `defaultDurationMinutes`
- `assetsIncluded` (JSON : `{ coachs, joueurs, placesVip, materiel }`)
- `capacityMin`, `capacityMax`
- `location` : `at_client` | `at_club` | `at_venue` | `flexible`
- `basePriceCents` (indicatif), `priceModel` : `fixed` | `per_person`
- `status` : `draft` | `published` | `archived`

#### `Experience` (le produit vendu — un « grand moment » composé de modules)
- `id`
- `clubId` (club principal)
- `slug` (unique), `title`
- `summary`, `description` (markdown), `coverImageUrl`, `images` (array)
- `format` : `demi_journee` | `journee` | `soiree` | `sur_mesure`
- `capacityMin`, `capacityMax`
- `basePriceCents` (« à partir de »), `priceModel` : `fixed` | `per_person`
- `isTemplate` (bool — template public vs expérience générée sur-mesure pour un devis)
- `projectId` (projet soutenu, nullable mais fortement encouragé)
- `status` : `draft` | `published` | `paused` | `archived`
- `createdAt`

#### `ExperienceSegment` (un moment ordonné dans une expérience)
- `id`, `experienceId`
- `order` (int), `daypart` : `matin` | `apres_midi` | `soir`
- `moduleId` (ref `ExperienceModule`, nullable si moment libre)
- `title`, `startTime` (nullable), `durationMinutes`
- `assetsSnapshot` (JSON — figé à la composition)

#### `Quote` (devis)
- `id`, `quoteNumber` (humain : `DEV-2026-00042`)
- `organizationId`, `clubId`, `experienceId` (nullable si 100 % sur-mesure)
- `requestedDate` (datetime), `participants` (int)
- `lines` (JSON — lignes de devis)
- `amountHTCents`, `vatCents`, `amountTTCCents`
- `feeAmountCents` (commission Sociuly = 6 % du TTC), `netAmountCents`
- `status` : `draft` | `sent` | `accepted` | `refused` | `expired`
- `validUntil` (date)
- `createdAt`, `sentAt`, `decidedAt`

#### `Booking` (expérience contractualisée)
- `id`, `bookingNumber` (humain : `SOC-2026-00042`)
- `quoteId`, `organizationId`, `clubId`, `experienceId`
- `requestedDate` (datetime), `participants` (int)
- `addressForService` (si `location = at_client`)
- `grossAmountTTCCents` (montant total payé), `vatCents`, `feeAmountCents` (6 % du TTC), `netAmountCents` (versé au club)
- `depositCents` (acompte), `depositPaidAt`, `balancePaidAt`
- `stripePaymentIntentId`, `stripeBalanceIntentId`, `stripeTransferId`
- `status` : `pending_quote` | `quote_accepted` | `deposit_paid` | `confirmed` | `in_progress` | `completed` | `cancelled_by_org` | `cancelled_by_club` | `refunded`
- `cancellationPolicyRef` (CGV pro applicable, cf. §5)
- `customerNotes`
- `createdAt`, `confirmedAt`, `completedAt`

#### `Invoice` (facture)
- `id`, `invoiceNumber` (numérotation légale séquentielle), `bookingId` (unique)
- `amountHTCents`, `vatCents`, `amountTTCCents`
- `issuedAt`, `pdfUrl`

#### `Review`
- `id`, `bookingId` (unique), `organizationId`, `experienceId`, `clubId`
- `rating` (1-5), `comment` (≤ 600 chars)
- `publishedAt`

### Relations clés
```
Organization 1───* User (org_buyer)
Organization 1───* Quote *───1 Club
Organization 1───* Booking *───1 Club
Club 1───* ExperienceModule
Club 1───* Experience *───1 Project
Experience 1───* ExperienceSegment *───0..1 ExperienceModule
Quote 1───0..1 Booking 1───0..1 Invoice
Booking 1───0..1 Review
Club 1───* ClubMember *───1 User
```

### Index critiques
- `Experience(status, format)` + jointure géo via `Club.geo` — pour le catalogue filtré.
- `Booking(organizationId, status)`, `Booking(clubId, requestedDate)`.
- `Quote(organizationId, status)`, `Quote(clubId, status)`.
- `Club(siret)` unique, `Organization(siret)` unique.

### Règle montants
**Tous les montants en `cents` (Int)**, jamais en float. Devise implicite EUR. **Triplet HT / TVA / TTC** désormais nécessaire (un club pro est assujetti à la TVA — cf. §5/§11).

---

## 5. Règles métier

### Vérification d'un club (KYC plateforme)
Avant qu'un club puisse publier une expérience vendable, **toutes** ces conditions doivent être vraies (`Club.status = 'active'`) :
1. SIRET vérifié via API INSEE (Sirene).
2. Pour une `association_1901` : numéro d'affiliation fédérale renseigné (vérif. manuelle admin). Pour un `club_pro` / `sasp` : justificatif de statut professionnel.
3. Onboarding Stripe Connect complété (RIB validé par Stripe).
4. Au moins un responsable identifié (User lié, rôle `president`).

**KYC « corporate-ready »** (gate supplémentaire pour vendre du B2B → passe `corporateReady = true`) :
- Attestation d'assurance RC pro à jour.
- Au moins un encadrant diplômé déclaré (BPJEPS / diplôme APA selon le module).
- Capacité à émettre une facture conforme.

Tant que `Club.status != 'active'`, ses `Experience` et `ExperienceModule` restent `draft`. Tant que `corporateReady = false`, les expériences ne peuvent pas être passées en `published`. Garde-fou serveur obligatoire.

### Commission
- **6 % du montant TTC** prélevé sur chaque `Booking` confirmé.
- Implémentation Stripe : `application_fee_amount = round(grossAmountTTC * 0.06)` et `transfer_data.destination = club.stripeAccountId`.
- Le calcul de commission se fait **uniquement côté serveur**.
- Affichage : le montant TTC du devis = montant payé par l'entreprise. La commission n'est pas surfacée séparément à l'acheteur (mais le club la voit dans son décompte net).
- **TVA** : `Club.vatLiable` pilote l'application de la TVA sur la prestation. **Décision ouverte (§11)** : assiette précise + TVA sur la commission Sociuly elle-même → à confirmer avec l'expert-comptable. Laisser un TODO explicite si on touche au calcul.

### Devis & contractualisation (cœur du parcours B2B)
1. L'entreprise demande un devis depuis une `Experience` (template) ou en sur-mesure → `Quote (status = draft/sent)`.
2. Le club (rôle `manager`/`president`) ajuste et envoie le devis → `sent`, avec `validUntil`.
3. L'entreprise accepte → `accepted`, création du `Booking (status = quote_accepted)`.
4. Paiement **acompte** (par défaut **30 %**, cf. §11) → `deposit_paid`.
5. Paiement du **solde** avant J−X (cf. §11) → `confirmed`.
6. Jour J : `in_progress` → `completed`.

### Annulation (CGV pro — remplace l'avoir grand public)
> ⚠️ Les anciennes règles B2C (« avoir 1 an chez le club », no-show particulier) sont **supprimées**. Barème B2B à valider juridiquement (§11). Cible par défaut :
- **Acompte non-remboursable** une fois le devis accepté.
- **Annulation entreprise** : barème dégressif selon la date (ex. > J−30 : acompte retenu ; J−30 à J−7 : 50 % ; < J−7 : 100 %).
- **Annulation club** : remboursement intégral systématique + email d'excuse automatique. **3 annulations club en 6 mois → suspension.**

### Versement aux clubs
- Versement **automatique J+1 après `completedAt`** via Stripe transfer.
- `completedAt` = fin du dernier `ExperienceSegment` (passage automatique `confirmed → in_progress → completed` par cron, sur la base de `requestedDate` + durée cumulée des segments).
- Fenêtre de litige entreprise de **48h post-completion** → bloque le versement, ouvre un litige (process manuel admin Sociuly en v1).

### Reviews
- L'entreprise peut laisser un avis **uniquement après `completedAt`** et **avant J+30**.
- Note 1–5 obligatoire, commentaire optionnel (max 600 caractères).
- Pas de réponse club en v1 (à prévoir v2).
- Modération a posteriori par admin Sociuly (signalement possible).

### Géolocalisation
- L'entreprise saisit une ville (autocomplete des 3 villes pilotes) ou utilise sa géoloc.
- Recherche : expériences dont le `Club.geo` est dans un rayon de **30 km par défaut** (configurable par filtre).
- Pour les modules `at_venue` / `at_club`, on filtre par `Club.geo`. Pour `at_client`, on filtre par le rayon d'intervention du club contenant le point de l'entreprise.

---

## 6. Écrans & routes

> Les écrans `screen-*.jsx` restent la référence **visuelle** (DS, layout). Leur **logique et leur copy** doivent être réalignées B2B. Les routes `/prestations` et `/associations` du code actuel sont à **renommer** (`/experiences`, `/clubs`).

| Route | Auth | Écran de référence | Notes |
|---|---|---|---|
| `/` | public | `screen-landing.jsx` | Landing B2B (« Offrez un grand moment à vos équipes ») |
| `/experiences` | public | `screen-marketplace.jsx` | Catalogue d'expériences. Filtres : club, format (demi-journée/journée/soirée), thème, ville, capacité |
| `/experiences/[slug]` | public | `screen-detail.jsx` | Fiche expérience + segments + CTA **« Demander un devis »** |
| `/clubs/[slug]` | public | `screen-asso.jsx` | Vitrine club : actifs, infra, moments proposables, projets |
| `/devis/[ref]` | auth (org) | (à concevoir) | Suivi d'un devis (statut, échanges, acceptation) |
| `/reserver/[ref]` | auth (org) | `screen-booking.jsx` | Contractualisation + paiement acompte/solde (Stripe) |
| `/reserver/[ref]/confirmation` | auth (org) | `BookingConfirmDesktop` | Page post-paiement |
| `/compte` | auth (org) | (à concevoir) | Espace entreprise : devis, factures, expériences, équipe |
| `/console/[clubId]/dashboard` | auth (club_admin) | `screen-dashboard.jsx` | Console club |
| `/console/[clubId]/experiences` | auth (club_admin) | (adapter `prestations`) | Modules & expériences |
| `/console/[clubId]/devis` | auth (club_admin) | (à concevoir) | Demandes de devis entrantes (accepter/contre-proposer) |
| `/console/[clubId]/reservations` | auth (club_admin) | (existant) | Réservations + factures |
| `/console/[clubId]/projets` | auth (club_admin) | `screen-projects-admin.jsx` | Gestion projets |
| `/admin` | auth (sociuly_admin) | `AdminDesktop` | KYC clubs, modération, litiges |
| `/connexion` | public | (à concevoir) | Email magic link |
| `/inscription-club` | public | (existant) | Onboarding club (SIRET, type, fédération/statut, responsable, KYC corporate) |
| `/inscription-entreprise` | public | (à concevoir) | Onboarding organisation (SIRET, contact, facturation) |

> Les chemins d'URL restent en français (contrat d'URL public). Ne pas créer d'autres routes sans signaler.

### Pages encore à concevoir (signaler avant code)
- `/devis/[ref]`, `/compte`, `/inscription-entreprise`.
- `/cgu` (CGV **pro**), `/confidentialite`, `/mentions-legales`.

---

## 7. Design system

> Inchangé par le pivot.

- **Tous les tokens** (couleurs, typo, radius, espacements, ombres) sont dans `ds-tokens.jsx`.
- **Composants atomiques** : `ds-components.jsx` (Btn, Card, Chip, Avatar, Icon, Stars, Progress, …).
- **Composants composites** : `ds-patterns.jsx` (PrestationCard, ProjectCard, AssoCard, TopNav, Footer, BookingCard, …). À réutiliser/renommer vers le vocabulaire « expérience / club » au fil du portage.
- **Thème par défaut v1** : `stade` (palette bleu marine + accent orange). Les autres thèmes (`outdoor`, `pitch`, `daybreak`) sont **hors-scope v1**.

### Fonts
- Display : **Bricolage Grotesque** (Google Fonts, weights 400-800, opsz/wdth variable).
- Sans : **Geist** (Google Fonts).
- Mono : **JetBrains Mono** (Google Fonts).
- Italique éditorial : **Instrument Serif** (ponctuel).

### Iconographie
- Set propre, stroke-based, dans `ds-components.jsx` (composant `Icon`). **Ne pas importer Lucide / Heroicons.**

### Responsive
- Maquettes faites en `1440 × ?`. Breakpoint mobile à `768px` (patterns `LandingMobile` / `MobileTopNav`).
- Tablette (~1024px) : grilles `repeat(N, 1fr)` → `repeat(N-1, 1fr)`.

---

## 8. Accessibilité

- WCAG 2.1 AA minimum.
- Contrastes du DS calculés pour AA — ne pas inventer de couleurs.
- `<details>`/`<summary>` natifs pour les FAQ.
- Hit targets ≥ 44×44px sur mobile.
- Focus visible obligatoire sur tous les éléments interactifs (`:focus-visible`).
- Tests : axe-core dans la CI, navigation clavier vérifiée manuellement à chaque sprint.

---

## 9. Sécurité

- HTTPS partout (Vercel).
- Variables sensibles uniquement côté serveur (`process.env` jamais exposé client).
- Stripe : webhooks signés vérifiés via `stripe.webhooks.constructEvent`.
- RGPD : registre des traitements, conservation 3 ans post-dernière activité, export & suppression self-service (côté organisation et club).
- Rate limiting sur `/api/*` (Upstash Redis) : 100 req/min/IP par défaut.
- Logs : ne pas logger les données carte ni les magic-link tokens.
- Validation Zod sur toutes les routes API et server actions.

---

## 10. Données de seed (pour dev)

Fournir un seed Prisma avec :
- 1 admin Sociuly (email : `admin@sociuly.fr`).
- 6 clubs vérifiés répartis sur les 3 villes pilotes, dont **au moins 1 `club_pro`** (ex. type SIG Strasbourg, basket) avec `canHostVipMatch = true`, et des associations amateur.
- 1 club en `pending_verification` (pour tester la console admin).
- Pour chaque club : 2–3 `ExperienceModule` couvrant les types clés (`presentation_coach`, `atelier_cohesion`, `initiation`, `mini_tournoi`, `match_vip`, `cocktail`).
- **8 `Experience` publiées**, dont la **journée SIG complète** (6 segments, exemple §1), couvrant les formats `demi_journee` / `journee` / `soiree`.
- 6 projets de club liés.
- 3 organisations clientes avec users `org_buyer`.
- Quelques `Quote` et `Booking` à différents stades (`sent`, `quote_accepted`, `deposit_paid`, `confirmed`, `completed`) + 1 `Invoice`.

---

## 11. Décisions ouvertes (à arbitrer — NE PAS trancher seul)

- [ ] **TVA** : assiette exacte selon `Club.vatLiable` (club pro assujetti vs asso loi 1901 exonérée) **et** TVA sur la commission Sociuly → confirmer avec expert-comptable. **Bloquant pour tout calcul de montant.**
- [ ] **Clubs pros vs amateurs** : périmètre v1 = clubs pros uniquement, ou pros + associations amateur ? (Modèle actuel = les deux via `Club.clubType`.)
- [ ] **Acompte & échéancier** : % d'acompte (défaut proposé 30 %), date limite de paiement du solde (J−X).
- [ ] **CGV pro / barème d'annulation** : valider juridiquement le barème dégressif §5.
- [ ] **Places VIP / billetterie match** : qui fournit et encaisse les places (le club via son quota, ou Sociuly intermédie) ? Responsabilité, assurance, no-show.
- [ ] **Panier minimum B2B** : montant plancher d'une expérience (positionnement premium).
- [ ] **Apple Pay / Google Pay** via Stripe (pertinence en B2B où le virement/CB pro domine).
- [ ] **Multi-club par user** : un responsable peut-il gérer plusieurs clubs ? (Modèle actuel dit oui via `ClubMember`.)
- [ ] **Notation club vs expérience** : note globale du club = moyenne pondérée, ou note distincte ?

---

## 12. Pour Claude Code — instructions de démarrage

1. **Lire ce document en entier**, puis ouvrir `Sociuly Site Hi-Fi.html` pour le look & feel. Garder à l'esprit que la **logique métier des maquettes est l'ancien modèle B2C** : ne porter que le visuel, réaligner la logique sur cette spec.
2. **Initialiser le repo** : Next.js + TS + Prisma (porter les tokens CSS de `ds-tokens.jsx`, ne **pas** régénérer de palette).
3. **Porter le design system avant les pages** : tokens en `globals.css`, puis composants atomiques, puis composites.
4. **Ordre des écrans** : Landing → Catalogue expériences → Détail expérience → Demande de devis → Contractualisation/Paiement → Confirmation → Console club → Admin. Espace entreprise et page projets après.
5. **Ne pas inventer de copy produit** sans validation — mais la copy des maquettes étant B2C, toute reprise doit être **réécrite en ton B2B** et validée.
6. **Tester chaque écran sur 1440, 1024, 768, 375** avant de passer au suivant.
