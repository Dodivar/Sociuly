// Détail d'une expérience publiée — source de vérité front v1 pour la page
// /experiences/[slug]. Cf. SPEC.md §3 (Experience / ExperienceSegment) et §6
// (page détail + CTA « Demander un devis »).
//
// TODO(api): remplacer getExperienceBySlug par un fetch Prisma
// (Experience.status='published' + jointure Club + Project + Review). Garder la
// signature async et les enums alignés sur le schéma. Tous les montants sont en
// centimes (Int), jamais de float (SPEC §3).

import type { ExperienceHue } from "@/components/ds/patterns";

// ─────── Modèle de prix (SPEC §3 — Experience.priceModel) ───────
export type PriceModel = "per_person" | "fixed";

// ─────── Lieu d'exécution (SPEC §3 — Experience/ExperienceModule.location) ───────
// `at_client` = chez l'entreprise (adresse à renseigner), `at_club` / `at_venue`
// = dans les installations du club, `flexible` = au choix de l'acheteur.
export type ExperienceLocation = "at_client" | "at_club" | "at_venue" | "flexible";

// ─────── Une photo de la galerie (mock : dégradé + calque SVG) ───────
export type GalleryPhoto = {
  id: string;
  /** Légende affichée dans le viewer (alt). */
  label: string;
  /** Dégradé CSS de fond (mock du futur Supabase Storage). */
  gradient: string;
  /** Calque décoratif optionnel (réservé à la photo principale). */
  feature?: boolean;
};

// ─────── Un créneau disponible (mock du JSON de disponibilités, SPEC §2) ───────
export type ExperienceSlot = {
  /** Date ISO yyyy-mm-dd. */
  date: string;
  /** Heure de début HH:mm. */
  time: string;
};

// ─────── Un avis (SPEC §3 — Review) ───────
export type ExperienceReview = {
  id: string;
  author: string;
  date: string;
  rating: number;
  body: string;
  tone: "green" | "orange" | "yellow" | "ink";
};

export type ExperienceClub = {
  slug: string;
  name: string;
  initials: string;
  /** Libellé public du type de club (SPEC §3 — Club.clubType). */
  typeLabel: string;
  experienceCount: number;
  responseTime: string;
  tone: "green" | "orange" | "yellow" | "ink";
};

export type ExperienceProject = {
  /** Slug du club hôte (le projet vit sur la fiche club en v1). */
  clubSlug: string;
  title: string;
  raisedCents: number;
  targetCents: number;
  /** Avancement 0..1 (collected / target). */
  goal: number;
};

export type ExperienceDetail = {
  /** Id catalogue (MarketplaceExperience.id) — clé des favoris localStorage. */
  id: string;
  slug: string;
  title: string;
  categoryLabel: string;
  cityLabel: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  hue: ExperienceHue;
  /** Format commercial (SPEC §3 — Experience.format). */
  format: string;
  /** Lieu d'exécution (SPEC §3) — pilote la collecte d'adresse dans le tunnel. */
  location: ExperienceLocation;
  /** Libellé public du lieu côté club (« Rhénus Sport · Strasbourg »). */
  venueLabel: string;
  capacityMin: number;
  capacityMax: number;
  priceModel: PriceModel;
  /** Prix au participant (per_person) en centimes. */
  pricePerPersonCents: number;
  /** Prix forfaitaire (fixed) en centimes. */
  basePriceCents: number;
  /** « À partir de » TTC en centimes (prix d'appel affiché). */
  fromPriceCents: number;
  facts: Array<[string, string, "users" | "calendar" | "pin" | "check"]>;
  description: string[];
  included: string[];
  photos: GalleryPhoto[];
  slots: ExperienceSlot[];
  club: ExperienceClub;
  project: ExperienceProject;
  reviews: ExperienceReview[];
};

// ─────── Helpers ───────
export const eur = (cents: number) =>
  `${(cents / 100).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;

/** Centimes → euros lisibles avec décimales (factures / récap). */
export const eurDecimal = (cents: number) =>
  `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

