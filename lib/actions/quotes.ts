"use server";

// Server Actions du cycle de vie d'un devis (cœur du flux B2B — SPEC §4).
//   club  : sendQuoteAction        chiffrage → Quote(sent) + numéro DEV-YYYY-NNNNN
//   org   : acceptQuoteAction      Quote(accepted) + Booking(quote_accepted) + Payout
//   org   : refuseQuoteAction      Quote(refused)
//   org   : requestRevisionAction  Quote(sent) → Quote(draft) (aller-retour, §4)
//
// Invariants (CLAUDE.md §4) appliqués CÔTÉ SERVEUR :
//   • montants recalculés ici (jamais de confiance au client) via computeBookingAmounts ;
//   • TVA selon Club.vatLiable, commission 6 % du TTC, acompte 30 % (décisions §11) ;
//   • machine à états Quote/Booking respectée (transitions autorisées seulement) ;
//   • RBAC : club_admin membre du club (envoi) / org_buyer propriétaire (décisions).
// Tous les montants en centimes (Int), jamais de float (SPEC §3).

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { currentOrgId } from "@/lib/account/org";
import { requireClubAccess, requireRole } from "@/lib/auth/rbac";
import { isAuthEnforced } from "@/lib/auth/session";
import { computeBookingAmounts } from "@/lib/booking/commission";
import { DEPOSIT_RATE } from "@/lib/booking/tunnel";
import { defaultValidUntilISO } from "@/lib/devis/quotes";
import { nextBookingNumber } from "@/lib/devis/numbering.server";
import { prisma } from "@/lib/prisma";

export type ActionResult =
  | { ok: true; bookingRef?: string }
  | { ok: false; error: string };

// ─────── Schémas Zod ───────
const lineSchema = z.object({
  label: z.string().trim().min(1, "Intitulé requis").max(120),
  detail: z.string().trim().max(200).optional(),
  quantity: z.number().int().min(1).max(100_000),
  unitPriceCents: z.number().int().min(0).max(100_000_000),
});

const sendSchema = z.object({
  quoteId: z.string().uuid(),
  lines: z.array(lineSchema).min(1, "Ajoutez au moins une ligne").max(40),
  message: z.string().trim().max(2000).optional(),
  validUntilISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const reopenSchema = z.object({ quoteId: z.string().uuid() });
const refSchema = z.object({ ref: z.string().trim().min(3).max(40) });
const revisionSchema = refSchema.extend({
  message: z.string().trim().min(1, "Précisez ce qu'il faut ajuster").max(2000),
});

function isoToDate(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

function todayUTC(): Date {
  return new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`);
}

// ─────── Club : chiffrage & envoi ───────
export async function sendQuoteAction(input: z.input<typeof sendSchema>): Promise<ActionResult> {
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }
  const { quoteId, lines, message, validUntilISO } = parsed.data;

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { club: true, events: true },
  });
  if (!quote) return { ok: false, error: "Devis introuvable" };

  // RBAC : club_admin membre du club propriétaire (redirige si non autorisé).
  await requireClubAccess(quote.clubId);

  // État : on ne chiffre/envoie qu'un brouillon (le retour en draft est géré par
  // requestRevisionAction). Empêche d'écraser un devis déjà accepté/refusé.
  if (quote.status !== "draft") {
    return { ok: false, error: "Ce devis n'est plus modifiable (déjà envoyé ou clôturé)." };
  }

  // Montants — autorité serveur. TVA selon l'assujettissement du club (§11).
  const amountHTCents = lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0);
  const amounts = computeBookingAmounts(amountHTCents, quote.club.vatLiable);

  const validUntil = isoToDate(validUntilISO ?? defaultValidUntilISO());
  // L'envoi par le club est toujours un événement "sent". Le compteur de révisions
  // (revisionCount) ne compte que les demandes de modif. de l'entreprise (kind
  // "revision", actor org). On adapte juste le texte si le club renvoie après coup.
  const isResend = quote.events.some((e) => e.kind === "sent");

  await prisma.$transaction(async (tx) => {
    // Le numéro légal DEV-YYYY-NNNNN est assigné à la création du devis (champ
    // obligatoire) ; l'envoi ne le modifie pas, il fige le chiffrage et le statut.
    await tx.quoteLine.deleteMany({ where: { quoteId } });
    await tx.quoteLine.createMany({
      data: lines.map((l, i) => ({
        quoteId,
        order: i,
        label: l.label,
        detail: l.detail ?? null,
        quantity: l.quantity,
        unitPriceCents: l.unitPriceCents,
      })),
    });

    await tx.quote.update({
      where: { id: quoteId },
      data: {
        amountHTCents: amounts.amountHTCents,
        vatCents: amounts.vatCents,
        amountTTCCents: amounts.grossAmountTTCCents,
        feeAmountCents: amounts.feeAmountCents,
        netAmountCents: amounts.netAmountCents,
        status: "sent",
        validUntil,
      },
    });

    await tx.quoteEvent.create({
      data: {
        quoteId,
        actor: "club",
        author: quote.club.name,
        body: message?.trim() || (isResend ? "Devis révisé et renvoyé." : "Devis envoyé."),
        kind: "sent",
      },
    });
  });

  revalidatePath(`/console/${quote.clubId}/devis`);
  revalidatePath(`/devis/${quote.ref}`);
  revalidatePath("/compte/devis");
  return { ok: true };
}

// ─────── Club : rouvrir un devis envoyé pour le corriger ───────
export async function reopenQuoteAction(input: z.input<typeof reopenSchema>): Promise<ActionResult> {
  const parsed = reopenSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Référence invalide" };

  const quote = await prisma.quote.findUnique({
    where: { id: parsed.data.quoteId },
    include: { club: true },
  });
  if (!quote) return { ok: false, error: "Devis introuvable" };

  await requireClubAccess(quote.clubId);

  // On ne rouvre qu'un devis envoyé non encore tranché par l'entreprise.
  if (quote.status !== "sent") {
    return { ok: false, error: "Seul un devis envoyé peut être rouvert." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.quote.update({ where: { id: quote.id }, data: { status: "draft" } });
    await tx.quoteEvent.create({
      data: {
        quoteId: quote.id,
        actor: "club",
        author: quote.club.name,
        body: "Devis rouvert pour modification.",
        kind: "note",
      },
    });
  });

  revalidatePath(`/console/${quote.clubId}/devis`);
  revalidatePath(`/devis/${quote.ref}`);
  return { ok: true };
}

// ─────── Org : décisions sur un devis envoyé ───────

type OwnedQuote = Awaited<ReturnType<typeof findOwnedQuote>>;

async function findOwnedQuote(ref: string) {
  return prisma.quote.findUnique({
    where: { ref },
    include: {
      club: true,
      experience: true,
      booking: true,
      organization: { include: { primaryContact: true } },
    },
  });
}

/** Charge un devis par token + vérifie le rôle org_buyer et la propriété (anti-IDOR). */
async function loadOwnedQuote(
  ref: string,
): Promise<{ ok: true; quote: NonNullable<OwnedQuote> } | { ok: false; error: string }> {
  await requireRole(["org_buyer"]);
  const quote = await findOwnedQuote(ref);
  if (!quote) return { ok: false, error: "Devis introuvable" };

  if (isAuthEnforced()) {
    const orgId = await currentOrgId();
    if (orgId && quote.organizationId !== orgId) {
      return { ok: false, error: "Accès refusé" };
    }
  }
  return { ok: true, quote };
}

function orgAuthor(quote: { organization: { name: string; primaryContact: { fullName: string | null } | null } }): string {
  return quote.organization.primaryContact?.fullName ?? quote.organization.name;
}

export async function acceptQuoteAction(input: z.input<typeof refSchema>): Promise<ActionResult> {
  const parsed = refSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Référence invalide" };

  const loaded = await loadOwnedQuote(parsed.data.ref);
  if (!loaded.ok) return loaded;
  const { quote } = loaded;

  // Idempotence : un Booking existe déjà → on renvoie sa référence.
  if (quote.booking) return { ok: true, bookingRef: quote.booking.bookingNumber };

  if (quote.status !== "sent") {
    return { ok: false, error: "Ce devis n'est plus en attente de décision." };
  }
  if (quote.validUntil && quote.validUntil < todayUTC()) {
    return { ok: false, error: "Ce devis a expiré. Demandez-en un nouveau au club." };
  }
  // Le modèle Booking exige une expérience et une date fermes.
  if (!quote.experienceId) {
    return { ok: false, error: "La réservation d'un devis sur-mesure n'est pas encore disponible." };
  }
  if (!quote.requestedDate) {
    return { ok: false, error: "Date souhaitée manquante sur ce devis." };
  }

  // Montants figés au devis (déjà calculés serveur à l'envoi). Acompte 30 % (§11).
  const depositCents = Math.round(quote.amountTTCCents * DEPOSIT_RATE);
  const experienceId = quote.experienceId;
  const requestedDate = quote.requestedDate;

  const bookingNumber = await prisma.$transaction(async (tx) => {
    const number = await nextBookingNumber(tx);

    await tx.quote.update({ where: { id: quote.id }, data: { status: "accepted" } });

    const booking = await tx.booking.create({
      data: {
        bookingNumber: number,
        quoteId: quote.id,
        organizationId: quote.organizationId,
        clubId: quote.clubId,
        experienceId,
        grossAmountTTCCents: quote.amountTTCCents,
        vatCents: quote.vatCents,
        feeAmountCents: quote.feeAmountCents,
        netAmountCents: quote.netAmountCents,
        depositCents,
        status: "quote_accepted",
        requestedDate,
      },
    });

    // Versement club (D+1 après réalisation, §4) — créé en attente de réalisation.
    await tx.payout.create({
      data: {
        bookingId: booking.id,
        grossAmountTTCCents: quote.amountTTCCents,
        feeAmountCents: quote.feeAmountCents,
        netAmountCents: quote.netAmountCents,
        status: "awaiting_completion",
      },
    });

    await tx.quoteEvent.create({
      data: {
        quoteId: quote.id,
        actor: "org",
        author: orgAuthor(quote),
        body: "Devis accepté. Règlement de l'acompte en cours.",
        kind: "decision",
      },
    });

    return number;
  });

  revalidatePath(`/devis/${quote.ref}`);
  revalidatePath(`/console/${quote.clubId}/devis`);
  revalidatePath("/compte");
  revalidatePath("/compte/devis");
  revalidatePath("/compte/reservations");
  return { ok: true, bookingRef: bookingNumber };
}

export async function refuseQuoteAction(input: z.input<typeof refSchema>): Promise<ActionResult> {
  const parsed = refSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Référence invalide" };

  const loaded = await loadOwnedQuote(parsed.data.ref);
  if (!loaded.ok) return loaded;
  const { quote } = loaded;

  if (quote.status !== "sent") {
    return { ok: false, error: "Ce devis n'est plus en attente de décision." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.quote.update({ where: { id: quote.id }, data: { status: "refused" } });
    await tx.quoteEvent.create({
      data: { quoteId: quote.id, actor: "org", author: orgAuthor(quote), body: "Devis refusé.", kind: "decision" },
    });
  });

  revalidatePath(`/devis/${quote.ref}`);
  revalidatePath(`/console/${quote.clubId}/devis`);
  revalidatePath("/compte/devis");
  return { ok: true };
}

export async function requestRevisionAction(input: z.input<typeof revisionSchema>): Promise<ActionResult> {
  const parsed = revisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Message requis" };
  }

  const loaded = await loadOwnedQuote(parsed.data.ref);
  if (!loaded.ok) return loaded;
  const { quote } = loaded;

  if (quote.status !== "sent") {
    return { ok: false, error: "Ce devis n'est plus en attente de décision." };
  }

  await prisma.$transaction(async (tx) => {
    // Retour au club pour ajustement : repasse en draft (l'enum SPEC §3 ne change pas).
    await tx.quote.update({ where: { id: quote.id }, data: { status: "draft" } });
    await tx.quoteEvent.create({
      data: {
        quoteId: quote.id,
        actor: "org",
        author: orgAuthor(quote),
        body: parsed.data.message,
        kind: "revision",
      },
    });
  });

  revalidatePath(`/devis/${quote.ref}`);
  revalidatePath(`/console/${quote.clubId}/devis`);
  return { ok: true };
}
