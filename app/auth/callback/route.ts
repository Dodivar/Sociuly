// Callback du magic link Supabase.
// Quand l'utilisateur clique le lien dans son e-mail, il atterrit ici avec
// un `?code=…`. On l'échange contre une session (cookie) puis on redirige
// vers la destination adaptée à son rôle.
//
// TODO(prisma) : la résolution du rôle (`User.role` + `ClubMember.clubId` +
// `Organization.id`) se fera dès que le schéma Prisma sera en place (CLAUDE.md §3).
// En attendant on retombe sur DEV_CONSOLE_HOME pour permettre la navigation
// post-login en dev — comportement explicite, à retirer en prod.

import { NextResponse, type NextRequest } from "next/server";
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
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Lien expiré, déjà utilisé, ou code invalide.
    return NextResponse.redirect(`${origin}/connexion?error=expired`);
  }

  // Si l'appelant a demandé une cible explicite (lien profond protégé),
  // on l'honore après vérification de session.
  if (requestedRedirect) {
    return NextResponse.redirect(`${origin}${requestedRedirect}`);
  }

  // ─── Résolution du rôle ─────────────────────────────────────────────
  // TODO(prisma) : remplacer par une lecture de User/ClubMember/Organization.
  //   const dbUser = await prisma.user.findUnique({
  //     where: { id: user.id },
  //     include: { clubMemberships: { orderBy: [{ role: "asc" }, { joinedAt: "asc" }] } },
  //   });
  //   switch (dbUser.role) {
  //     case "sociuly_admin": return redirect("/admin");
  //     case "club_admin":    return redirect(`/console/${dbUser.clubMemberships[0].clubId}/dashboard`);
  //     case "org_buyer":     return redirect("/compte");
  //     default:              return redirect("/inscription"); // chooser
  //   }
  // Le décompte de clubs (§11 SPEC — multi-club) est résolu en prenant
  // le premier ClubMember par ordre (`role`, `joinedAt`) — décision validée.
  return NextResponse.redirect(`${origin}${DEV_CONSOLE_HOME}`);
}
