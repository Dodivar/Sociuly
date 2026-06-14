// Numérotation légale séquentielle — SERVEUR UNIQUEMENT (server-only).
// Formats SPEC §3 : devis DEV-YYYY-NNNNN, réservation SOC-YYYY-NNNNN, facture
// séquentielle. L'incrément passe par une seule instruction SQL atomique
// (INSERT … ON CONFLICT … DO UPDATE SET value = value + 1 RETURNING value) sur la
// table Counter (clé composite scope+année) — sûr face aux écritures concurrentes
// en serverless (pas de race select-puis-update). À appeler dans la transaction de
// la Server Action (création de devis / acceptation / facturation).

import "server-only";

import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient | typeof prisma;

/** Prochaine valeur de séquence pour (scope, année), atomique. */
async function nextSequence(scope: string, year: number, tx: Tx = prisma): Promise<number> {
  const rows = await tx.$queryRaw<{ value: number }[]>`
    INSERT INTO "Counter" ("scope", "year", "value") VALUES (${scope}, ${year}, 1)
    ON CONFLICT ("scope", "year") DO UPDATE SET "value" = "Counter"."value" + 1
    RETURNING "value"`;
  return rows[0].value;
}

function pad5(n: number): string {
  return String(n).padStart(5, "0");
}

/** DEV-YYYY-NNNNN — numéro légal d'un devis (assigné à l'envoi). */
export async function nextQuoteNumber(tx?: Tx, year = new Date().getFullYear()): Promise<string> {
  return `DEV-${year}-${pad5(await nextSequence("quote", year, tx))}`;
}

/** SOC-YYYY-NNNNN — numéro de réservation (assigné à l'acceptation du devis). */
export async function nextBookingNumber(tx?: Tx, year = new Date().getFullYear()): Promise<string> {
  return `SOC-${year}-${pad5(await nextSequence("booking", year, tx))}`;
}

/** FAC-YYYY-NNNNN — numéro de facture légal séquentiel (émission post-confirmation). */
export async function nextInvoiceNumber(tx?: Tx, year = new Date().getFullYear()): Promise<string> {
  return `FAC-${year}-${pad5(await nextSequence("invoice", year, tx))}`;
}
