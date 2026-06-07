"use server";

import { headers } from "next/headers";
import { parseMagicLink, type FieldErrors, type MagicLinkField } from "@/lib/auth/validation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type LoginActionState = {
  ok: boolean;
  /** Erreur générale (provider injoignable, rate-limit, etc.). */
  formError?: string;
  fieldErrors?: FieldErrors<MagicLinkField>;
  /** Repeuple le champ après échec (jamais l'email côté succès — UX vide). */
  values?: { email: string };
  /** Email où le lien a été envoyé — affiché dans l'écran « lien envoyé ». */
  sentTo?: string;
};

const SAFE_REDIRECT_RE = /^\/[a-zA-Z0-9/_\-?=&.]*$/;

/** Anti open-redirect : on n'accepte que des chemins relatifs internes. */
function sanitizeRedirect(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  return SAFE_REDIRECT_RE.test(raw) ? raw : undefined;
}

function siteOrigin(): string {
  // Priorité : NEXT_PUBLIC_SITE_URL (configurable par environnement Vercel)
  //  → fallback sur l'`origin` de la requête (utile en preview Vercel où
  //    l'URL est connue à la volée, et en local).
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // headers() retourne un Promise dans Next 15 — l'appelant `requestMagicLinkAction`
  // l'attendra avant d'appeler siteOrigin().
  return "http://localhost:3000";
}

export async function requestMagicLinkAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const { values, errors } = parseMagicLink(formData);
  const email = values.email;

  if (errors.email) {
    return { ok: false, fieldErrors: errors, values: { email } };
  }

  const redirect = sanitizeRedirect(values.redirect);

  // Dev sans Supabase configuré : on ne casse pas la maquette — on simule un
  // envoi (l'écran « lien envoyé » s'affiche). Inutilisable en prod.
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, sentTo: email };
    }
    return {
      ok: false,
      formError:
        "Provider d'authentification non configuré. Contactez le support Sociuly.",
      values: { email },
    };
  }

  // Construit l'URL de callback : Supabase y envoie le `code` après clic sur le lien.
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || h.get("origin") || siteOrigin();
  const callbackUrl = new URL("/auth/callback", origin);
  if (redirect) callbackUrl.searchParams.set("redirect", redirect);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // En v1, on n'auto-crée pas de compte : un utilisateur doit d'abord
      // passer par /inscription-club ou /inscription-entreprise. Cela évite
      // les comptes orphelins (pas de role, pas d'organization).
      // ⚠️ Si Supabase est configuré avec "Disable signups" côté dashboard,
      // ce flag est redondant mais inoffensif.
      shouldCreateUser: false,
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    // Bonne pratique sécurité : ne PAS révéler si l'e-mail existe (énumération
    // de comptes). On retourne donc « ok: true » même si l'utilisateur n'existe
    // pas, sauf erreur réseau / rate limit qui mérite un message clair.
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("rate") || msg.includes("too many")) {
      return {
        ok: false,
        formError:
          "Trop de demandes pour cette adresse. Patientez quelques minutes avant de réessayer.",
        values: { email },
      };
    }
    if (msg.includes("signups not allowed") || msg.includes("user not found")) {
      // Compte inexistant → on simule un succès (sécurité), l'utilisateur
      // ne recevra simplement pas d'email. La page de succès propose un
      // lien « pas encore inscrit ? » pour rattraper le cas.
      return { ok: true, sentTo: email };
    }
    return {
      ok: false,
      formError: "Impossible d'envoyer le lien pour l'instant. Réessayez dans un instant.",
      values: { email },
    };
  }

  return { ok: true, sentTo: email };
}
