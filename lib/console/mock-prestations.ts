// Cf. SPEC.md §3 — Prestation
// TODO(api): remplacer par fetch DB (Prisma). Garder la signature async + les enums alignés sur le schéma.

export type PrestationCategory =
  | "bbq" | "animation_kids" | "olympiades" | "event"
  | "coaching" | "tournoi" | "buvette";

export type PrestationStatus = "draft" | "published" | "paused" | "archived";

export type PrestationLocation = "at_client" | "at_club" | "flexible";

export type PrestationAdmin = {
  id: string;
  slug: string;
  title: string;
  category: PrestationCategory;
  priceCents: number;        // TTC, EUR
  durationMinutes: number;
  location: PrestationLocation;
  status: PrestationStatus;
  bookingsCount: number;     // total tous statuts (hors annulé)
  bookingsPending: number;   // à valider (pending_payment)
  rating?: number;
  reviewsCount: number;
  updatedAt: string;         // ISO
};

export const CATEGORY_LABEL: Record<PrestationCategory, string> = {
  bbq: "Barbecue",
  animation_kids: "Animation enfants",
  olympiades: "Olympiades",
  event: "Événement",
  coaching: "Coaching",
  tournoi: "Tournoi",
  buvette: "Buvette",
};

export const STATUS_LABEL: Record<PrestationStatus, string> = {
  draft: "Brouillon",
  published: "Publiée",
  paused: "En pause",
  archived: "Archivée",
};

export const LOCATION_LABEL: Record<PrestationLocation, string> = {
  at_client: "Chez le client",
  at_club: "Au club",
  flexible: "Flexible",
};

export async function getPrestations(_clubId: string): Promise<PrestationAdmin[]> {
  return [
    {
      id: "p1",
      slug: "barbecue-convivial",
      title: "Barbecue convivial",
      category: "bbq",
      priceCents: 28000,
      durationMinutes: 180,
      location: "at_client",
      status: "published",
      bookingsCount: 14,
      bookingsPending: 1,
      rating: 4.9,
      reviewsCount: 12,
      updatedAt: "2026-05-22T10:14:00Z",
    },
    {
      id: "p2",
      slug: "olympiades-inter-classes",
      title: "Olympiades inter-classes",
      category: "olympiades",
      priceCents: 72000,
      durationMinutes: 180,
      location: "flexible",
      status: "published",
      bookingsCount: 6,
      bookingsPending: 2,
      rating: 4.8,
      reviewsCount: 5,
      updatedAt: "2026-05-18T08:02:00Z",
    },
    {
      id: "p3",
      slug: "anniversaire-enfant",
      title: "Anniversaire enfant",
      category: "animation_kids",
      priceCents: 18000,
      durationMinutes: 180,
      location: "at_client",
      status: "published",
      bookingsCount: 9,
      bookingsPending: 0,
      rating: 5.0,
      reviewsCount: 7,
      updatedAt: "2026-05-12T16:40:00Z",
    },
    {
      id: "p4",
      slug: "buvette-fete-de-quartier",
      title: "Buvette fête de quartier",
      category: "buvette",
      priceCents: 35000,
      durationMinutes: 240,
      location: "at_client",
      status: "paused",
      bookingsCount: 4,
      bookingsPending: 0,
      rating: 4.7,
      reviewsCount: 4,
      updatedAt: "2026-04-30T11:00:00Z",
    },
    {
      id: "p5",
      slug: "tournoi-3v3-jeunes",
      title: "Tournoi 3v3 jeunes",
      category: "tournoi",
      priceCents: 95000,
      durationMinutes: 360,
      location: "at_club",
      status: "draft",
      bookingsCount: 0,
      bookingsPending: 0,
      reviewsCount: 0,
      updatedAt: "2026-05-28T09:20:00Z",
    },
    {
      id: "p6",
      slug: "coaching-prepa-physique",
      title: "Coaching prépa physique",
      category: "coaching",
      priceCents: 6000,
      durationMinutes: 60,
      location: "at_club",
      status: "draft",
      bookingsCount: 0,
      bookingsPending: 0,
      reviewsCount: 0,
      updatedAt: "2026-05-26T14:50:00Z",
    },
    {
      id: "p7",
      slug: "soiree-club-house",
      title: "Soirée club-house",
      category: "event",
      priceCents: 48000,
      durationMinutes: 240,
      location: "at_club",
      status: "archived",
      bookingsCount: 11,
      bookingsPending: 0,
      rating: 4.6,
      reviewsCount: 9,
      updatedAt: "2026-02-10T19:00:00Z",
    },
  ];
}
