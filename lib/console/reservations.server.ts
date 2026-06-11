// Lecture Prisma des réservations d'un club (SERVEUR uniquement).
// Séparé de reservations.ts (client-safe : types + libellés).

import { prisma } from "@/lib/prisma";
import { resolveClubId } from "./club";
import type { BookingAdmin, BookingLocation, BookingStatus } from "./reservations";

// ─────── Formatage FR (fuseau UTC, déterministe) ───────
const fr = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  d.toLocaleDateString("fr-FR", { timeZone: "UTC", ...opts });
const dateShortOf = (d: Date) => fr(d, { weekday: "short", day: "numeric", month: "long" });
const dateLongOf = (d: Date) => fr(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const labelOf = (d: Date) => fr(d, { day: "numeric", month: "long", year: "numeric" });
const hhmm = (d: Date) =>
  `${String(d.getUTCHours()).padStart(2, "0")}h${String(d.getUTCMinutes()).padStart(2, "0")}`;

export async function getReservations(clubIdParam: string): Promise<BookingAdmin[]> {
  const clubId = await resolveClubId(clubIdParam);
  if (!clubId) return [];

  const rows = await prisma.booking.findMany({
    where: { clubId },
    orderBy: { createdAt: "desc" },
    include: {
      experience: {
        select: {
          title: true, slug: true,
          project: { select: { title: true } },
          segments: { select: { durationMinutes: true } },
        },
      },
      organization: { select: { name: true, primaryContact: { select: { fullName: true, email: true, phone: true } } } },
      quote: {
        select: {
          participants: true,
          location: true,
          serviceAddress: true,
          events: { where: { kind: "request" }, take: 1, select: { body: true } },
        },
      },
    },
  });

  return rows.map((b) => {
    const durationMinutes = b.experience.segments.reduce((s, sg) => s + sg.durationMinutes, 0);
    const start = b.requestedDate;
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    const contact = b.organization.primaryContact;
    return {
      id: b.id,
      bookingNumber: b.bookingNumber,
      status: b.status as BookingStatus,
      experienceTitle: b.experience.title,
      experienceSlug: b.experience.slug,
      organizationName: b.organization.name,
      organizationEmail: contact?.email ?? "",
      contactName: contact?.fullName ?? b.organization.name,
      contactPhone: contact?.phone ?? undefined,
      dateShort: dateShortOf(start),
      dateLong: dateLongOf(start),
      timeRange: durationMinutes > 0 ? `${hhmm(start)} – ${hhmm(end)}` : hhmm(start),
      durationMinutes,
      participants: b.quote?.participants ?? 0,
      location: (b.quote?.location ?? "flexible") as BookingLocation,
      addressForService: b.quote?.serviceAddress ?? undefined,
      grossAmountTTCCents: b.grossAmountTTCCents,
      feeAmountCents: b.feeAmountCents,
      netAmountCents: b.netAmountCents,
      depositCents: b.depositCents,
      projectTitle: b.experience.project?.title ?? undefined,
      createdAtLabel: labelOf(b.createdAt),
      completedAtLabel: b.completedAt ? labelOf(b.completedAt) : undefined,
      organizationNotes: b.quote?.events[0]?.body ?? undefined,
    };
  });
}
