// Accès Prisma aux expériences de la console club — module SERVEUR uniquement.
// Séparé de `lib/console/experiences.ts` (types/libellés purs) pour qu'un Client
// Component puisse importer un libellé sans embarquer le driver `pg` (Node-only).
// Cf. SPEC.md §3 — Experience (produit vendu via devis B2B).

import { prisma } from "@/lib/prisma";
import { resolveClubId } from "./club";
import type {
  ExperienceAdmin,
  ExperienceFormat,
  ExperienceLocation,
  ExperienceStatus,
} from "./experiences";

export * from "./experiences";

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
