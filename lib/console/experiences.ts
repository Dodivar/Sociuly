// Cf. SPEC.md §3 — Experience (produit vendu via devis B2B).
// Types et libellés PURS (l'accès Prisma vit dans experiences.server.ts).

export type ExperienceFormat = "demi_journee" | "journee" | "soiree" | "sur_mesure";

export type ExperienceStatus = "draft" | "published" | "paused" | "archived";

export type ExperienceLocation = "at_client" | "at_club" | "at_venue" | "flexible";

export type ExperienceAdmin = {
  id: string;
  slug: string;
  title: string;
  format: ExperienceFormat;
  basePriceCents: number;    // TTC, EUR — prix de départ du devis
  durationMinutes: number;
  location: ExperienceLocation;
  status: ExperienceStatus;
  bookingsCount: number;     // commandes confirmées (tous statuts hors annulé)
  pendingQuotes: number;     // demandes de devis en attente de réponse
  rating?: number;
  reviewsCount: number;
  updatedAt: string;         // ISO
};

export const FORMAT_LABEL: Record<ExperienceFormat, string> = {
  demi_journee: "Demi-journée",
  journee: "Journée",
  soiree: "Soirée",
  sur_mesure: "Sur mesure",
};

export const STATUS_LABEL: Record<ExperienceStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  paused: "En pause",
  archived: "Archivée",
};

export const LOCATION_LABEL: Record<ExperienceLocation, string> = {
  at_client: "Dans l'entreprise",
  at_club: "Au club",
  at_venue: "Sur le site (Arena)",
  flexible: "Flexible",
};

