"use server";

// Server Action — demande de devis publique (entrée du tunnel B2B, SPEC §4/§6).
// Modèle « frictionless » (décision §11) : on capte SIRET + contact, on crée/rapproche
// l'Organization acheteuse et on ouvre un Quote(draft) côté club. AUCUN paiement, AUCUN
// compte requis à ce stade — le contact est mémorisé sur le devis (snapshot) pour que le
// club puisse répondre ; le compte org_buyer pourra être réclamé plus tard.
//
// Le club reçoit la demande dans sa console (/console/[clubId]/devis), la chiffre et
// l'envoie (sendQuoteAction) : c'est là que les montants sont calculés (serveur).

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { lookupSiret } from "@/lib/account/siret";
import { makeQuoteRef, SAMPLE_SENT_QUOTE_REF } from "@/lib/devis/quotes";
import { nextQuoteNumber } from "@/lib/devis/numbering.server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export type RequestQuoteResult =
  | { ok: true; ref: string }
  | { ok: false; error: string };

const requestSchema = z.object({
  clubSlug: z.string().min(1).max(120),
  experienceSlug: z.string().min(1).max(160).optional(),
  requestedDateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date souhaitée invalide"),
  requestedTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  participants: z.number().int().min(1).max(100_000),
  format: z.enum(["sur_mesure", "demi_journee", "journee", "soiree"]).optional(),
  budgetCents: z.number().int().min(0).max(100_000_000).optional(),
  location: z.enum(["at_client", "at_club", "at_venue", "flexible"]),
  serviceAddress: z.string().trim().max(300).optional(),
  company: z.object({
    name: z.string().trim().min(1, "Raison sociale requise").max(160),
    siret: z.string().regex(/^\d{14}$/, "SIRET à 14 chiffres"),
  }),
  contact: z.object({
    name: z.string().trim().min(1, "Nom du contact requis").max(120),
    email: z.string().trim().email("Email invalide").max(160),
    phone: z.string().trim().max(40).optional(),
  }),
  message: z.string().trim().max(2000).optional(),
});

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

const eur = (cents: number) => `${Math.round(cents / 100).toLocaleString("fr-FR")} €`;

export async function requestQuoteAction(input: z.input<typeof requestSchema>): Promise<RequestQuoteResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Demande invalide" };
  }
  const d = parsed.data;

  // Mode maquette / build sans base : on simule un succès pour garder le parcours
  // navigable (cohérent avec connexion/actions.ts), sans écriture DB.
  if (!isDatabaseConfigured) {
    return { ok: true, ref: SAMPLE_SENT_QUOTE_REF };
  }

  const club = await prisma.club.findUnique({ where: { slug: d.clubSlug }, select: { id: true } });
  if (!club) return { ok: false, error: "Club introuvable." };

  // En mode expérience : l'Experience doit appartenir au club ciblé.
  let experienceId: string | null = null;
  if (d.experienceSlug) {
    const exp = await prisma.experience.findUnique({
      where: { slug: d.experienceSlug },
      select: { id: true, clubId: true },
    });
    if (!exp || exp.clubId !== club.id) {
      return { ok: false, error: "Expérience introuvable pour ce club." };
    }
    experienceId = exp.id;
  }

  // Enrichissement INSEE (best-effort) : raison sociale officielle si disponible.
  const insee = await lookupSiret(d.company.siret);
  const orgName = insee.name?.trim() || d.company.name;

  // Rapprochement / création de l'Organization par SIRET (unique).
  const org =
    (await prisma.organization.findUnique({ where: { siret: d.company.siret }, select: { id: true } })) ??
    (await prisma.organization.create({
      data: {
        siret: d.company.siret,
        name: orgName,
        slug: `${slugify(orgName) || "entreprise"}-${d.company.siret.slice(-5)}`,
      },
      select: { id: true },
    }));

  const requestedDate = new Date(`${d.requestedDateISO}T${d.requestedTime ?? "09:00"}:00.000Z`);

  // Corps de la demande : message + format/budget indicatifs (mode sur mesure).
  const FORMAT_LABEL: Record<string, string> = {
    sur_mesure: "Sur mesure", demi_journee: "Demi-journée", journee: "Journée", soiree: "Soirée",
  };
  const bodyParts = [d.message?.trim()].filter(Boolean) as string[];
  if (!experienceId && d.format) bodyParts.push(`Format souhaité : ${FORMAT_LABEL[d.format] ?? d.format}.`);
  if (d.budgetCents) bodyParts.push(`Budget indicatif : ~${eur(d.budgetCents)} HT.`);
  const body = bodyParts.join("\n\n") || "Nouvelle demande de devis.";

  const ref = makeQuoteRef();

  await prisma.$transaction(async (tx) => {
    const quoteNumber = await nextQuoteNumber(tx);
    const quote = await tx.quote.create({
      data: {
        ref,
        quoteNumber,
        organizationId: org.id,
        clubId: club.id,
        experienceId,
        requestedDate,
        requestedTime: d.requestedTime ?? null,
        participants: d.participants,
        location: d.location,
        serviceAddress: d.serviceAddress?.trim() || null,
        requesterName: d.contact.name,
        requesterEmail: d.contact.email,
        requesterPhone: d.contact.phone?.trim() || null,
        // Pas encore chiffré : montants à 0 jusqu'à l'envoi par le club (sendQuoteAction).
        amountHTCents: 0,
        vatCents: 0,
        amountTTCCents: 0,
        feeAmountCents: 0,
        netAmountCents: 0,
        status: "draft",
      },
      select: { id: true },
    });

    await tx.quoteEvent.create({
      data: {
        quoteId: quote.id,
        actor: "org",
        author: d.contact.name,
        body,
        kind: "request",
      },
    });
  });

  // Le club voit la nouvelle demande dans sa console.
  revalidatePath(`/console/${club.id}/devis`);
  return { ok: true, ref };
}
