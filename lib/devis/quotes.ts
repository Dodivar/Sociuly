// Couche « Devis » (Quote) — cœur du parcours de contractualisation B2B.
// Cf. SPEC.md §3 (Quote), §4 (flux devis & contractualisation), §6 (routes
// /devis/[ref] côté entreprise, /console/[clubId]/devis côté club).
//
// FLUX (SPEC §4) :
//   1. L'entreprise demande un devis depuis une Experience → Quote(draft).
//   2. Le club (manager/président) chiffre et envoie → Quote(sent) + validUntil.
//   3. L'entreprise accepte → Quote(accepted) + création du Booking(quote_accepted)
//      → redirection vers /reserver/[bookingRef] pour l'acompte (30 %).
//      … ou demande une modification → retour Quote(draft) (revisionCount++)
//      … ou refuse → Quote(refused).
//   4. Un devis non répondu après validUntil → Quote(expired) (cron, Phase B).
//
// DÉCISIONS §11 actées :
//   - validité d'un devis : QUOTE_VALIDITY_DAYS = 21 jours (passer à 14 si besoin) ;
//   - acompte 30 % NON ajustable (DEPOSIT_RATE, source unique dans lib/booking/tunnel) ;
//   - TVA différée : on n'éclate pas HT/TVA tant que la base (Club.vatLiable) n'est
//     pas tranchée → vatCents = 0, amountHT = amountTTC, TODO(§11) (BLOQUANT montants) ;
//   - aller-retour autorisé : l'entreprise peut renvoyer le devis en draft (révision)
//     sans nouveau statut (reste dans l'enum SPEC §3), tracé via revisionCount + thread ;
//   - URL : `ref` = token opaque (non énumérable), slug humain transmis en query.
//
// Les getters lisent Prisma (Quote + lines + events + org/club/experience/booking)
// et mappent vers le view-model ci-dessous. Le scope (org_buyer pour /devis,
// club_admin pour la console) est appliqué au niveau route. Les mutations (création
// depuis une Experience, chiffrage, envoi, acceptation) restent à brancher en
// Server Actions avec calcul commission/acompte côté serveur (TODO).
// Tous les montants sont en centimes (Int), jamais de float (SPEC §3).

import { DEPOSIT_RATE } from "@/lib/booking/tunnel";
import type { ExperienceLocation } from "@/lib/marketplace/experience-detail";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

// ─────── Statut du devis (SPEC §3 — Quote.status) ───────
export type QuoteStatus = "draft" | "sent" | "accepted" | "refused" | "expired";

// ─────── Une ligne chiffrée du devis (rempli par le club) ───────
// Modèle de prix implicite : per_person → quantity = participants ;
// fixed/forfait → quantity = 1. Sous-total = quantity × unitPriceCents.
export type QuoteLine = {
  id: string;
  label: string;
  detail?: string;
  quantity: number;
  unitPriceCents: number;
};

// ─────── Fil de discussion (demande initiale, envoi, révision, note) ───────
export type QuoteThreadKind = "request" | "sent" | "revision" | "decision" | "note";
export type QuoteThreadEntry = {
  id: string;
  from: "org" | "club";
  author: string;
  atLabel: string;
  body: string;
  kind: QuoteThreadKind;
};

// ─────── Le devis ───────
export type Quote = {
  id: string;
  /** Token opaque pour l'URL /devis/[ref] (non énumérable — décision §11). */
  ref: string;
  /** Numéro légal lisible (SPEC §3 — format DEV-YYYY-NNNNN). */
  quoteNumber: string;
  status: QuoteStatus;

  // Parties
  organizationName: string;
  organizationSiret?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;

  // Expérience demandée
  experienceTitle: string;
  experienceSlug: string;
  clubName: string;
  projectTitle?: string;

  // Demande initiale (renseignée par l'entreprise)
  requestedDateISO: string;
  requestedTime?: string;
  participants: number;
  location: ExperienceLocation;
  addressForService?: string;

  // Chiffrage (rempli par le club avant l'envoi)
  lines: QuoteLine[];

  // Cycle de vie (libellés FR pré-formatés pour éviter tout décalage de fuseau)
  validUntilISO?: string;
  createdAtLabel: string;
  sentAtLabel?: string;
  decidedAtLabel?: string;
  /** Nombre d'allers-retours de révision (0 = demande initiale). */
  revisionCount: number;
  thread: QuoteThreadEntry[];

  /** Réf. de réservation générée à l'acceptation (SPEC §3 — SOC-YYYY-NNNNN). */
  bookingRef?: string;
};

// ─────── Constantes métier ───────
// SPEC §11 — validité par défaut d'un devis envoyé (B2B). Passer à 14 si besoin.
export const QUOTE_VALIDITY_DAYS = 21;
// Acompte : ré-exporté depuis la source unique (lib/booking/tunnel) — 30 %, non ajustable.
export { DEPOSIT_RATE } from "@/lib/booking/tunnel";

// ─────── Libellés & visuels de statut ───────
export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  draft: "À envoyer",
  sent: "Envoyé",
  accepted: "Accepté",
  refused: "Refusé",
  expired: "Expiré",
};

export type QuoteStatusVisual = { bg: string; fg: string; border?: string };
export const QUOTE_STATUS_VISUAL: Record<QuoteStatus, QuoteStatusVisual> = {
  draft:    { bg: "var(--highlight-soft)", fg: "#6e5111" },
  sent:     { bg: "var(--accent-soft)",    fg: "var(--accent-deep)" },
  accepted: { bg: "var(--primary-soft)",   fg: "var(--primary-deep)" },
  refused:  { bg: "var(--surface)",        fg: "var(--danger)", border: "var(--line-2)" },
  expired:  { bg: "var(--surface-2)",      fg: "var(--ink-2)" },
};

export const LOCATION_LABEL: Record<ExperienceLocation, string> = {
  at_client: "Dans l'entreprise",
  at_club: "Au club",
  at_venue: "Sur le site (Arena)",
  flexible: "Flexible",
};

// ─────── Calcul des montants (TTC) ───────
// SPEC §5 — le TTC = montant payé par l'entreprise ; la commission Sociuly (6 %)
// n'est jamais surfacée à l'acheteur (calcul serveur uniquement, absent d'ici).
// TODO(§11) — ventilation HT/TVA selon Club.vatLiable : décision comptable OUVERTE,
// BLOQUANTE. Tant qu'elle n'est pas tranchée : vatCents = 0, amountHT = amountTTC.
export function lineSubtotalCents(line: QuoteLine): number {
  return line.quantity * line.unitPriceCents;
}

export function quoteAmounts(lines: QuoteLine[]): {
  amountTTCCents: number;
  amountHTCents: number;
  vatCents: number;
  depositCents: number;
  balanceCents: number;
} {
  const amountTTCCents = lines.reduce((sum, l) => sum + lineSubtotalCents(l), 0);
  const vatCents = 0; // TODO(§11) — voir ci-dessus.
  const amountHTCents = amountTTCCents - vatCents;
  const depositCents = Math.round(amountTTCCents * DEPOSIT_RATE);
  const balanceCents = amountTTCCents - depositCents;
  return { amountTTCCents, amountHTCents, vatCents, depositCents, balanceCents };
}

// ─────── Formatage FR ───────
export const eurDecimal = (cents: number): string =>
  `${(cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

export const eurWhole = (cents: number): string =>
  `${Math.round(cents / 100).toLocaleString("fr-FR")} €`;

export function frDateLong(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

export function frDateShort(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short", day: "numeric", month: "short",
  });
}

/** Date d'échéance = aujourd'hui + QUOTE_VALIDITY_DAYS (ISO yyyy-mm-dd). */
export function defaultValidUntilISO(fromISO?: string): string {
  const base = fromISO ? new Date(`${fromISO}T00:00:00`) : new Date();
  base.setDate(base.getDate() + QUOTE_VALIDITY_DAYS);
  return base.toISOString().slice(0, 10);
}

/** Jours restants avant expiration (négatif = expiré). */
export function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`).getTime();
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  return Math.round((target - today) / 86_400_000);
}

// ─────── Générateurs (Phase B — serveur uniquement) ───────
// TODO(api): la numérotation DEV-YYYY-NNNNN doit être une séquence atomique en base
// (SPEC §3). Le token `ref` doit être cryptographiquement aléatoire (non devinable).
export function makeQuoteNumber(year: number, seq: number): string {
  return `DEV-${year}-${String(seq).padStart(5, "0")}`;
}

// ─────── Lecture Prisma → view-model Quote ───────

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

/** Réf. d'un devis « sent » pour la navigation dev (le parcours réel passe par magic-link email). */
export const SAMPLE_SENT_QUOTE_REF = "qr_7h2Kp9vLmZ";
