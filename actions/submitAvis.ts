"use server";

import { avisSchema } from "@/lib/schemas/avis.schema";
import { safeValidate } from "@/lib/schemas/safe-validate";

type Result =
  | { success: true; data: { id: string } }
  | { success: false; errors: Record<string, string> };

export async function submitAvis(raw: unknown): Promise<Result> {
  const validation = safeValidate(avisSchema, raw);
  if (!validation.success) {
    return { success: false, errors: validation.errors };
  }

  const avis = validation.data;

  // TODO Phase B:
  // const record = await db.avis.create({
  //   data: { ...avis, createdAt: new Date() },
  // });
  // return { success: true, data: { id: record.id } };

  const mockId = `avis_${Date.now()}_${avis.prestationId.slice(0, 8)}`;
  return { success: true, data: { id: mockId } };
}
