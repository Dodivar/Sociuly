// Client Supabase service-role — SERVEUR UNIQUEMENT (server-only).
//
// Distinct de `lib/supabase/server.ts` (client cookie/anon, lié à la session de
// l'utilisateur) : ce client utilise la clé `service_role` SECRÈTE et n'a aucun
// contexte de session. Il est réservé aux traitements serveur sans utilisateur
// (webhook Stripe, génération de facture) qui doivent écrire dans le Storage.
//
// ⚠️ Ne JAMAIS importer ce module depuis un Client Component ni exposer la clé
// au client (§8). La clé n'est lue que via `process.env`.

import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Bucket privé qui héberge les PDF de factures (téléchargement via URL signée). */
export const INVOICES_BUCKET = "invoices";

/** True si l'URL Supabase et la clé service_role sont configurées. */
export function isServiceConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/** Client Supabase service-role (sans persistance de session). */
export function createServiceClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/** Téléverse (ou écrase) un PDF de facture dans le bucket privé. */
export async function uploadInvoicePdf(path: string, bytes: Uint8Array): Promise<void> {
  const client = createServiceClient();
  const { error } = await client.storage
    .from(INVOICES_BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: true });
  if (error) throw new Error(`Upload facture échoué : ${error.message}`);
}

/** Télécharge le contenu d'un PDF de facture (Buffer) depuis le bucket privé. */
export async function downloadInvoicePdf(path: string): Promise<Uint8Array> {
  const client = createServiceClient();
  const { data, error } = await client.storage.from(INVOICES_BUCKET).download(path);
  if (error || !data) throw new Error(`Téléchargement facture échoué : ${error?.message}`);
  return new Uint8Array(await data.arrayBuffer());
}
