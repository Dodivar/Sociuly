// Helpers de formatage FR — centralise des fonctions auparavant dupliquées dans
// plusieurs modules (montants, libellé de créneau). Tous les montants sont en
// centimes (Int), jamais de float — cf. CLAUDE.md §3.

const FR = "fr-FR";

// ─────── Montants (convention FR : symbole € en suffixe) ───────

/** Centimes → « 1 234 € » (arrondi à l'euro, sans décimale). */
export const eur = (cents: number): string =>
  `${(cents / 100).toLocaleString(FR, { maximumFractionDigits: 0 })} €`;

/** Centimes → « 1 234,56 € » (2 décimales — devis, factures, récap). */
export const eurDecimal = (cents: number): string =>
  `${(cents / 100).toLocaleString(FR, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/** Centimes → « 1 234 € » (arrondi via Math.round). */
export const eurWhole = (cents: number): string =>
  `${Math.round(cents / 100).toLocaleString(FR)} €`;

// ─────── Variante console / DS : symbole € en préfixe (« €1 234 ») ───────
// Convention d'affichage des écrans console club (cf. ds-patterns).

/** Centimes → « €1 234,56 » (2 décimales). */
export const eurSym = (cents: number): string =>
  `€${(cents / 100).toLocaleString(FR, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Centimes → « €1 234 » (arrondi). */
export const eurSymWhole = (cents: number): string =>
  `€${Math.round(cents / 100).toLocaleString(FR)}`;

// ─────── Libellé de créneau FR (« lun. 16 juin · 09h00 ») ───────
const WEEKDAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

/** Créneau `{ date: "2026-06-16", time: "09:00" }` → « lun. 16 juin · 09h00 ». */
export function slotLabel(s: { date: string; time: string }): string {
  const d = new Date(`${s.date}T00:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${s.time.replace(":", "h")}`;
}
