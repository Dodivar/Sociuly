import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-side operations (Route Handlers, Server Actions).
 * Bypasses RLS intentionally — the caller is responsible for authorization checks.
 * Never import this file from client components.
 */
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
