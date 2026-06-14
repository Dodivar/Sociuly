import { headers } from "next/headers";

/**
 * Origine absolue du site (pour construire success_url / cancel_url Stripe,
 * redirections magic link, etc.). Priorité à NEXT_PUBLIC_SITE_URL (fixée par
 * environnement Vercel), repli sur l'`origin` de la requête, puis localhost.
 */
export async function getSiteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  return h.get("origin") ?? "http://localhost:3000";
}
