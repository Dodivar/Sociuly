// Cf. SPEC.md §3 — Experience (produit vendu via devis B2B).
// Données servies par Prisma (Experience du club + agrégats bookings/quotes/avis).

import { prisma } from "@/lib/prisma";
import { resolveClubId } from "./club";

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

const CANCELLED_BOOKING = new Set(["cancelled_by_org", "cancelled_by_club", "refunded"]);

export async function getExperiences(clubIdParam: string): Promise<ExperienceAdmin[]> {
  const clubId = await resolveClubId(clubIdParam);
  if (!clubId) return [];

  const rows = await prisma.experience.findMany({
    where: { clubId },
    orderBy: { updatedAt: "desc" },
    include: {
      segments: { include: { module: { select: { location: true } } } },
      bookings: { select: { status: true } },
      quotes: { select: { status: true } },
    },
  });

  return rows.map((e) => {
    const bookingsCount = e.bookings.filter((b) => !CANCELLED_BOOKING.has(b.status)).length;
    const pendingQuotes = e.quotes.filter((q) => q.status === "draft" || q.status === "sent").length;
    const durationMinutes = e.segments.reduce((sum, s) => sum + s.durationMinutes, 0);
    const location = (e.segments[0]?.module?.location ?? "flexible") as ExperienceLocation;
    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      format: e.format as ExperienceFormat,
      basePriceCents: e.basePriceCents,
      durationMinutes,
      location,
      status: e.status as ExperienceStatus,
      bookingsCount,
      pendingQuotes,
      rating: e.ratingAvg ?? undefined,
      reviewsCount: e.reviewsCount,
      updatedAt: e.updatedAt.toISOString(),
    };
  });
}
