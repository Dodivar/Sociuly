// Helper Supabase pour le middleware Next.js.
// Rafraîchit la session sur chaque requête (sinon le cookie d'auth expire
// silencieusement et l'utilisateur est déconnecté sans le savoir) PUIS applique
// le gating RBAC (SPEC §6) à partir des claims du JWT — aucun aller-retour DB.
//
// IMPORTANT : ne rien insérer entre `createServerClient` et `getUser` —
// l'instruction officielle Supabase est de garder ces appels collés pour
// éviter les races sur le refresh token.

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRouteAccess } from "@/lib/auth/access";
// Edge : on importe la lecture PURE des claims depuis `claims.ts` (jamais
// `session.ts`, qui tire Prisma via la résolution DB — incompatible Edge).
import { roleContextFromUser } from "@/lib/auth/claims";
import { isSupabaseConfigured } from "./server";

type CookieSet = { name: string; value: string; options: CookieOptions };

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  // Dev sans Supabase configuré : on passe la requête sans toucher au session cookie.
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieSet[]) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ─── Gating RBAC ──────────────────────────────────────────────────────
  const session = user ? roleContextFromUser(user) : null;
  const decision = checkRouteAccess(request.nextUrl.pathname, session);

  if (decision.kind !== "allow") {
    const redirectUrl = new URL(decision.redirectTo, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    // Reporter les cookies de refresh posés ci-dessus pour ne pas perdre la
    // session fraîchement rafraîchie lors de la redirection.
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  return supabaseResponse;
}
