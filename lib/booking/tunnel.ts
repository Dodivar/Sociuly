// Logique du tunnel de réservation /reserver/[ref] — types, validation par
// étape et calculs de montants. Front v1 (SPEC §6, parcours « Contractualisation
// / Paiement »). Tous les montants sont en centimes (Int), jamais de float
// (SPEC §3). La commission Sociuly (6% TTC) n'est JAMAIS surfacée à l'acheteur
// (SPEC §5) — calcul serveur uniquement, absent de ce fichier.

import type {
  ExperienceLocation,
  ExperienceSlot,
  PriceModel,
} from "@/lib/marketplace/experience-detail";

// ─────── Résumé sérialisable de l'expérience passé au Client Component ───────
export type BookingExperience = {
  /** Réf. de réservation (= slug expérience en v1, futur Booking.bookingNumber). */
  ref: string;
  slug: string;
  title: string;
  clubName: string;
  cityLabel: string;
  venueLabel: string;
  rating: number;
  reviewCount: number;
  hue: string;
  location: ExperienceLocation;
  format: string;
  capacityMin: number;
  capacityMax: number;
  priceModel: PriceModel;
  pricePerPersonCents: number;
  basePriceCents: number;
  projectTitle: string;
  slots: ExperienceSlot[];
};

// ─────── Mode de lieu choisi par l'acheteur (pour location flexible) ───────
export type LocationMode = "at_client" | "at_venue";

// ─────── État de formulaire persisté entre les étapes ───────
export type BookingForm = {
  // Étape 1 — Détails
  slotIdx: number;
  participants: number;
  /** Pertinent uniquement quand l'expérience est `flexible`. */
  locationMode: LocationMode;
  addressLine: string;
  addressPostal: string;
  addressCity: string;
  // Étape 2 — Coordonnées entreprise
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  message: string;
  // Étape 3 — Acompte
  cgvAccepted: boolean;
};

export type FieldErrors = Partial<Record<keyof BookingForm, string>>;

/** 1 = Détails, 2 = Coordonnées, 3 = Acompte (l'étape 4 = page Confirmation). */
export type StepNumber = 1 | 2 | 3;
export const LAST_TUNNEL_STEP: StepNumber = 3;

// ─────── Acompte (SPEC §4 — défaut 30%, décision OUVERTE §11) ───────
// TODO(§11) : le pourcentage d'acompte et la date limite de solde (D−X) doivent
// être validés. Ne pas figer ailleurs qu'ici.
export const DEPOSIT_RATE = 0.3;

// ─────── Calculs de montants (TTC indicatif) ───────
// TODO(§11) : décomposition HT / TVA / TTC selon Club.vatLiable — décision
// comptable OUVERTE. L'acheteur ne voit que le TTC + l'échéancier (SPEC §5).
export function estimateCents(exp: BookingExperience, participants: number): number {
  return exp.priceModel === "per_person"
    ? exp.pricePerPersonCents * participants
    : exp.basePriceCents;
}

export function depositCents(totalCents: number): number {
  return Math.round(totalCents * DEPOSIT_RATE);
}

// ─────── Lieu : faut-il demander une adresse à l'acheteur ? ───────
// `at_client` impose l'adresse ; `flexible` l'impose seulement si l'acheteur
// choisit « à notre adresse » ; `at_club` / `at_venue` se déroulent au club.
export function needsAddress(exp: BookingExperience, form: BookingForm): boolean {
  if (exp.location === "at_client") return true;
  if (exp.location === "flexible" && form.locationMode === "at_client") return true;
  return false;
}

export function allowsLocationChoice(exp: BookingExperience): boolean {
  return exp.location === "flexible";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─────── Validation par étape ───────

/** Étape 1 — date dispo, effectif dans la fourchette, adresse si `at_client`. */
export function validateStep1(exp: BookingExperience, form: BookingForm): FieldErrors {
  const e: FieldErrors = {};

  if (form.slotIdx < 0 || form.slotIdx >= exp.slots.length) {
    e.slotIdx = "Choisissez une date et un créneau disponibles";
  }

  if (!Number.isFinite(form.participants)) {
    e.participants = "Indiquez le nombre de participants";
  } else if (form.participants < exp.capacityMin || form.participants > exp.capacityMax) {
    e.participants = `Effectif entre ${exp.capacityMin} et ${exp.capacityMax} personnes`;
  }

  if (needsAddress(exp, form)) {
    if (!form.addressLine.trim()) e.addressLine = "Adresse requise pour une intervention sur site";
    if (!form.addressCity.trim()) e.addressCity = "Ville requise";
    if (!/^\d{5}$/.test(form.addressPostal.trim())) e.addressPostal = "Code postal invalide (5 chiffres)";
  }

  return e;
}

/** Étape 2 — coordonnées de l'entreprise acheteuse (SPEC §2 : le buyer est une Organization). */
export function validateStep2(form: BookingForm): FieldErrors {
  const e: FieldErrors = {};

  if (!form.companyName.trim()) e.companyName = "Nom de l'entreprise requis";
  else if (form.companyName.trim().length < 2) e.companyName = "Au moins 2 caractères";

  if (!form.contactName.trim()) e.contactName = "Nom du contact référent requis";

  if (!form.contactEmail.trim()) e.contactEmail = "Email requis";
  else if (!EMAIL_RE.test(form.contactEmail.trim())) e.contactEmail = "Email invalide";

  return e;
}

/** Étape 3 — acceptation des CGV avant le paiement de l'acompte. */
export function validateStep3(form: BookingForm): FieldErrors {
  const e: FieldErrors = {};
  if (!form.cgvAccepted) e.cgvAccepted = "Vous devez accepter les conditions pour régler l'acompte";
  return e;
}

export function validateStep(
  step: StepNumber,
  exp: BookingExperience,
  form: BookingForm,
): FieldErrors {
  if (step === 1) return validateStep1(exp, form);
  if (step === 2) return validateStep2(form);
  return validateStep3(form);
}

export function isStepValid(step: StepNumber, exp: BookingExperience, form: BookingForm): boolean {
  return Object.keys(validateStep(step, exp, form)).length === 0;
}

// ─────── Numéro de réservation factice (placeholder paiement) ───────
// SPEC §3 — format Booking.bookingNumber = SOC-YYYY-NNNNN. En Phase B il est
// généré côté serveur à l'acceptation du devis ; ici on en fabrique un pour la
// page de confirmation (UI seulement).
export function makeBookingNumber(): string {
  const year = new Date().getFullYear();
  const n = String(Math.floor(10000 + Math.random() * 89999)).slice(0, 5);
  return `SOC-${year}-${n}`;
}
