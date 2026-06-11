// Vue-modèle pur de la fiche club (/clubs/[slug]) — types + helpers SANS Prisma,
// importable par un Client Component (ClubTabs, ClubActions) sans embarquer le
// driver `pg`. La lecture Prisma vit dans `club-detail.server.ts`.
// Tous les montants sont en centimes (Int), jamais de float (SPEC §3).

import type { ExperienceHue } from "@/components/ds/patterns";

/** Carte d'expérience affichée dans l'onglet « Expériences » du club. */
export type ClubExperienceCard = {
  slug: string;
  title: string;
  /** Prix d'appel en euros (TTC) — montant ferme dans le devis (SPEC §5). */
  price: number;
  hue: ExperienceHue;
  categoryLabel: string;
  rating: number;
  reviews: number;
  funds: string;
  goal: number;
};

/** Carte projet affichée dans l'onglet « Projets ». */
export type ClubProjectCard = {
  title: string;
  eyebrow: string;
  raisedCents: number;
  targetCents: number;
  goal: number;
  active: boolean;
  funded: boolean;
};

/** Avis affiché dans l'onglet « Avis ». */
export type ClubReviewCard = {
  id: string;
  name: string;
  date: string;
  rating: number;
  body: string;
  tone: "orange" | "green" | "yellow" | "ink";
};

/** Membre affiché dans l'onglet « Équipe ». */
export type ClubTeamMember = {
  name: string;
  role: string;
  since: string;
  initials: string;
};

export type ClubStat = { value: string; label: string; sub: string };

export type ClubFeaturedProject = {
  title: string;
  raisedCents: number;
  targetCents: number;
  goal: number;
};

/** Fiche club complète (identité + onglets), dérivée des données Prisma réelles. */
export type ClubDetail = {
  slug: string;
  name: string;
  initials: string;
  typeLabel: string;
  /** Sous-ligne factuelle (type, ville, capacité salle…). */
  descriptor: string;
  cityLabel: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  description: string;
  /** Email de contact du club (manager/président). null si aucun membre. */
  contactEmail: string | null;
  stats: ClubStat[];
  featuredProject: ClubFeaturedProject | null;
  experiences: ClubExperienceCard[];
  projects: ClubProjectCard[];
  reviews: ClubReviewCard[];
  team: ClubTeamMember[];
  counts: { experiences: number; projects: number; reviews: number };
};

/** Initiales (max 3 lettres) à partir d'un libellé. */
export function initialsFrom(label: string): string {
  return label
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .join("")
    .slice(0, 3)
    .toUpperCase();
}
