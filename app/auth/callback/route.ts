// Callback du magic link Supabase.
// Quand l'utilisateur clique le lien dans son e-mail, il atterrit ici avec
// un `?code=…`. On l'échange contre une session (cookie) puis on redirige
// vers la destination adaptée à son rôle (cf. lib/auth/session + rbac).

import { NextResponse, type NextRequest } from "next/server";
import { checkRouteAccess, homePathForRole } from "@/lib/auth/access";
import { roleContextFromUser } from "@/lib/auth/session";
import { DEV_CONSOLE_HOME } from "@/lib/console/dev";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const SAFE_REDIRECT_RE = /^\/[a-zA-Z0-9/_\-?=&.]*$/;

function sanitizeRedirect(raw: string | null): string | null {
  if (!raw) return null;
  return SAFE_REDIRECT_RE.test(raw) ? raw : null;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedRedirect = sanitizeRedirect(searchParams.get("redirect"));

  // Lien malformé / déjà consommé → retour connexion avec un message.
  if (!code) {
    return NextResponse.redirect(`${origin}/connexion?error=missing_code`);
  }

  if (!isSupabaseConfigured()) {
    // En dev sans provider configuré, on suit la redirection demandée
    // ou on entre dans la console démo (cf. lib/console/dev.ts).
    return NextResponse.redirect(`${origin}${requestedRedirect ?? DEV_CONSOLE_HOME}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    // Lien expiré, déjà utilisé, ou code invalide.
    return NextResponse.redirect(`${origin}/connexion?error=expired`);
  }

  // ─── Résolution du rôle ─────────────────────────────────────────────
  // Le rôle + les rattachements sont lus depuis les claims `app_metadata`
  // du JWT (cf. lib/auth/session). Multi-club (SPEC §11) : on entre sur le
  // premier club rattaché.
  // TODO(prisma) : ces claims seront alimentés par le trigger
  // `on_auth_user_created` + un Access Token Hook une fois les tables
  // User/ClubMember/Organization en place (cf. docs/adr/0001-rbac-role-resolution.md).
  const session = roleContextFromUser(data.user);
  const home = homePathForRole(session.role, session.clubIds);

  // Si l'appelant a demandé une cible explicite (lien profond protégé) et que
  // l'utilisateur y a droit, on l'honore ; sinon on retombe sur son espace.
  if (requestedRedirect) {
    const decision = checkRouteAccess(requestedRedirect, session);
    if (decision.kind === "allow") {
      return NextResponse.redirect(`${origin}${requestedRedirect}`);
    }
  }

  return NextResponse.redirect(`${origin}${home}`);
}
