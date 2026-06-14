"use server";

// Server Action — onboarding Stripe Connect d'un club (Express, SPEC §1/§4).
// Crée le compte connecté (si absent), persiste club.stripeAccountId, puis renvoie
// l'URL d'onboarding hébergée Stripe. La validation des coordonnées bancaires est
// confirmée plus tard par le webhook `account.updated` (→ bankDetailsVerified).
//
// Réservé au club_admin membre du club (requireClubAccess). C'est l'une des 4
// conditions KYC pour passer Club.status = active (CLAUDE.md §4).

import { requireClubAccess } from "@/lib/auth/rbac";
import { getSiteOrigin } from "@/lib/site";
import { getStripe, isStripeConfigured } from "@/lib/stripe/server";
import { prisma } from "@/lib/prisma";

export type ConnectLinkResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function createConnectAccountLink(clubId: string): Promise<ConnectLinkResult> {
  await requireClubAccess(clubId);

  if (!isStripeConfigured()) {
    return { ok: false, error: "Paiements non configurés (Stripe). Contactez le support Sociuly." };
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      id: true,
      stripeAccountId: true,
      members: {
        where: { role: "president" },
        select: { user: { select: { email: true } } },
        take: 1,
      },
    },
  });
  if (!club) return { ok: false, error: "Club introuvable." };

  const stripe = getStripe();

  try {
    let accountId = club.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "FR",
        email: club.members[0]?.user.email ?? undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      accountId = account.id;
      await prisma.club.update({ where: { id: clubId }, data: { stripeAccountId: accountId } });
    }

    const origin = await getSiteOrigin();
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${origin}/console/${clubId}/dashboard?stripe=refresh`,
      return_url: `${origin}/console/${clubId}/dashboard?stripe=done`,
    });
    return { ok: true, url: link.url };
  } catch {
    return { ok: false, error: "Impossible d'initialiser l'onboarding paiement pour le moment." };
  }
}
