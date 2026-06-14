// Webhook Stripe — SOURCE DE VÉRITÉ des transitions de paiement (SPEC §8).
// Signature TOUJOURS vérifiée (stripe.webhooks.constructEvent) ; rejet si invalide.
// Node runtime obligatoire (corps brut + Prisma, incompatibles Edge).

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
// Le corps brut est requis pour vérifier la signature : pas de cache, pas de parsing.
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !secret) {
    return NextResponse.json({ error: "Stripe non configuré" }, { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    // Signature invalide → on rejette sans rien traiter (anti-spoof, SPEC §8).
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object);
        break;
      case "account.updated":
        await onAccountUpdated(event.data.object);
        break;
      // Les autres événements sont acquittés sans traitement (200).
      default:
        break;
    }
  } catch (err) {
    // Erreur de traitement → 500 : Stripe rejouera l'événement (idempotence ci-dessous).
    console.error("[stripe webhook] échec de traitement", event.type, err);
    return NextResponse.json({ error: "Traitement échoué" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

/** Acompte / solde réglé → transition d'état idempotente du Booking. */
async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;
  const bookingId = session.metadata?.bookingId;
  const kind = session.metadata?.kind;
  if (!bookingId || (kind !== "deposit" && kind !== "balance")) return;

  // Transition conditionnée sur l'état attendu → idempotent (un rejeu ne re-déclenche rien).
  const from = kind === "deposit" ? "quote_accepted" : "deposit_paid";
  const to = kind === "deposit" ? "deposit_paid" : "confirmed";

  await prisma.booking.updateMany({
    where: { id: bookingId, status: from },
    data: { status: to },
  });
}

/** Onboarding Connect terminé → le club peut encaisser : on lève bankDetailsVerified. */
async function onAccountUpdated(account: Stripe.Account) {
  const ready = Boolean(account.charges_enabled && account.payouts_enabled && account.details_submitted);

  await prisma.club.updateMany({
    where: { stripeAccountId: account.id },
    data: { bankDetailsVerified: ready },
  });
}
