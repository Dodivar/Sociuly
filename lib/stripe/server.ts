// Client Stripe — SERVEUR UNIQUEMENT (server-only). Singleton, guardé par
// STRIPE_SECRET_KEY. Jamais importé côté client : la clé secrète ne doit JAMAIS
// fuiter dans le bundle navigateur (CLAUDE.md §8).

import "server-only";

import Stripe from "stripe";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

/** Instance Stripe partagée. Lève si la clé n'est pas configurée (appeler après isStripeConfigured). */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant — paiements indisponibles.");
  if (!client) {
    // apiVersion omis → on suit la version par défaut du compte (évite un pin de type).
    client = new Stripe(key, { typescript: true });
  }
  return client;
}
