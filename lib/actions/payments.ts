"use server";

// Server Actions de paiement — Stripe Connect (destination charges, SPEC §4/§5).
//   org : startDepositCheckout  acompte 30 % (quote_accepted → deposit_paid via webhook)
//   org : startBalanceCheckout  solde       (deposit_paid → confirmed via webhook)
//
// Modèle de répartition de la commission (CLAUDE.md §4) : la commission Sociuly
// (6 % du TTC, feeAmountCents figé sur le Booking) est prélevée EN UNE FOIS sur la
// charge d'acompte (application_fee_amount), le solde n'en porte aucune. Total club
// = (acompte − commission) + solde = TTC − commission = net. Total Sociuly = commission.
//
// La transition d'état réelle (deposit_paid / confirmed) est faite par le WEBHOOK
// signé (checkout.session.completed), jamais ici — on ne fait confiance qu'à Stripe.

import { requireRole } from "@/lib/auth/rbac";
import { isAuthEnforced } from "@/lib/auth/session";
import { currentOrgId } from "@/lib/account/org";
import { getSiteOrigin } from "@/lib/site";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

type PaymentKind = "deposit" | "balance";

async function startCheckout(bookingRef: string, kind: PaymentKind): Promise<CheckoutResult> {
  await requireRole(["org_buyer"]);

  // Mode maquette (sans base) : on route directement vers la confirmation pour garder
  // le parcours navigable, sans charge réelle.
  if (!isDatabaseConfigured) {
    return { ok: true, url: `/reserver/${encodeURIComponent(bookingRef)}/confirmation` };
  }

  const booking = await prisma.booking.findUnique({
    where: { bookingNumber: bookingRef },
    include: { club: { select: { name: true, stripeAccountId: true } } },
  });
  if (!booking) return { ok: false, error: "Réservation introuvable." };

  if (isAuthEnforced()) {
    const orgId = await currentOrgId();
    if (orgId && booking.organizationId !== orgId) {
      return { ok: false, error: "Accès refusé." };
    }
  }

  // Garde de machine à états : l'acompte n'est dû qu'après acceptation du devis,
  // le solde qu'après l'acompte.
  const expectedStatus = kind === "deposit" ? "quote_accepted" : "deposit_paid";
  if (booking.status !== expectedStatus) {
    return {
      ok: false,
      error:
        kind === "deposit"
          ? "L'acompte n'est pas dû pour cette réservation."
          : "Le solde n'est pas encore dû (acompte non réglé).",
    };
  }

  const amountCents =
    kind === "deposit" ? booking.depositCents : booking.grossAmountTTCCents - booking.depositCents;
  // Commission entière sur l'acompte ; aucune sur le solde (cf. en-tête).
  const feeCents = kind === "deposit" ? booking.feeAmountCents : 0;

  if (amountCents <= 0) return { ok: false, error: "Montant à régler invalide." };

  // Sans Stripe configuré (dev) : on simule un paiement réussi → confirmation.
  if (!isStripeConfigured()) {
    return { ok: true, url: `/reserver/${encodeURIComponent(bookingRef)}/confirmation?simulated=1` };
  }
  if (!booking.club.stripeAccountId) {
    return { ok: false, error: "Ce club n'a pas encore finalisé sa configuration de paiement." };
  }

  const origin = await getSiteOrigin();
  const label =
    kind === "deposit"
      ? `Acompte (30 %) — ${booking.bookingNumber}`
      : `Solde — ${booking.bookingNumber}`;

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      currency: "eur",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: { name: label },
          },
        },
      ],
      payment_intent_data: {
        application_fee_amount: feeCents,
        transfer_data: { destination: booking.club.stripeAccountId },
        metadata: { bookingId: booking.id, kind },
      },
      metadata: { bookingId: booking.id, kind },
      success_url: `${origin}/reserver/${encodeURIComponent(booking.bookingNumber)}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/reserver/${encodeURIComponent(booking.bookingNumber)}`,
    });

    if (!session.url) return { ok: false, error: "Impossible d'initialiser le paiement." };
    return { ok: true, url: session.url };
  } catch {
    return { ok: false, error: "Le service de paiement est momentanément indisponible." };
  }
}

export async function startDepositCheckout(bookingRef: string): Promise<CheckoutResult> {
  return startCheckout(bookingRef, "deposit");
}

export async function startBalanceCheckout(bookingRef: string): Promise<CheckoutResult> {
  return startCheckout(bookingRef, "balance");
}
