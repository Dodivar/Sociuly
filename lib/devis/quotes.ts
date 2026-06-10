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

import { DEPOSIT_RATE, VAT_RATE } from "@/lib/booking/tunnel";
import type { ExperienceLocation } from "@/lib/marketplace/experience-detail";

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
  // Les lignes sont exprimées HT ; TVA 20 % (décision actée) → TTC payé par l'acheteur.
  const amountHTCents = lines.reduce((sum, l) => sum + lineSubtotalCents(l), 0);
  const vatCents = Math.round(amountHTCents * VAT_RATE);
  const amountTTCCents = amountHTCents + vatCents;
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
// (SPEC §3) — à brancher dans la Server Action de création de devis.
export function makeQuoteNumber(year: number, seq: number): string {
  return `DEV-${year}-${String(seq).padStart(5, "0")}`;
}

// Alphabet base58 (sans 0/O/I/l, ambigus) pour un token lisible et copiable.
const REF_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/**
 * Token opaque de l'URL `/devis/[ref]` : cryptographiquement aléatoire (non
 * devinable, contre l'énumération — décision §11), préfixé `qr_`. 14 caractères
 * base58 ≈ 82 bits d'entropie. Utilise Web Crypto (universel Node/Edge), avec
 * rejet des octets hors plage pour éviter tout biais de modulo.
 */
export function makeQuoteRef(length = 14): string {
  // Plus grand multiple de l'alphabet ≤ 256 : au-delà, l'octet est rejeté.
  const ceiling = Math.floor(256 / REF_ALPHABET.length) * REF_ALPHABET.length;
  const buf = new Uint8Array(length);
  let out = "";
  while (out.length < length) {
    crypto.getRandomValues(buf);
    for (const b of buf) {
      if (b < ceiling && out.length < length) out += REF_ALPHABET[b % REF_ALPHABET.length];
    }
  }
  return `qr_${out}`;
}

// ─────── Lecture Prisma → view-model Quote ───────
// Les getters branchés sur Prisma vivent dans `lib/devis/quotes.server.ts`
// (module serveur). Ce fichier reste pur (types, formatage, calculs) pour qu'un
// Client Component puisse l'importer sans embarquer le driver `pg` (Node-only)
// dans le bundle navigateur.

/** Réf. d'un devis « sent » pour la navigation dev (le parcours réel passe par magic-link email). */
export const SAMPLE_SENT_QUOTE_REF = "qr_7h2Kp9vLmZ";
