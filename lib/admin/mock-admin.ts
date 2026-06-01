// Console admin Sociuly — données de démonstration.
// Cf. SPEC.md §5 (KYC plateforme) + §6 (route /admin) + wire-admin.jsx.
// TODO(api): remplacer chaque fetcher par un appel Prisma / RPC. Garder les
// signatures async et les enums alignés sur le schéma (SPEC §3/§4).

import {
  CATEGORY_LABEL,
  type PrestationCategory,
} from "@/lib/console/mock-prestations";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

// Fédérations sportives (SPEC §3 — Association.federation).
export type Federation = "FFF" | "FFR" | "FFHB" | "FFBB" | "FFT" | "autre";

export const FEDERATION_LABEL: Record<Federation, string> = {
  FFF: "FFF · Football",
  FFR: "FFR · Rugby",
  FFHB: "FFHB · Handball",
  FFBB: "FFBB · Basket",
  FFT: "FFT · Tennis",
  autre: "Autre fédération",
};

// État d'une demande dans la file de validation.
export type PendingStatus = "to_verify" | "docs_incomplete";

export const PENDING_STATUS_LABEL: Record<PendingStatus, string> = {
  to_verify: "à vérifier",
  docs_incomplete: "docs incomplets",
};

// Pièce justificative téléversée par l'association.
export type KycDocStatus = "uploaded" | "missing";
export type KycDoc = {
  id: string;
  label: string;
  status: KycDocStatus;
};

// Item de la checklist manuelle de l'admin.
export type KycCheckItem = {
  id: string;
  label: string;
  done: boolean;
};

// Les 4 conditions d'activation d'une association (SPEC §5 — KYC plateforme).
export type KycConditions = {
  siretVerified: boolean; // 1. SIRET vérifié API INSEE Sirene
  federationNumber: string | null; // 2. n° affiliation fédérale (validation manuelle)
  stripeOnboarded: boolean; // 3. onboarding Stripe Connect complété
  hasPresident: boolean; // 4. au moins un membre role=president
};

export type PendingAssociation = {
  id: string;
  name: string;
  initials: string;
  federation: Federation;
  sport: string; // libellé affiché (ex. "Handball")
  city: string;
  postalCode: string;
  siret: string; // 14 chars (SPEC §3)
  submittedLabel: string; // ancienneté lisible, ex. "il y a 2j"
  submittedDays: number; // pour le tri par ancienneté
  status: PendingStatus;
  president: { name: string; email: string };
  docs: KycDoc[];
  checklist: KycCheckItem[];
  conditions: KycConditions;
  note?: string; // note interne admin
};

// Carte KPI de la vue globale (valeur préformatée, cf. mock-dashboard).
export type AdminKpi = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  accent?: boolean;
};

// Série temporelle pour le graphique d'aire (valeurs d'affichage en €).
export type ChartSeries = {
  id: "ca" | "commissions" | "reverse";
  label: string;
  points: number[];
};

export type CategoryBar = {
  category: PrestationCategory;
  label: string;
  valueEuros: number;
};

export type AdminCharts = {
  months: string[];
  series: ChartSeries[];
  topCategories: CategoryBar[];
};

export type AdminData = {
  periodLabel: string; // ex. "mai 2026"
  pendingCount: number;
  overviewKpis: AdminKpi[];
  charts: AdminCharts;
  validationKpis: AdminKpi[];
  pending: PendingAssociation[];
};

// ─────────────────────────────────────────────────────────────
// Données
// ─────────────────────────────────────────────────────────────

// Pièces justificatives attendues (SPEC §5). L'identifiant est stable pour
// brancher plus tard l'ouverture du document (Supabase Storage).
function docs(present: boolean[]): KycDoc[] {
  const defs = [
    ["statuts", "Statuts asso (PDF)"],
    ["rna", "RNA / Récépissé"],
    ["rib", "RIB"],
    ["id", "Pièce identité prés."],
  ] as const;
  return defs.map(([id, label], i) => ({
    id,
    label,
    status: present[i] ? "uploaded" : "missing",
  }));
}

// Checklist alignée sur les 4 conditions d'activation (SPEC §5).
function checklist(done: boolean[]): KycCheckItem[] {
  const defs = [
    ["statuts", "Statuts conformes"],
    ["rna", "RNA vérifié"],
    ["president", "Identité du président"],
    ["rib", "RIB lisible"],
  ] as const;
  return defs.map(([id, label], i) => ({ id, label, done: done[i] }));
}

const PENDING: PendingAssociation[] = [
  {
    id: "a1",
    name: "Handball Club Strasbourg",
    initials: "HS",
    federation: "FFHB",
    sport: "Handball",
    city: "Strasbourg",
    postalCode: "67000",
    siret: "82451938700014",
    submittedLabel: "il y a 2j",
    submittedDays: 2,
    status: "to_verify",
    president: { name: "Karim Benali", email: "president@hcstrasbourg.fr" },
    docs: docs([true, true, true, true]),
    checklist: checklist([true, true, true, false]),
    conditions: {
      siretVerified: true,
      federationNumber: "FFHB-67-0241",
      stripeOnboarded: true,
      hasPresident: true,
    },
  },
  {
    id: "a2",
    name: "FC Nancy-Sud",
    initials: "FN",
    federation: "FFF",
    sport: "Football",
    city: "Nancy",
    postalCode: "54000",
    siret: "51209384600027",
    submittedLabel: "il y a 4j",
    submittedDays: 4,
    status: "to_verify",
    president: { name: "Élodie Marchand", email: "contact@fcnancysud.fr" },
    docs: docs([true, true, true, true]),
    checklist: checklist([true, true, false, false]),
    conditions: {
      siretVerified: true,
      federationNumber: "FFF-54-1187",
      stripeOnboarded: true,
      hasPresident: true,
    },
  },
  {
    id: "a3",
    name: "Volley Club Metz",
    initials: "VM",
    federation: "autre",
    sport: "Volley",
    city: "Metz",
    postalCode: "57000",
    siret: "79018273600019",
    submittedLabel: "il y a 5j",
    submittedDays: 5,
    status: "docs_incomplete",
    president: { name: "Thomas Petit", email: "bureau@vcmetz.fr" },
    docs: docs([true, true, false, true]),
    checklist: checklist([true, false, true, false]),
    conditions: {
      siretVerified: true,
      federationNumber: null,
      stripeOnboarded: false,
      hasPresident: true,
    },
  },
  {
    id: "a4",
    name: "Rugby Club Strasbourg",
    initials: "RS",
    federation: "FFR",
    sport: "Rugby",
    city: "Strasbourg",
    postalCode: "67200",
    siret: "44382910500032",
    submittedLabel: "il y a 1 sem.",
    submittedDays: 7,
    status: "to_verify",
    president: { name: "Hélène Dubois", email: "president@rcstrasbourg.fr" },
    docs: docs([true, true, true, true]),
    checklist: checklist([true, true, true, false]),
    conditions: {
      siretVerified: true,
      federationNumber: "FFR-67-0098",
      stripeOnboarded: true,
      hasPresident: true,
    },
  },
  {
    id: "a5",
    name: "Basket Nancy Métropole",
    initials: "BN",
    federation: "FFBB",
    sport: "Basket",
    city: "Nancy",
    postalCode: "54500",
    siret: "60293817400021",
    submittedLabel: "il y a 1 sem.",
    submittedDays: 8,
    status: "to_verify",
    president: { name: "Sofiane Roux", email: "contact@basketnancy.fr" },
    docs: docs([true, true, true, true]),
    checklist: checklist([true, true, false, false]),
    conditions: {
      siretVerified: true,
      federationNumber: "FFBB-54-0312",
      stripeOnboarded: false,
      hasPresident: true,
    },
  },
  {
    id: "a6",
    name: "Tennis Club Metz-Plantières",
    initials: "TM",
    federation: "FFT",
    sport: "Tennis",
    city: "Metz",
    postalCode: "57070",
    siret: "39481027300018",
    submittedLabel: "il y a 9j",
    submittedDays: 9,
    status: "docs_incomplete",
    president: { name: "Camille Noël", email: "secretariat@tcmetz.fr" },
    docs: docs([true, false, false, true]),
    checklist: checklist([true, false, true, false]),
    conditions: {
      siretVerified: false,
      federationNumber: "FFT-57-0455",
      stripeOnboarded: false,
      hasPresident: true,
    },
  },
  {
    id: "a7",
    name: "Pétanque Strasbourg Krutenau",
    initials: "PS",
    federation: "autre",
    sport: "Pétanque",
    city: "Strasbourg",
    postalCode: "67000",
    siret: "73920184600025",
    submittedLabel: "il y a 11j",
    submittedDays: 11,
    status: "to_verify",
    president: { name: "Jean-Marc Faure", email: "president@petanque-krutenau.fr" },
    docs: docs([true, true, true, false]),
    checklist: checklist([true, true, false, false]),
    conditions: {
      siretVerified: true,
      federationNumber: "AUTRE-67-7781",
      stripeOnboarded: true,
      hasPresident: false,
    },
  },
];

const CHARTS: AdminCharts = {
  months: ["déc.", "janv.", "févr.", "mars", "avr.", "mai"],
  series: [
    { id: "ca", label: "CA", points: [9800, 11200, 12400, 14100, 16800, 18400] },
    {
      id: "commissions",
      label: "Commissions",
      points: [588, 672, 744, 846, 1008, 1104],
    },
    {
      id: "reverse",
      label: "Reversé",
      points: [9212, 10528, 11656, 13254, 15792, 17296],
    },
  ],
  // Réparti sur les 7 catégories (SPEC §3 — Prestation.category).
  topCategories: (
    [
      ["bbq", 5200],
      ["olympiades", 3900],
      ["event", 3100],
      ["animation_kids", 2400],
      ["buvette", 1800],
      ["tournoi", 1300],
      ["coaching", 700],
    ] as [PrestationCategory, number][]
  ).map(([category, valueEuros]) => ({
    category,
    label: CATEGORY_LABEL[category],
    valueEuros,
  })),
};

// ─────────────────────────────────────────────────────────────
// Fetchers
// ─────────────────────────────────────────────────────────────

export async function getAdminData(): Promise<AdminData> {
  const pending = [...PENDING].sort((a, b) => a.submittedDays - b.submittedDays);

  return {
    periodLabel: "mai 2026",
    pendingCount: pending.length,
    overviewKpis: [
      { id: "assos", label: "Assos actives", value: "238", delta: "+12 ce mois", deltaPositive: true },
      { id: "ca", label: "CA plateforme", value: "€18,4k", delta: "+18%", deltaPositive: true, accent: true },
      { id: "resa", label: "Réservations", value: "1 612", delta: "+246", deltaPositive: true },
      { id: "comm", label: "Commissions", value: "€1 240", delta: "+18%", deltaPositive: true },
      { id: "reverse", label: "Reversé aux clubs", value: "€17,2k", accent: true },
    ],
    charts: CHARTS,
    validationKpis: [
      { id: "validated", label: "Validées ce mois", value: "12" },
      { id: "delay", label: "Délai moyen", value: "2,4j" },
      { id: "refused", label: "Refusées", value: "1" },
      { id: "reports", label: "Signalements", value: "3", delta: "à traiter", accent: true },
    ],
    pending,
  };
}
