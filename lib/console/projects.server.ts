// Accès Prisma aux projets de la console club — module SERVEUR uniquement.
// Séparé de `lib/console/projects.ts` (types purs) pour qu'un Client Component
// puisse importer un type sans embarquer le driver `pg` (Node-only) dans le
// bundle navigateur. SPEC §3 — entité Project, montants en cents.

import { prisma } from "@/lib/prisma";
import { resolveClubId } from "./club";
import type { LinkedExperience, ProjectDetail, ProjectStatus } from "./projects";

export * from "./projects";

const CANCELLED = new Set(["cancelled_by_org", "cancelled_by_club", "refunded"]);
const LINK_HUES = ["green", "orange", "yellow", "teal"] as const;
const frProjectDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

export async function getProjects(clubIdParam: string): Promise<ProjectDetail[]> {
  const clubId = await resolveClubId(clubIdParam);
  if (!clubId) return [];

  const rows = await prisma.project.findMany({
    where: { clubId },
    orderBy: { createdAt: "desc" },
    include: {
      updates: { orderBy: { createdAt: "desc" } },
      experiences: {
        include: {
          bookings: { select: { status: true, grossAmountTTCCents: true, organizationId: true } },
        },
      },
    },
  });

  return rows.map((p) => {
    const supporters = new Set<string>();
    const linkedExperiences: LinkedExperience[] = p.experiences.map((e, i) => {
      const live = e.bookings.filter((b) => !CANCELLED.has(b.status));
      live.forEach((b) => supporters.add(b.organizationId));
      return {
        id: e.id,
        title: e.title,
        priceEuros: Math.round(e.basePriceCents / 100),
        bookingsCount: live.length,
        totalEuros: Math.round(live.reduce((s, b) => s + b.grossAmountTTCCents, 0) / 100),
        hue: LINK_HUES[i % LINK_HUES.length],
      };
    });

    const isDraft = p.status === "draft";
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      status: p.status as ProjectStatus,
      upcoming: isDraft ? true : undefined,
      raisedCents: p.collectedAmount,
      targetCents: p.targetAmount,
      remainingLabel: isDraft ? "à ouvrir" : null,
      description: p.description ?? "",
      supportersCount: supporters.size,
      viewsCount: p.viewsCount,
      viewsWeeklyDeltaPercent: 0, // TODO(analytics): pas d'historique de vues modélisé.
      linkedExperiences,
      updates: p.updates.map((u) => ({
        id: u.id,
        date: frProjectDate(u.createdAt),
        title: u.title,
        body: u.body ?? undefined,
        done: u.done,
      })),
    };
  });
}
