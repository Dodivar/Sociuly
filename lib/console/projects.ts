// Projets de la console club — types PURS (l'accès Prisma vit dans projects.server.ts).
// SPEC §3 — entité Project : `status ∈ draft | active | funded | archived`,
// montants en cents. La variante visuelle "à venir" est portée via le flag dérivé
// `upcoming` sur un projet `draft` (campagne pas encore ouverte).

export type ProjectStatus = "draft" | "active" | "funded" | "archived";

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  status: ProjectStatus;
  upcoming?: boolean;
  raisedCents: number;
  targetCents: number;
  /** Libellé court affiché en tête de carte : "12j", "à ouvrir", null si N/A. */
  remainingLabel: string | null;
};

export type LinkedExperience = {
  id: string;
  title: string;
  priceEuros: number;
  bookingsCount: number;
  totalEuros: number;
  hue: "green" | "orange" | "yellow" | "teal";
};

export type ProjectUpdate = {
  id: string;
  date: string;
  title: string;
  body?: string;
  done?: boolean;
};

export type ProjectDetail = ProjectListItem & {
  description: string;
  supportersCount: number;
  viewsCount: number;
  viewsWeeklyDeltaPercent: number;
  linkedExperiences: LinkedExperience[];
  updates: ProjectUpdate[];
};


