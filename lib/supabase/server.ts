// Helper Supabase pour Server Components, Server Actions et Route Handlers.
// Cookies-aware via `next/headers` — la session est partagée avec le middleware.
// Cf. https://supabase.com/docs/guides/auth/server-side/nextjs

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieSet = { name: string; value: string; options: CookieOptions };

export function isSupabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieSet[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // setAll est appelé depuis un Server Component (read-only cookies).
            // Le middleware se charge de rafraîchir la session — silence ici.
          }
        },
      },
    },
  );
}
