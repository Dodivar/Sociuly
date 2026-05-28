"use server";

import { newsletterSchema } from "@/lib/schemas/newsletter.schema";
import { safeValidate } from "@/lib/schemas/safe-validate";

type Result =
  | { success: true; data: { email: string } }
  | { success: false; errors: Record<string, string> };

export async function subscribeNewsletter(raw: unknown): Promise<Result> {
  const validation = safeValidate(newsletterSchema, raw);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  const { email } = validation.data;

  // TODO Phase B: await db.subscriber.upsert({ where: { email }, create: { email }, update: {} })

  return { success: true, data: { email } };
}
