import { z } from "zod";

export type ValidationSuccess<T> = { success: true; data: T };
export type ValidationFailure = { success: false; errors: Record<string, string> };
export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;

/**
 * Wrapper autour de safeParse : normalise les ZodError en { field → message }.
 * Partageable client/serveur — pas de dépendance Next.js.
 */
export function safeValidate<T>(
  schema: z.ZodType<T>,
  data: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
    if (!errors[key]) {
      errors[key] = issue.message;
    }
  }
  return { success: false, errors };
}
