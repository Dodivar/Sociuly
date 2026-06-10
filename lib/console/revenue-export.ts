// Export comptable des revenus du club (cf. SPEC §8 — export self-service RGPD).
// Fonctions pures (sans accès navigateur) construisant un CSV à partir du
// view-model RevenueData déjà chargé : la vue cliente n'a plus qu'à déclencher
// le téléchargement. Montants en cents (EUR), jamais de float (SPEC §3).

import {
  ENCAISSEMENT_LABEL,
  UPCOMING_STATUS_LABEL,
  type RevenueData,
} from "./revenues";

// Les trois grands livres exportables correspondent aux onglets de la vue.
export type RevenueLedger = "upcoming" | "history" | "encaissements";

const SEP = ";"; // séparateur attendu par Excel en locale FR
const BOM = "﻿"; // force l'interprétation UTF-8 par Excel (accents)
const EOL = "\r\n"; // fin de ligne CSV (RFC 4180)

// Montant cents → « 1234,56 » : décimale française, sans symbole ni séparateur
// de milliers pour rester directement exploitable dans un tableur.
function csvAmount(cents: number): string {
  return (cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  });
}

// Échappe un champ selon RFC 4180 (guillemets si séparateur, guillemet ou saut de ligne).
function csvField(value: string): string {
  return /[";\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((cols) => cols.map(csvField).join(SEP));
  return BOM + lines.join(EOL) + EOL;
}

/** Construit le CSV du grand livre demandé à partir des données déjà chargées. */
export function revenueLedgerCsv(ledger: RevenueLedger, data: RevenueData): string {
  switch (ledger) {
    case "upcoming":
      return toCsv(
        [
          "N° réservation", "Organisation", "Expérience", "Date expérience",
          "Statut", "Versement prévu",
          "Brut TTC (€)", "Commission (€)", "Net à verser (€)",
        ],
        data.upcoming.map((r) => [
          r.bookingNumber, r.orgName, r.experienceTitle, r.experienceDateLabel,
          UPCOMING_STATUS_LABEL[r.status], r.payoutDateLabel,
          csvAmount(r.grossAmountTTCCents), csvAmount(r.feeAmountCents), csvAmount(r.netAmountCents),
        ]),
      );
    case "history":
      return toCsv(
        [
          "Versé le", "N° réservation", "Organisation", "Expérience",
          "Brut TTC (€)", "Commission (€)", "Net versé (€)",
        ],
        data.history.map((r) => [
          r.paidAtLabel, r.bookingNumber, r.orgName, r.experienceTitle,
          csvAmount(r.grossAmountTTCCents), csvAmount(r.feeAmountCents), csvAmount(r.netAmountCents),
        ]),
      );
    case "encaissements":
      return toCsv(
        ["Encaissé le", "N° réservation", "Organisation", "Type", "Montant TTC (€)"],
        data.encaissements.map((r) => [
          r.paidAtLabel, r.bookingNumber, r.orgName, ENCAISSEMENT_LABEL[r.kind], csvAmount(r.amountCents),
        ]),
      );
  }
}

const LEDGER_SLUG: Record<RevenueLedger, string> = {
  upcoming: "versements-a-venir",
  history: "historique-versements",
  encaissements: "encaissements",
};

/** Nom de fichier daté, ex. « sociuly-encaissements-2026-06-10.csv ». */
export function revenueExportFilename(ledger: RevenueLedger, date = new Date()): string {
  return `sociuly-${LEDGER_SLUG[ledger]}-${date.toISOString().slice(0, 10)}.csv`;
}
