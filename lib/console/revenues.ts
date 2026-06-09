// Cf. SPEC.md §4 — Booking / Invoice · §5 — commission 6 % / versement J+1 / fenêtre litige.
// Revenus servis par Prisma : versements depuis la table Payout, encaissements
// dérivés des Booking (acompte + solde).
//
// Modèle B2B : le payeur est toujours une organisation (entreprise / CSE / collectivité),
// jamais un particulier (cf. SPEC §2). Montants en cents (EUR). Libellés de dates
// pré-formatés (FR, fuseau UTC) côté donnée car la vue est "use client".
//
// TVA 20 % (décision actée) : la ventilation HT/TVA détaillée provient de la facture ;
// ici on raisonne en TTC encaissé, commission 6 % du TTC, net versé = TTC − commission.

import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/generated/prisma/enums";
import { resolveClubId } from "./club";

// Statut d'un versement à venir.
export type UpcomingPayoutStatus = "awaiting_completion" | "dispute_window";

// Nature d'un encaissement (modèle acompte + solde, SPEC §4).
export type EncaissementKind = "deposit" | "balance";

// KPI affiché dans une StatCard (value/delta pré-calculés côté donnée).
export type RevenueKpi = {
  amountCents: number;
  deltaLabel: string;
  deltaPositive: boolean;
};

export type RevenueKpis = {
  encaisseTTC: RevenueKpi; // encaissé sur la période (TTC)
  netVerse: RevenueKpi; // net effectivement versé sur la période
  versementsAVenir: RevenueKpi; // net en attente de versement
  commission: RevenueKpi; // commission Sociuly (6 %) sur la période
};

export type NextPayout = {
  amountCents: number; // net du prochain versement
  dateLabel: string; // date de versement prévue
  count: number; // nombre total de versements à venir
};

export type UpcomingPayout = {
  id: string;
  bookingNumber: string; // SOC-YYYY-NNNNN
  orgName: string; // organisation ayant commandé
  experienceTitle: string;
  experienceDateLabel: string; // date de réalisation
  status: UpcomingPayoutStatus;
  grossAmountTTCCents: number; // payé par l'organisation (TTC)
  feeAmountCents: number; // commission Sociuly (6 %)
  netAmountCents: number; // net versé au club
  payoutDateLabel: string; // date de versement prévue (J+1)
};

export type PayoutHistoryRow = {
  id: string;
  bookingNumber: string;
  orgName: string;
  experienceTitle: string;
  paidAtLabel: string; // date du virement effectué
  grossAmountTTCCents: number;
  feeAmountCents: number;
  netAmountCents: number;
};

export type Encaissement = {
  id: string;
  bookingNumber: string;
  orgName: string;
  kind: EncaissementKind;
  amountCents: number; // montant encaissé (TTC)
  paidAtLabel: string; // date de l'encaissement
};

export type RevenueData = {
  kpis: RevenueKpis;
  nextPayout: NextPayout;
  upcoming: UpcomingPayout[];
  history: PayoutHistoryRow[];
  encaissements: Encaissement[];
};

export const ENCAISSEMENT_LABEL: Record<EncaissementKind, string> = {
  deposit: "Acompte (30 %)",
  balance: "Solde",
};

export const UPCOMING_STATUS_LABEL: Record<UpcomingPayoutStatus, string> = {
  awaiting_completion: "En attente · J+1",
  dispute_window: "Fenêtre litige · 48 h",
};

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
