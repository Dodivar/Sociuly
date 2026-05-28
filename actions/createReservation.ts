"use server";

import { reservationSchema } from "@/lib/schemas/reservation.schema";
import { safeValidate } from "@/lib/schemas/safe-validate";

type Result =
  | { success: true; data: { bookingNumber: string; idempotencyKey: string } }
  | { success: false; errors: Record<string, string> };

/**
 * Idempotency store en mémoire pour la Phase A.
 * Phase B: remplacer par un champ unique `idempotency_key` en DB avec un upsert Prisma.
 */
const _processed = new Map<string, string>();

export async function createReservation(raw: unknown): Promise<Result> {
  const validation = safeValidate(reservationSchema, raw);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  const { idempotencyKey, prestationRef, nom, telephone, message, tipCents } =
    validation.data;

  // Idempotency : même clé → même réponse sans double-insertion
  const cached = _processed.get(idempotencyKey);
  if (cached) {
    return { success: true, data: { bookingNumber: cached, idempotencyKey } };
  }

  // TODO Phase B:
  // const existing = await db.booking.findUnique({ where: { idempotencyKey } });
  // if (existing) return { success: true, data: { bookingNumber: existing.bookingNumber, idempotencyKey } };
  //
  // const booking = await db.booking.create({
  //   data: { nom, telephone, message, tipCents, idempotencyKey, prestationRef, status: "PENDING" },
  // });
  // return { success: true, data: { bookingNumber: booking.bookingNumber, idempotencyKey } };

  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 99999)).padStart(5, "0");
  const bookingNumber = `SOC-${year}-${seq}`;

  _processed.set(idempotencyKey, bookingNumber);

  // Supprime les variables inutilisées de la destructuration (linter Phase B)
  void nom; void telephone; void message; void tipCents; void prestationRef;

  return { success: true, data: { bookingNumber, idempotencyKey } };
}
