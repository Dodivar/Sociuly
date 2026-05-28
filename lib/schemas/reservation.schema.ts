import { z } from "zod";

/** Accepte un numéro FR avec ou sans espaces : 06 12 34 56 78 → 0612345678 */
const PHONE_RE = /^(\+33|0)[1-9]\d{8}$/;

export const reservationSchema = z.object({
  nom: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(80, "Maximum 80 caractères"),

  telephone: z
    .string()
    .refine(
      (v) => v === "" || PHONE_RE.test(v.replace(/\s/g, "")),
      "Numéro invalide (ex : 06 12 34 56 78)",
    ),

  message: z
    .string()
    .max(500, "Maximum 500 caractères"),

  /** Montant en centimes d'euro, 0–500 € */
  tipCents: z
    .number()
    .int("Valeur entière requise")
    .min(0, "Montant minimum : 0 €")
    .max(50000, "Montant maximum : 500 €"),

  /** UUID généré côté client, servant de clé d'idempotence Stripe */
  idempotencyKey: z.string().uuid("Clé d'idempotence invalide"),

  prestationRef: z.string().min(1, "Référence de prestation requise"),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
