// Console admin Sociuly — données servies par Prisma.
// Cf. SPEC.md §4 (KYC plateforme + KYC corporate-ready) + §6 (route /admin).
// File de validation = Club.status='pending_verification' + documents/conditions ;
// graphiques = agrégation des Booking réels ; montants en cents (Int).

import {
  FORMAT_LABEL,
  type ExperienceFormat,
} from "@/lib/console/experiences";
import { prisma } from "@/lib/prisma";
import type { ClubDocumentType, BookingStatus } from "@/lib/generated/prisma/enums";

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

// ─────────────────────────────────────────────────────────────
// Fetchers Prisma
// ─────────────────────────────────────────────────────────────

const MO = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const CAPTURED: BookingStatus[] = ["deposit_paid", "confirmed", "in_progress", "completed"];
const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();

// Montant lisible : « €18,4k » au-delà de 10 000 €, sinon « €1 240 ».
function fmtEuro(cents: number): string {
  const euros = Math.round(cents / 100);
  if (euros >= 10_000) return `€${(euros / 1000).toFixed(1).replace(".", ",")}k`;
  return `€${euros.toLocaleString("fr-FR")}`;
}

// 4 documents KYC attendus → (type DB, id de vue, libellé).
const DOC_DEFS: Array<{ type: ClubDocumentType; viewId: string; label: string }> = [
  { type: "statuts", viewId: "statuts", label: "Statuts / K-bis (PDF)" },
  { type: "rna", viewId: "rna", label: "RNA / Récépissé" },
  { type: "rib", viewId: "rib", label: "RIB" },
  { type: "president_id", viewId: "id", label: "Pièce identité prés." },
];

export async function getAdminData(): Promise<AdminData> {
  const now = new Date();

  const [pendingClubs, activeClubsCount, reportedCount, bookings] = await Promise.all([
    prisma.club.findMany({
      where: { status: "pending_verification" },
      orderBy: { createdAt: "asc" },
      include: {
        documents: true,
        members: { where: { role: "president" }, include: { user: { select: { fullName: true, email: true } } } },
      },
    }),
    prisma.club.count({ where: { status: "active" } }),
    prisma.review.count({ where: { status: "reported" } }),
    prisma.booking.findMany({
      where: { status: { in: CAPTURED } },
      select: {
        createdAt: true, grossAmountTTCCents: true, feeAmountCents: true, netAmountCents: true,
        experience: { select: { format: true } },
      },
    }),
  ]);

  // ── File de validation ──
  const pending: PendingClub[] = pendingClubs.map((c) => {
    const docByType = new Map(c.documents.map((d) => [d.type, d]));
    const docs: KycDoc[] = DOC_DEFS.map((def) => ({
      id: def.viewId,
      label: def.label,
      status: docByType.get(def.type)?.status === "uploaded" ? "uploaded" : "missing",
    }));
    const uploaded = (t: ClubDocumentType) => docByType.get(t)?.status === "uploaded";
    const checklist: KycCheckItem[] = [
      { id: "statuts", label: "Statuts conformes", done: uploaded("statuts") },
      { id: "rna", label: "RNA / K-bis vérifié", done: uploaded("rna") },
      { id: "president", label: "Identité du président", done: uploaded("president_id") },
      { id: "rib", label: "RIB lisible", done: uploaded("rib") },
    ];
    const hasPresident = c.members.length > 0;
    const pres = c.members[0]?.user;
    const days = Math.max(0, Math.floor((now.getTime() - c.createdAt.getTime()) / 86_400_000));
    const allDocsPresent = docs.every((d) => d.status === "uploaded");

    return {
      id: c.id,
      name: c.name,
      initials: initialsOf(c.name),
      clubType: c.clubType as ClubType,
      // TODO(schéma): fédération/sport non modélisés sur Club → valeurs par défaut.
      federation: "autre",
      sport: CLUB_TYPE_LABEL[c.clubType as ClubType],
      city: c.city,
      postalCode: c.postalCode,
      siret: c.siret,
      submittedLabel: `il y a ${days}j`,
      submittedDays: days,
      status: allDocsPresent ? "to_verify" : "docs_incomplete",
      president: { name: pres?.fullName ?? "", email: pres?.email ?? "" },
      docs,
      checklist,
      conditions: {
        siretVerified: c.siretVerified,
        federationNumber: c.federationNumber,
        stripeOnboarded: c.bankDetailsVerified,
        hasPresident,
      },
      corporate: {
        insuranceRcPro: c.insuranceRcPro,
        certifiedInstructor: c.certifiedInstructor,
        canInvoice: c.canInvoice,
      },
      corporateReady: c.corporateReady,
      note: c.adminNote ?? undefined,
    };
  });

  // ── KPIs plateforme (sur les bookings encaissés) ──
  const caCents = bookings.reduce((s, b) => s + b.grossAmountTTCCents, 0);
  const commCents = bookings.reduce((s, b) => s + b.feeAmountCents, 0);
  const netCents = bookings.reduce((s, b) => s + b.netAmountCents, 0);

  // ── Graphiques : 6 derniers mois + top formats ──
  const monthKeys: Array<{ key: string; label: string }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    monthKeys.push({ key: `${d.getUTCFullYear()}-${d.getUTCMonth()}`, label: MO[d.getUTCMonth()] });
  }
  const byMonth = new Map(monthKeys.map((m) => [m.key, { ca: 0, comm: 0, net: 0 }]));
  const byFormat = new Map<ExperienceFormat, number>();
  for (const b of bookings) {
    const key = `${b.createdAt.getUTCFullYear()}-${b.createdAt.getUTCMonth()}`;
    const bucket = byMonth.get(key);
    if (bucket) {
      bucket.ca += b.grossAmountTTCCents;
      bucket.comm += b.feeAmountCents;
      bucket.net += b.netAmountCents;
    }
    const fmt = b.experience.format as ExperienceFormat;
    byFormat.set(fmt, (byFormat.get(fmt) ?? 0) + b.grossAmountTTCCents);
  }
  const euros = (c: number) => Math.round(c / 100);
  const charts: AdminCharts = {
    months: monthKeys.map((m) => m.label),
    series: [
      { id: "ca", label: "CA", points: monthKeys.map((m) => euros(byMonth.get(m.key)!.ca)) },
      { id: "commissions", label: "Commissions", points: monthKeys.map((m) => euros(byMonth.get(m.key)!.comm)) },
      { id: "reverse", label: "Reversé", points: monthKeys.map((m) => euros(byMonth.get(m.key)!.net)) },
    ],
    topFormats: [...byFormat.entries()]
      .map(([category, cents]) => ({ category, label: FORMAT_LABEL[category], valueEuros: euros(cents) }))
      .sort((a, b) => b.valueEuros - a.valueEuros),
  };

  return {
    periodLabel: `${MO[now.getUTCMonth()]} ${now.getUTCFullYear()}`,
    pendingCount: pending.length,
    overviewKpis: [
      { id: "clubs", label: "Clubs actifs", value: String(activeClubsCount) },
      { id: "ca", label: "CA plateforme", value: fmtEuro(caCents), accent: true },
      { id: "resa", label: "Commandes", value: bookings.length.toLocaleString("fr-FR") },
      { id: "comm", label: "Commissions", value: fmtEuro(commCents) },
      { id: "reverse", label: "Reversé aux clubs", value: fmtEuro(netCents), accent: true },
    ],
    charts,
    // TODO(schéma): validated/délai/refusés non tracés (pas de journal de modération).
    validationKpis: [
      { id: "validated", label: "Validés ce mois", value: "—" },
      { id: "delay", label: "Délai moyen", value: "—" },
      { id: "refused", label: "Refusés", value: "—" },
      { id: "reports", label: "Signalements", value: String(reportedCount), delta: reportedCount ? "à traiter" : undefined, accent: reportedCount > 0 },
    ],
    pending,
  };
}
