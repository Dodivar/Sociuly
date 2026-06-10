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

