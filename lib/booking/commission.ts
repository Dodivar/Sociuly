// Calcul de la commission Sociuly et décomposition des montants — SERVEUR UNIQUEMENT.
//
// SPEC §4/§5 (non négociable) :
//  - Commission Sociuly = 6 % du total TTC de chaque Booking confirmé.
//  - Calculée UNIQUEMENT côté serveur, JAMAIS surfacée à l'acheteur.
//  - Stripe : application_fee_amount = round(grossAmountTTCCents * 0.06),
//    transfer_data.destination = club.stripeAccountId.
//
// Ce module ne doit être importé que depuis du code serveur (Server Actions,
// route handlers, cron). Ne JAMAIS l'importer dans un Client Component.
// TVA 20 % (décision actée) ; aucune TVA sur la commission elle-même (décision actée).

import { VAT_RATE } from "./tunnel";

/** Taux de commission Sociuly sur le TTC (SPEC §4). Source unique. */
export const COMMISSION_RATE = 0.06;

export type BookingAmounts = {
  /** Base hors taxes (somme des lignes HT du devis). */
  amountHTCents: number;
  /** TVA 20 % sur la base HT. */
  vatCents: number;
  /** Total TTC = HT + TVA, payé par l'entreprise. */
  grossAmountTTCCents: number;
  /** Commission Sociuly = 6 % du TTC (sans TVA sur la commission). */
  feeAmountCents: number;
  /** Net reversé au club = TTC − commission. */
  netAmountCents: number;
};

/**
 * Décompose un montant HT (cents) en HT / TVA / TTC + commission Sociuly + net club.
 * Unique source de vérité du calcul de commission (Stripe application_fee_amount).
 */
export function computeBookingAmounts(amountHTCents: number): BookingAmounts {
  const vatCents = Math.round(amountHTCents * VAT_RATE);
  const grossAmountTTCCents = amountHTCents + vatCents;
  const feeAmountCents = Math.round(grossAmountTTCCents * COMMISSION_RATE);
  const netAmountCents = grossAmountTTCCents - feeAmountCents;
  return { amountHTCents, vatCents, grossAmountTTCCents, feeAmountCents, netAmountCents };
}

/** Montant Stripe `application_fee_amount` (commission) pour un TTC donné (cents). */
export function applicationFeeAmount(grossAmountTTCCents: number): number {
  return Math.round(grossAmountTTCCents * COMMISSION_RATE);
}
