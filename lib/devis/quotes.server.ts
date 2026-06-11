// Lecture Prisma des devis (SERVEUR uniquement) → view-model Quote.
// Séparé de quotes.ts (client-safe : types, libellés, helpers purs) pour éviter
// que le client n'embarque le driver pg via @/lib/prisma.

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { ExperienceLocation } from "@/lib/marketplace/experience-detail";
import type { Quote, QuoteStatus, QuoteThreadKind } from "./quotes";

const QUOTE_INCLUDE = {
  organization: { include: { primaryContact: true } },
  club: true,
  experience: { include: { project: true } },
  lines: { orderBy: { order: "asc" } },
  events: { orderBy: { createdAt: "asc" } },
  booking: true,
} satisfies Prisma.QuoteInclude;

type QuoteRow = Prisma.QuoteGetPayload<{ include: typeof QUOTE_INCLUDE }>;

/** Libellé FR « 20 mai 2026 » (pré-formaté pour éviter tout décalage de fuseau côté UI). */
function frLabel(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function isoDate(d: Date | null | undefined): string | undefined {
  return d ? d.toISOString().slice(0, 10) : undefined;
}

function toQuoteView(q: QuoteRow): Quote {
  const sentEvent = q.events.find((e) => e.kind === "sent");
  const decisionEvent = q.events.find((e) => e.kind === "decision");
  const revisionCount = q.events.filter((e) => e.kind === "revision").length;

  return {
    id: q.id,
    ref: q.ref,
    quoteNumber: q.quoteNumber,
    status: q.status as QuoteStatus,
    organizationName: q.organization.name,
    organizationSiret: q.organization.siret,
    contactName: q.organization.primaryContact?.fullName ?? q.organization.name,
    contactEmail: q.organization.primaryContact?.email ?? "",
    contactPhone: q.organization.primaryContact?.phone ?? undefined,
    experienceTitle: q.experience?.title ?? "Sur mesure",
    experienceSlug: q.experience?.slug ?? "",
    clubName: q.club.name,
    projectTitle: q.experience?.project?.title ?? undefined,
    requestedDateISO: isoDate(q.requestedDate) ?? "",
    requestedTime: q.requestedTime ?? undefined,
    participants: q.participants ?? 0,
    location: (q.location ?? "flexible") as ExperienceLocation,
    addressForService: q.serviceAddress ?? undefined,
    lines: q.lines.map((l) => ({
      id: l.id,
      label: l.label,
      detail: l.detail ?? undefined,
      quantity: l.quantity,
      unitPriceCents: l.unitPriceCents,
    })),
    validUntilISO: isoDate(q.validUntil),
    createdAtLabel: frLabel(q.createdAt),
    sentAtLabel: sentEvent ? frLabel(sentEvent.createdAt) : undefined,
    decidedAtLabel: decisionEvent ? frLabel(decisionEvent.createdAt) : undefined,
    revisionCount,
    thread: q.events.map((e) => ({
      id: e.id,
      from: e.actor as "org" | "club",
      author: e.author,
      atLabel: frLabel(e.createdAt),
      body: e.body,
      kind: e.kind as QuoteThreadKind,
    })),
    bookingRef: q.booking?.bookingNumber ?? undefined,
  };
}

/** Devis d'un club (console). Scoper sur le club_admin connecté est fait au niveau route. */
export async function getQuotesForClub(clubId: string): Promise<Quote[]> {
  const rows = await prisma.quote.findMany({
    where: { clubId },
    include: QUOTE_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toQuoteView);
}

/** Devis d'une organisation (espace entreprise). Sans orgId : tous (dev). */
export async function getQuotesForOrg(orgId?: string): Promise<Quote[]> {
  const rows = await prisma.quote.findMany({
    where: orgId ? { organizationId: orgId } : {},
    include: QUOTE_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toQuoteView);
}

/** Récupère un devis par son token opaque d'URL (/devis/[ref]). */
export async function getQuoteByRef(ref: string): Promise<Quote | null> {
  const q = await prisma.quote.findUnique({ where: { ref }, include: QUOTE_INCLUDE });
  return q ? toQuoteView(q) : null;
}

/** Récupère le devis accepté correspondant à une réf. de réservation (garde /reserver). */
export async function getQuoteByBookingRef(bookingRef: string): Promise<Quote | null> {
  const q = await prisma.quote.findFirst({
    where: { booking: { bookingNumber: bookingRef }, status: "accepted" },
    include: QUOTE_INCLUDE,
  });
  return q ? toQuoteView(q) : null;
}
