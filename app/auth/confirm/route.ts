// Confirmation d'un lien e-mail Supabase via `token_hash` (verifyOtp).
//
// Pourquoi cette route en plus de /auth/callback ?
//   • /auth/callback gère le flux PKCE (`?code=`) : il ne fonctionne QUE pour un
//     lien demandé depuis le formulaire /connexion, dans le même navigateur
//     (le `code_verifier` est dans un cookie).
//   • Les liens GÉNÉRÉS côté admin (script de test, invitations Supabase) n'ont
//     pas ce cookie : GoTrue retombe alors sur le flux implicite (#access_token
//     dans le fragment), illisible côté serveur → « Lien invalide ».
//
// verifyOtp(token_hash) résout les deux cas : il valide le jeton côté serveur,
// pose les cookies de session, et fonctionne dans n'importe quel navigateur —
// sans dépendre de l'allowlist « Redirect URLs » de Supabase.
// Cf. https://supabase.com/docs/guides/auth/server-side/nextjs (flux token hash).

import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
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
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedRedirect = sanitizeRedirect(searchParams.get("redirect"));

  // Lien malformé → retour connexion avec un message.
  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/connexion?error=missing_token`);
  }

  if (!isSupabaseConfigured()) {
    // Mode maquette (dev sans provider) → on entre dans la console démo.
    return NextResponse.redirect(`${origin}${requestedRedirect ?? DEV_CONSOLE_HOME}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error || !data.user) {
    // Lien expiré, déjà utilisé, ou jeton invalide.
    return NextResponse.redirect(`${origin}/connexion?error=expired`);
  }

  // Résolution du rôle depuis les claims du JWT (cf. lib/auth/session).
  const session = roleContextFromUser(data.user);
  const home = homePathForRole(session.role, session.clubIds);

  // Cible explicite demandée (lien profond protégé) si l'utilisateur y a droit.
  if (requestedRedirect) {
    const decision = checkRouteAccess(requestedRedirect, session);
    if (decision.kind === "allow") {
      return NextResponse.redirect(`${origin}${requestedRedirect}`);
    }
  }

  return NextResponse.redirect(`${origin}${home}`);
}
