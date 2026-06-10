// Accès Prisma aux avis de la console club — module SERVEUR uniquement.
// Séparé de `lib/console/reviews.ts` (types/libellés purs) pour qu'un Client
// Component puisse importer un libellé sans embarquer le driver `pg` (Node-only).
// Cf. SPEC.md §4 — Review · §5 — règles "Reviews".

import { prisma } from "@/lib/prisma";
import { resolveClubId } from "./club";
import type {
  RatingDistribution,
  ReportReason,
  Review,
  ReviewKpis,
  ReviewStatus,
  ReviewsData,
} from "./reviews";

export * from "./reviews";

// Avis reçus (mock). Le club mock = SIG Strasbourg → expériences cohérentes.

function computeKpis(reviews: Review[]): ReviewKpis {
  const totalCount = reviews.length;
  const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  let newCount = 0;
  let reportedCount = 0;

  for (const r of reviews) {
    distribution[r.rating as 1 | 2 | 3 | 4 | 5] += 1;
    ratingSum += r.rating;
    if (r.isNew) newCount += 1;
    if (r.status === "reported") reportedCount += 1;
  }

  // Moyenne arrondie à 1 décimale ; 0 si aucun avis (évite NaN).
  const averageRating = totalCount === 0 ? 0 : Math.round((ratingSum / totalCount) * 10) / 10;

  return { averageRating, totalCount, newCount, reportedCount, distribution };
}

// L'enum DB ReviewReportReason utilise `inaccurate` (mot réservé `false` interdit).
// Mapping vers le type de vue ReportReason.
function toReportReason(r: string | null): ReportReason | undefined {
  if (!r) return undefined;
  return (r === "inaccurate" ? "false" : r) as ReportReason;
}

const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
const frReviewDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

export async function getReviewsData(clubIdParam: string): Promise<ReviewsData> {
  const clubId = await resolveClubId(clubIdParam);
  if (!clubId) return { kpis: computeKpis([]), reviews: [] };

  const rows = await prisma.review.findMany({
    where: { clubId },
    orderBy: { createdAt: "desc" },
    include: {
      organization: { select: { name: true } },
      booking: { select: { bookingNumber: true, experience: { select: { title: true } } } },
    },
  });

  const reviews: Review[] = rows.map((r) => ({
    id: r.id,
    bookingNumber: r.booking.bookingNumber,
    organizationName: r.organization.name,
    organizationInitials: initialsOf(r.organization.name),
    experienceTitle: r.booking.experience.title,
    rating: r.rating,
    comment: r.comment ?? undefined,
    publishedAtLabel: frReviewDate(r.createdAt),
    publishedAtISO: r.createdAt.toISOString(),
    status: r.status as ReviewStatus,
    isNew: !r.viewedByClub,
    reportReason: toReportReason(r.reportReason),
  }));

  return { kpis: computeKpis(reviews), reviews };
}
