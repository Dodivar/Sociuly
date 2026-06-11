// Lecture Prisma des revenus d'un club (SERVEUR uniquement) : versements (Payout)
// + encaissements dérivés des Booking. Séparé de revenues.ts (client-safe).

import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/generated/prisma/enums";
import { resolveClubId } from "./club";
import type {
  Encaissement,
  PayoutHistoryRow,
  RevenueData,
  UpcomingPayout,
  UpcomingPayoutStatus,
} from "./revenues";

// SPEC §5 — commission 6 % du TTC, montants en cents.
// Versements = table Payout (transfert D+1 après completedAt) ; encaissements
// dérivés des Booking (acompte + solde, modèle deux temps §4).

const sumBy = <T>(rows: T[], pick: (row: T) => number): number =>
  rows.reduce((acc, row) => acc + pick(row), 0);
const frPayDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

const CAPTURED_BOOKING: BookingStatus[] = ["deposit_paid", "confirmed", "in_progress", "completed"];
const BALANCE_PAID = new Set<BookingStatus>(["confirmed", "in_progress", "completed"]);

export async function getRevenueData(clubIdParam: string): Promise<RevenueData> {
  const clubId = await resolveClubId(clubIdParam);
  const empty: RevenueData = {
    kpis: {
      encaisseTTC: { amountCents: 0, deltaLabel: "", deltaPositive: true },
      netVerse: { amountCents: 0, deltaLabel: "", deltaPositive: true },
      versementsAVenir: { amountCents: 0, deltaLabel: "", deltaPositive: true },
      commission: { amountCents: 0, deltaLabel: "", deltaPositive: true },
    },
    nextPayout: { amountCents: 0, dateLabel: "—", count: 0 },
    upcoming: [], history: [], encaissements: [],
  };
  if (!clubId) return empty;

  const [payouts, bookings] = await Promise.all([
    prisma.payout.findMany({
      where: { booking: { clubId } },
      orderBy: { scheduledFor: "asc" },
      include: {
        booking: {
          select: {
            bookingNumber: true, requestedDate: true,
            organization: { select: { name: true } },
            experience: { select: { title: true } },
          },
        },
      },
    }),
    prisma.booking.findMany({
      where: { clubId, status: { in: CAPTURED_BOOKING } },
      orderBy: { createdAt: "desc" },
      select: {
        bookingNumber: true, status: true, createdAt: true, completedAt: true, requestedDate: true,
        grossAmountTTCCents: true, depositCents: true,
        organization: { select: { name: true } },
      },
    }),
  ]);

  const upcoming: UpcomingPayout[] = payouts
    .filter((p) => p.status === "awaiting_completion" || p.status === "dispute_window")
    .map((p) => ({
      id: p.id,
      bookingNumber: p.booking.bookingNumber,
      orgName: p.booking.organization.name,
      experienceTitle: p.booking.experience.title,
      experienceDateLabel: frPayDate(p.booking.requestedDate),
      status: p.status as UpcomingPayoutStatus,
      grossAmountTTCCents: p.grossAmountTTCCents,
      feeAmountCents: p.feeAmountCents,
      netAmountCents: p.netAmountCents,
      payoutDateLabel: p.scheduledFor ? frPayDate(p.scheduledFor) : "—",
    }));

  const history: PayoutHistoryRow[] = payouts
    .filter((p) => p.status === "paid")
    .map((p) => ({
      id: p.id,
      bookingNumber: p.booking.bookingNumber,
      orgName: p.booking.organization.name,
      experienceTitle: p.booking.experience.title,
      paidAtLabel: p.paidAt ? frPayDate(p.paidAt) : "—",
      grossAmountTTCCents: p.grossAmountTTCCents,
      feeAmountCents: p.feeAmountCents,
      netAmountCents: p.netAmountCents,
    }));

  // Encaissements dérivés : acompte (dès deposit_paid) + solde (dès confirmed).
  const encaissements: Encaissement[] = [];
  for (const b of bookings) {
    encaissements.push({
      id: `${b.bookingNumber}-dep`, bookingNumber: b.bookingNumber, orgName: b.organization.name,
      kind: "deposit", amountCents: b.depositCents, paidAtLabel: frPayDate(b.createdAt),
    });
    if (BALANCE_PAID.has(b.status)) {
      encaissements.push({
        id: `${b.bookingNumber}-sol`, bookingNumber: b.bookingNumber, orgName: b.organization.name,
        kind: "balance", amountCents: b.grossAmountTTCCents - b.depositCents,
        paidAtLabel: frPayDate(b.completedAt ?? b.requestedDate),
      });
    }
  }

  const next = upcoming.find((r) => r.status === "dispute_window") ?? upcoming[0];

  return {
    kpis: {
      encaisseTTC: { amountCents: sumBy(encaissements, (r) => r.amountCents), deltaLabel: "", deltaPositive: true },
      netVerse: { amountCents: sumBy(history, (r) => r.netAmountCents), deltaLabel: "", deltaPositive: true },
      versementsAVenir: { amountCents: sumBy(upcoming, (r) => r.netAmountCents), deltaLabel: "", deltaPositive: true },
      commission: {
        amountCents: sumBy(history, (r) => r.feeAmountCents) + sumBy(upcoming, (r) => r.feeAmountCents),
        deltaLabel: "", deltaPositive: true,
      },
    },
    nextPayout: next
      ? { amountCents: next.netAmountCents, dateLabel: next.payoutDateLabel, count: upcoming.length }
      : { amountCents: 0, dateLabel: "—", count: 0 },
    upcoming,
    history,
    encaissements,
  };
}
