// Console admin Sociuly — données servies par Prisma.
// Cf. SPEC.md §4 (KYC plateforme + KYC corporate-ready) + §6 (route /admin).
// File de validation = Club.status='pending_verification' + documents/conditions ;
// graphiques = agrégation des Booking réels ; montants en cents (Int).

import type { ExperienceFormat } from "@/lib/console/experiences";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

// Type de club (SPEC §3 — Club.clubType : amateur loi 1901 ET professionnel).
export type ClubType = "association_1901" | "club_pro" | "sasp" | "autre";

export const CLUB_TYPE_LABEL: Record<ClubType, string> = {
  association_1901: "Association loi 1901",
  club_pro: "Club professionnel",
  sasp: "SASP",
  autre: "Autre structure",
};

// Fédérations sportives (SPEC §3/§4 — affiliation fédérale des clubs amateurs).
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

// Pièce justificative téléversée par le club.
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

// Les 4 conditions d'activation d'un club (SPEC §4 — KYC plateforme).
export type KycConditions = {
  siretVerified: boolean; // 1. SIRET vérifié API INSEE Sirene
  federationNumber: string | null; // 2. n° affiliation (amateur) / preuve statut pro (club_pro/sasp)
  stripeOnboarded: boolean; // 3. onboarding Stripe Connect complété
  hasPresident: boolean; // 4. au moins un membre role=president
};

// Conditions "corporate-ready" (SPEC §4 — gate supplémentaire pour vendre en B2B).
export type CorporateReadiness = {
  insuranceRcPro: boolean; // attestation RC pro valide
  certifiedInstructor: boolean; // ≥ 1 encadrant diplômé (BPJEPS / APA)
  canInvoice: boolean; // capable d'émettre une facture conforme
};

export type PendingClub = {
  id: string;
  name: string;
  initials: string;
  clubType: ClubType;
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
  corporate: CorporateReadiness; // gate B2B (SPEC §4)
  corporateReady: boolean; // dérivé : les 3 conditions corporate sont vraies
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
  category: ExperienceFormat;
  label: string;
  valueEuros: number;
};

export type AdminCharts = {
  months: string[];
  series: ChartSeries[];
  topFormats: CategoryBar[];
};

export type AdminData = {
  periodLabel: string; // ex. "mai 2026"
  pendingCount: number;
  overviewKpis: AdminKpi[];
  charts: AdminCharts;
  validationKpis: AdminKpi[];
  pending: PendingClub[];
};

