// Schémas Zod pour les flux d'auth.
// Règle projet (.claude/rules/01-tech-stack.md) : Zod est la lib de validation
// pour toute entrée Server Action / route API / webhook.

import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z
    .string({ required_error: "Renseignez votre adresse e-mail." })
    .trim()
    .toLowerCase()
    .min(1, "Renseignez votre adresse e-mail.")
    .email("Cette adresse e-mail ne semble pas valide."),
  // Conservé hidden côté form, pour rerouter après authentification.
  redirect: z.string().optional(),
});

export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
export type MagicLinkField = keyof MagicLinkInput;
export type FieldErrors<T extends string> = Partial<Record<T, string>>;

export function parseMagicLink(raw: FormData): {
  values: { email: string; redirect: string };
  errors: FieldErrors<MagicLinkField>;
} {
  const parsed = magicLinkSchema.safeParse({
    email: raw.get("email") ?? "",
    redirect: raw.get("redirect") ?? "",
  });

  if (!parsed.success) {
    const errors: FieldErrors<MagicLinkField> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as MagicLinkField | undefined;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return {
      values: {
        email: String(raw.get("email") ?? ""),
        redirect: String(raw.get("redirect") ?? ""),
      },
      errors,
    };
  }

  return {
    values: { email: parsed.data.email, redirect: parsed.data.redirect ?? "" },
    errors: {},
  };
}
