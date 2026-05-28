import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, "L'adresse e-mail est requise")
    .email("Adresse e-mail invalide"),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
