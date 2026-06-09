// Cf. SPEC.md §3 — Booking · §4/§5 — commission / acompte / annulation / versement.
// Données servies par Prisma (Booking du club + quote/experience/org). Les
// libellés de dates sont pré-formatés (FR, fuseau UTC) côté donnée pour éviter
// tout décalage au rendu (le composant de vue est "use client").

import { prisma } from "@/lib/prisma";
import { resolveClubId } from "./club";

// SPEC §3 — machine d'état complète du Booking B2B.
export type BookingStatus =
  | "pending_quote"
  | "quote_accepted"
  | "deposit_paid"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled_by_org"
  | "cancelled_by_club"
  | "refunded";

export type BookingLocation = "at_client" | "at_club" | "at_venue" | "flexible";

export type BookingAdmin = {
  id: string;
  bookingNumber: string; // SOC-YYYY-NNNNN
  status: BookingStatus;

  // Expérience commandée
  experienceTitle: string;
  experienceSlug: string;

  // Entreprise acheteuse (org_buyer) + contact référent
  organizationName: string;
  organizationEmail: string;
  contactName: string;
  contactPhone?: string;

  // Créneau (pré-formaté)
  dateShort: string;   // "lun. 16 juin"
  dateLong: string;    // "lundi 16 juin 2026"
  timeRange: string;   // "09h00 – 17h00"
  durationMinutes: number;
  participants: number;

  // Lieu
  location: BookingLocation;
  addressForService?: string; // si location = at_client

  // Montants (cents, EUR) — commission Sociuly = 6 % du TTC (SPEC §5), acompte 30 % (SPEC §4/§11)
  grossAmountTTCCents: number; // TTC payé par l'entreprise
  feeAmountCents: number;      // commission Sociuly (6 % du TTC)
  netAmountCents: number;      // versé au club = TTC − commission
  depositCents: number;        // acompte (30 % du TTC)

  // Projet financé (libellé lisible)
  projectTitle?: string;

  // Annulation / jalons (pré-formatés)
  cancellationDeadlineLabel?: string; // "9 juin 2026"
  createdAtLabel: string;             // "28 mai 2026"
  confirmedAtLabel?: string;
  completedAtLabel?: string;
  resolutionLabel?: string;           // annulations / remboursements

  // Message laissé par l'entreprise
  organizationNotes?: string;
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending_quote: "Devis à envoyer",
  quote_accepted: "Devis accepté",
  deposit_paid: "Acompte versé",
  confirmed: "Confirmée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled_by_org: "Annulée · entreprise",
  cancelled_by_club: "Annulée · club",
  refunded: "Remboursée",
};

export const LOCATION_LABEL: Record<BookingLocation, string> = {
  at_client: "Dans l'entreprise",
  at_club: "Au club",
  at_venue: "Sur le site (Arena)",
  flexible: "Flexible",
};


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
