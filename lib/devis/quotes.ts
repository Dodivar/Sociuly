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
// TODO(api): remplacer les getters mock par des fetchs Prisma scopés (org_buyer
// pour /devis, club_admin pour la console). Garder les signatures async, l'enum
// aligné sur le schéma et le calcul de commission/acompte côté serveur.
// Tous les montants sont en centimes (Int), jamais de float (SPEC §3).

import { DEPOSIT_RATE } from "@/lib/booking/tunnel";
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

// ─────── Données mock (front v1) ───────
// 6 devis couvrant tous les statuts. 2 brouillons (draft) → cohérent avec
// navBadges.devis = 2 du dashboard (lib/console/mock-dashboard.ts).

const THREAD_REQUEST = (author: string, atLabel: string, body: string): QuoteThreadEntry => ({
  id: `t-${Math.random().toString(36).slice(2, 8)}`, from: "org", author, atLabel, body, kind: "request",
});

const QUOTES: Quote[] = [
  // ── sent — en attente de la décision de l'entreprise ──
  {
    id: "q07",
    ref: "qr_7h2Kp9vLmZ",
    quoteNumber: "DEV-2026-00007",
    status: "sent",
    organizationName: "Lohr Group",
    organizationSiret: "30912747500021",
    contactName: "Thomas Berger · Responsable RH",
    contactEmail: "evenementiel@lohr.example",
    contactPhone: "06 98 76 54 32",
    experienceTitle: "Match VIP & hospitalités",
    experienceSlug: "match-vip-hospitalites",
    clubName: "SIG Strasbourg",
    projectTitle: "Mini-bus du club",
    requestedDateISO: "2026-06-23",
    requestedTime: "18:00",
    participants: 30,
    location: "at_venue",
    lines: [
      { id: "l1", label: "Soirée match VIP — places en loge", detail: "Accès loge + hospitalités", quantity: 30, unitPriceCents: 6_500 },
      { id: "l2", label: "Cocktail dînatoire", detail: "Traiteur partenaire du club", quantity: 30, unitPriceCents: 1_500 },
      { id: "l3", label: "Visite des coulisses & rencontre joueur", quantity: 1, unitPriceCents: 18_000 },
    ],
    validUntilISO: "2026-06-21",
    createdAtLabel: "20 mai 2026",
    sentAtLabel: "22 mai 2026",
    revisionCount: 0,
    thread: [
      THREAD_REQUEST("Thomas Berger", "20 mai 2026",
        "Soirée de fin d'année pour l'équipe commerciale (30 pers.). Merci de prévoir un cocktail dînatoire et l'accès aux loges."),
      { id: "t2", from: "club", author: "Laure (SIG Strasbourg)", atLabel: "22 mai 2026", kind: "sent",
        body: "Bonjour, voici votre devis pour la soirée du 23 juin. Nous avons inclus la rencontre avec un joueur après le match. Au plaisir !" },
    ],
  },

  // ── draft — nouvelle demande à chiffrer (revisionCount 0) ──
  {
    id: "q08",
    ref: "qr_8sN4tQ1wYx",
    quoteNumber: "DEV-2026-00008",
    status: "draft",
    organizationName: "Caisse d'Épargne Grand Est",
    organizationSiret: "38381935400012",
    contactName: "Sophie Marchal · DRH",
    contactEmail: "rh.grandest@ce.example",
    experienceTitle: "Atelier cohésion d'équipe",
    experienceSlug: "atelier-cohesion-equipe",
    clubName: "SIG Strasbourg",
    projectTitle: "Maillots saison",
    requestedDateISO: "2026-06-27",
    requestedTime: "14:00",
    participants: 24,
    location: "at_client",
    addressForService: "1 place du Corbeau, 67000 Strasbourg",
    // Ligne pré-remplie depuis l'estimation catalogue — le club ajuste avant d'envoyer.
    lines: [
      { id: "l1", label: "Atelier cohésion d'équipe (3h)", detail: "Encadrement diplômé · matériel inclus", quantity: 24, unitPriceCents: 3_800 },
    ],
    createdAtLabel: "5 juin 2026",
    revisionCount: 0,
    thread: [
      THREAD_REQUEST("Sophie Marchal", "5 juin 2026",
        "Atelier d'intégration des nouveaux conseillers. Groupes de 8 idéalement, format dynamique. Intervention dans nos locaux."),
    ],
  },

  // ── draft — révision demandée par l'entreprise (revisionCount 1) ──
  {
    id: "q09",
    ref: "qr_9dF6rB3kHe",
    quoteNumber: "DEV-2026-00009",
    status: "draft",
    organizationName: "Decathlon Campus",
    organizationSiret: "50056940500017",
    contactName: "Adrien Klein · People Ops",
    contactEmail: "events.campus@decathlon.example",
    contactPhone: "06 11 22 33 44",
    experienceTitle: "Initiation basket encadrée",
    experienceSlug: "initiation-basket-encadree",
    clubName: "SIG Strasbourg",
    projectTitle: "Tournoi U17",
    requestedDateISO: "2026-07-04",
    requestedTime: "10:00",
    participants: 36,
    location: "at_club",
    lines: [
      { id: "l1", label: "Initiation basket encadrée (2h30)", detail: "2 coachs · matériel fourni", quantity: 36, unitPriceCents: 2_500 },
    ],
    createdAtLabel: "28 mai 2026",
    sentAtLabel: "30 mai 2026",
    revisionCount: 1,
    thread: [
      THREAD_REQUEST("Adrien Klein", "28 mai 2026",
        "Journée d'équipe, 36 personnes. On aimerait une initiation puis un petit tournoi pour finir."),
      { id: "t2", from: "club", author: "Laure (SIG Strasbourg)", atLabel: "30 mai 2026", kind: "sent",
        body: "Voici une première proposition d'initiation encadrée." },
      { id: "t3", from: "org", author: "Adrien Klein", atLabel: "3 juin 2026", kind: "revision",
        body: "Merci ! Peut-on ajouter le mini-tournoi de fin évoqué, et prévoir une collation ? Je revalide ensuite." },
    ],
  },

  // ── accepted — devenu une réservation (acompte à régler / réglé) ──
  {
    id: "q10",
    ref: "qr_10aZ5cW8Jt",
    quoteNumber: "DEV-2026-00010",
    status: "accepted",
    organizationName: "Klaxoon SAS",
    organizationSiret: "81204759300025",
    contactName: "Camille Léger · Office Manager",
    contactEmail: "seminaires@klaxoon.example",
    contactPhone: "06 12 34 56 78",
    experienceTitle: "Journée immersion · SIG",
    experienceSlug: "journee-immersion-sig",
    clubName: "SIG Strasbourg",
    projectTitle: "École de jeunes U17",
    requestedDateISO: "2026-06-16",
    requestedTime: "09:00",
    participants: 40,
    location: "at_venue",
    lines: [
      { id: "l1", label: "Journée immersion (6h)", detail: "Programme complet · 6 temps forts", quantity: 40, unitPriceCents: 12_000 },
    ],
    validUntilISO: "2026-06-14",
    createdAtLabel: "26 mai 2026",
    sentAtLabel: "27 mai 2026",
    decidedAtLabel: "28 mai 2026",
    revisionCount: 0,
    bookingRef: "SOC-2026-00042",
    thread: [
      THREAD_REQUEST("Camille Léger", "26 mai 2026",
        "Séminaire annuel d'équipe, 40 collaborateurs (dont 6 à mobilité réduite). Prévoir une salle au calme pour le débrief de l'après-midi."),
      { id: "t2", from: "club", author: "Laure (SIG Strasbourg)", atLabel: "27 mai 2026", kind: "sent",
        body: "Devis pour la journée immersion du 16 juin. Salle au calme prévue, accessibilité PMR confirmée." },
      { id: "t3", from: "org", author: "Camille Léger", atLabel: "28 mai 2026", kind: "decision",
        body: "Parfait, c'est validé de notre côté. Je procède à l'acompte." },
    ],
  },

  // ── refused ──
  {
    id: "q11",
    ref: "qr_11bY4dV7Ku",
    quoteNumber: "DEV-2026-00011",
    status: "refused",
    organizationName: "Groupe Lorraine Énergie",
    organizationSiret: "44229377100018",
    contactName: "Marc Antoine · Directeur RSE",
    contactEmail: "rse@lorraine-energie.example",
    experienceTitle: "Match VIP & hospitalités",
    experienceSlug: "match-vip-hospitalites",
    clubName: "SIG Strasbourg",
    projectTitle: "Mini-bus du club",
    requestedDateISO: "2026-05-30",
    requestedTime: "18:00",
    participants: 30,
    location: "at_venue",
    lines: [
      { id: "l1", label: "Soirée match VIP — places en loge", quantity: 30, unitPriceCents: 6_500 },
    ],
    validUntilISO: "2026-05-25",
    createdAtLabel: "5 mai 2026",
    sentAtLabel: "8 mai 2026",
    decidedAtLabel: "12 mai 2026",
    revisionCount: 0,
    thread: [
      THREAD_REQUEST("Marc Antoine", "5 mai 2026", "Soirée hospitalités pour 30 invités."),
      { id: "t2", from: "club", author: "Laure (SIG Strasbourg)", atLabel: "8 mai 2026", kind: "sent",
        body: "Voici notre proposition pour votre soirée." },
      { id: "t3", from: "org", author: "Marc Antoine", atLabel: "12 mai 2026", kind: "decision",
        body: "Merci, mais le budget n'a pas été validé en interne cette année. Peut-être l'an prochain." },
    ],
  },

  // ── expired ──
  {
    id: "q12",
    ref: "qr_12cX3eU6Lv",
    quoteNumber: "DEV-2026-00012",
    status: "expired",
    organizationName: "Banque CIC Est",
    organizationSiret: "75450025000014",
    contactName: "Léa Humbert · Office Manager",
    contactEmail: "evenements@cic-est.example",
    experienceTitle: "Cocktail & visite des coulisses",
    experienceSlug: "cocktail-visite-coulisses",
    clubName: "SIG Strasbourg",
    projectTitle: "École de jeunes U17",
    requestedDateISO: "2026-05-09",
    requestedTime: "19:00",
    participants: 40,
    location: "at_venue",
    lines: [
      { id: "l1", label: "Cocktail & visite des coulisses", quantity: 40, unitPriceCents: 2_750 },
    ],
    validUntilISO: "2026-05-15",
    createdAtLabel: "15 avr. 2026",
    sentAtLabel: "18 avr. 2026",
    revisionCount: 0,
    thread: [
      THREAD_REQUEST("Léa Humbert", "15 avr. 2026", "Soirée pour 40 invités, cocktail + coulisses."),
      { id: "t2", from: "club", author: "Laure (SIG Strasbourg)", atLabel: "18 avr. 2026", kind: "sent",
        body: "Voici votre devis, valable jusqu'au 15 mai." },
    ],
  },
];

// TODO(api): scoper sur le club du club_admin connecté (Prisma).
export async function getQuotesForClub(_clubId: string): Promise<Quote[]> {
  return QUOTES;
}

// TODO(api): scoper sur l'Organization de l'org_buyer connecté (Prisma).
export async function getQuotesForOrg(_orgId?: string): Promise<Quote[]> {
  return QUOTES;
}

/** Récupère un devis par son token opaque d'URL (/devis/[ref]). */
export async function getQuoteByRef(ref: string): Promise<Quote | null> {
  return QUOTES.find((q) => q.ref === ref) ?? null;
}

/** Récupère le devis accepté correspondant à une réf. de réservation (garde /reserver). */
export async function getQuoteByBookingRef(bookingRef: string): Promise<Quote | null> {
  return QUOTES.find((q) => q.bookingRef === bookingRef && q.status === "accepted") ?? null;
}

/** Réf. d'un devis « sent » pour la navigation dev (le parcours réel passe par magic-link email). */
export const SAMPLE_SENT_QUOTE_REF = "qr_7h2Kp9vLmZ";
