// Cf. SPEC.md §3 — Experience (produit vendu via devis B2B).
// TODO(api): remplacer par fetch DB (Prisma). Garder la signature async + les enums alignés sur le schéma.

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

export async function getExperiences(_clubId: string): Promise<ExperienceAdmin[]> {
  return [
    {
      id: "x1",
      slug: "journee-immersion-sig",
      title: "Journée immersion · SIG",
      format: "journee",
      basePriceCents: 480000,
      durationMinutes: 360,
      location: "at_venue",
      status: "published",
      bookingsCount: 14,
      pendingQuotes: 1,
      rating: 4.9,
      reviewsCount: 12,
      updatedAt: "2026-05-22T10:14:00Z",
    },
    {
      id: "x2",
      slug: "match-vip-hospitalites",
      title: "Match VIP & hospitalités",
      format: "soiree",
      basePriceCents: 240000,
      durationMinutes: 240,
      location: "at_venue",
      status: "published",
      bookingsCount: 6,
      pendingQuotes: 2,
      rating: 4.9,
      reviewsCount: 5,
      updatedAt: "2026-05-18T08:02:00Z",
    },
    {
      id: "x3",
      slug: "atelier-cohesion-equipe",
      title: "Atelier cohésion d'équipe",
      format: "demi_journee",
      basePriceCents: 120000,
      durationMinutes: 180,
      location: "flexible",
      status: "published",
      bookingsCount: 9,
      pendingQuotes: 0,
      rating: 4.9,
      reviewsCount: 7,
      updatedAt: "2026-05-12T16:40:00Z",
    },
    {
      id: "x4",
      slug: "initiation-basket-encadree",
      title: "Initiation basket encadrée",
      format: "demi_journee",
      basePriceCents: 90000,
      durationMinutes: 150,
      location: "at_club",
      status: "paused",
      bookingsCount: 4,
      pendingQuotes: 0,
      rating: 4.6,
      reviewsCount: 4,
      updatedAt: "2026-04-30T11:00:00Z",
    },
    {
      id: "x5",
      slug: "masterclass-joueur-pro",
      title: "Masterclass joueur pro",
      format: "demi_journee",
      basePriceCents: 180000,
      durationMinutes: 120,
      location: "at_venue",
      status: "draft",
      bookingsCount: 0,
      pendingQuotes: 0,
      reviewsCount: 0,
      updatedAt: "2026-05-28T09:20:00Z",
    },
    {
      id: "x6",
      slug: "seminaire-sur-mesure",
      title: "Séminaire sur mesure",
      format: "sur_mesure",
      basePriceCents: 350000,
      durationMinutes: 480,
      location: "flexible",
      status: "draft",
      bookingsCount: 0,
      pendingQuotes: 0,
      reviewsCount: 0,
      updatedAt: "2026-05-26T14:50:00Z",
    },
    {
      id: "x7",
      slug: "cocktail-visite-coulisses",
      title: "Cocktail & visite des coulisses",
      format: "soiree",
      basePriceCents: 110000,
      durationMinutes: 180,
      location: "at_venue",
      status: "archived",
      bookingsCount: 11,
      pendingQuotes: 0,
      rating: 4.8,
      reviewsCount: 9,
      updatedAt: "2026-02-10T19:00:00Z",
    },
  ];
}
