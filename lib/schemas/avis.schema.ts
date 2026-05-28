import { z } from "zod";

export const avisSchema = z.object({
  auteur: z
    .string()
    .min(2, "Minimum 2 caractères")
    .max(80, "Maximum 80 caractères"),
  note: z
    .number()
    .int("Note entière requise")
    .min(1, "Minimum 1 étoile")
    .max(5, "Maximum 5 étoiles"),
  commentaire: z
    .string()
    .min(10, "Minimum 10 caractères")
    .max(500, "Maximum 500 caractères"),
  prestationId: z.string().min(1, "Identifiant de prestation requis"),
});

export type AvisInput = z.infer<typeof avisSchema>;
