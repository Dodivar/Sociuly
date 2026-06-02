// Cf. SPEC.md §4 — Booking / Invoice · §5 — commission 6 % / versement J+1 / fenêtre litige.
// TODO(api): remplacer par un fetch DB (Prisma) scopé sur le club du club_admin.
// Garder la signature async, l'enum aligné sur le schéma et le calcul de commission.
//
// Modèle B2B : le payeur est toujours une organisation (entreprise / CSE / collectivité),
// jamais un particulier (cf. SPEC §2). Montants en cents (EUR). Libellés de dates
// pré-formatés (FR) côté donnée car la vue est "use client".
//
// TVA (§11, décision ouverte, bloquante pour tout calcul) : on n'affiche pas de
// ventilation HT/TVA/TTC. Le montant encaissé est traité comme TTC, la commission
// Sociuly = 6 % du TTC, le net versé = TTC − commission. TODO(§11) avant tout calcul réel.

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
  orgName: string; // organisation ayant réservé
  experienceTitle: string;
  prestationDateLabel: string; // date de réalisation
  status: UpcomingPayoutStatus;
  grossAmountCents: number; // payé par l'organisation (TTC)
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
  grossAmountCents: number;
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
function withCommission(grossCents: number) {
  const feeAmountCents = Math.round(grossCents * 0.06);
  return {
    grossAmountCents: grossCents,
    feeAmountCents,
    netAmountCents: grossCents - feeAmountCents,
  };
}

// Versements à venir (booking confirmé ou réalisé, net non encore viré au club).
const UPCOMING: UpcomingPayout[] = [
  {
    id: "u1",
    bookingNumber: "SOC-2026-00037",
    orgName: "CSE Decathlon Rennes",
    experienceTitle: "Tournoi 3v3 inter-équipes",
    prestationDateLabel: "1 juin 2026",
    status: "dispute_window",
    ...withCommission(95000),
    payoutDateLabel: "3 juin 2026",
  },
  {
    id: "u2",
    bookingNumber: "SOC-2026-00040",
    orgName: "Comité d'entreprise Lactalis",
    experienceTitle: "Initiation multisport encadrée",
    prestationDateLabel: "27 juin 2026",
    status: "awaiting_completion",
    ...withCommission(18000),
    payoutDateLabel: "28 juin 2026",
  },
  {
    id: "u3",
    bookingNumber: "SOC-2026-00039",
    orgName: "Ville de Rennes — Événementiel",
    experienceTitle: "Animation cohésion fête de quartier",
    prestationDateLabel: "4 juil. 2026",
    status: "awaiting_completion",
    ...withCommission(35000),
    payoutDateLabel: "5 juil. 2026",
  },
  {
    id: "u4",
    bookingNumber: "SOC-2026-00041",
    orgName: "Lycée Bréquigny",
    experienceTitle: "Olympiades inter-classes",
    prestationDateLabel: "20 juin 2026",
    status: "awaiting_completion",
    ...withCommission(72000),
    payoutDateLabel: "21 juin 2026",
  },
];

// Historique des versements déjà effectués (virements Stripe vers le club).
const HISTORY: PayoutHistoryRow[] = [
  {
    id: "h1",
    bookingNumber: "SOC-2026-00035",
    orgName: "CE Orange Grand Ouest",
    experienceTitle: "Olympiades inter-classes",
    paidAtLabel: "17 mai 2026",
    ...withCommission(72000),
  },
  {
    id: "h2",
    bookingNumber: "SOC-2026-00031",
    orgName: "CSE Bretagne Télécom",
    experienceTitle: "Atelier cohésion d'équipe",
    paidAtLabel: "3 mai 2026",
    ...withCommission(28000),
  },
  {
    id: "h3",
    bookingNumber: "SOC-2026-00026",
    orgName: "Mutuelle Armor",
    experienceTitle: "Soirée club-house privatisée",
    paidAtLabel: "28 avr. 2026",
    ...withCommission(48000),
  },
  {
    id: "h4",
    bookingNumber: "SOC-2026-00022",
    orgName: "Crédit Mutuel Arkéa",
    experienceTitle: "Masterclass joueur professionnel",
    paidAtLabel: "12 avr. 2026",
    ...withCommission(120000),
  },
];

// Encaissements (paiements reçus des organisations : acompte puis solde).
const ENCAISSEMENTS: Encaissement[] = [
  { id: "e1", bookingNumber: "SOC-2026-00037", orgName: "CSE Decathlon Rennes",        kind: "balance", amountCents: 66500, paidAtLabel: "29 mai 2026" },
  { id: "e2", bookingNumber: "SOC-2026-00040", orgName: "Comité d'entreprise Lactalis", kind: "deposit", amountCents: 5400,  paidAtLabel: "24 mai 2026" },
  { id: "e3", bookingNumber: "SOC-2026-00041", orgName: "Lycée Bréquigny",             kind: "deposit", amountCents: 21600, paidAtLabel: "22 mai 2026" },
  { id: "e4", bookingNumber: "SOC-2026-00039", orgName: "Ville de Rennes — Événementiel", kind: "deposit", amountCents: 10500, paidAtLabel: "20 mai 2026" },
  { id: "e5", bookingNumber: "SOC-2026-00035", orgName: "CE Orange Grand Ouest",        kind: "balance", amountCents: 50400, paidAtLabel: "14 mai 2026" },
  { id: "e6", bookingNumber: "SOC-2026-00037", orgName: "CSE Decathlon Rennes",        kind: "deposit", amountCents: 28500, paidAtLabel: "10 mai 2026" },
  { id: "e7", bookingNumber: "SOC-2026-00031", orgName: "CSE Bretagne Télécom",        kind: "balance", amountCents: 19600, paidAtLabel: "30 avr. 2026" },
  { id: "e8", bookingNumber: "SOC-2026-00035", orgName: "CE Orange Grand Ouest",        kind: "deposit", amountCents: 21600, paidAtLabel: "28 avr. 2026" },
];

function sumBy<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((acc, row) => acc + pick(row), 0);
}

export async function getRevenueData(_clubId: string): Promise<RevenueData> {
  const versementsAVenirCents = sumBy(UPCOMING, (r) => r.netAmountCents);
  const netVerseCents = sumBy(HISTORY, (r) => r.netAmountCents);
  const encaisseTTCCents = sumBy(ENCAISSEMENTS, (r) => r.amountCents);
  const commissionCents =
    sumBy(HISTORY, (r) => r.feeAmountCents) + sumBy(UPCOMING, (r) => r.feeAmountCents);

  // Prochain versement = le plus proche dans le temps (la fenêtre litige en cours).
  const next = UPCOMING.find((r) => r.status === "dispute_window") ?? UPCOMING[0];

  return {
    kpis: {
      encaisseTTC: { amountCents: encaisseTTCCents, deltaLabel: "+18 %", deltaPositive: true },
      netVerse: { amountCents: netVerseCents, deltaLabel: "+12 %", deltaPositive: true },
      versementsAVenir: { amountCents: versementsAVenirCents, deltaLabel: "+3 versements", deltaPositive: true },
      commission: { amountCents: commissionCents, deltaLabel: "+9 %", deltaPositive: true },
    },
    nextPayout: {
      amountCents: next.netAmountCents,
      dateLabel: next.payoutDateLabel,
      count: UPCOMING.length,
    },
    upcoming: UPCOMING,
    history: HISTORY,
    encaissements: ENCAISSEMENTS,
  };
}
