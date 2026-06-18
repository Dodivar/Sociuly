// Génère un magic link de connexion pour un compte de test, sans envoyer
// d'e-mail — utile car les comptes seedés utilisent des adresses fictives
// (ex. president@sig-strasbourg.fr) dont personne ne possède la boîte mail.
//
// Le lien renvoyé pointe vers /auth/callback : on le colle dans le navigateur
// pour ouvrir une session comme cet utilisateur (cf. app/auth/callback/route.ts).
//
// Réservé au DÉVELOPPEMENT : nécessite la clé service_role (jamais exposée au
// client). Lancer : `npm run dev:magic-link [email] [base-url]`.
//
// Sans argument, cible le président de la SIG Strasbourg (club_pro seedé).
//
// Cible de redirection (par ordre de priorité) :
//   1. 2ᵉ argument CLI            → ex. `npm run dev:magic-link "" https://sociuly.vercel.app`
//   2. MAGIC_LINK_SITE_URL (env)
//   3. NEXT_PUBLIC_SITE_URL (env) → l'URL canonique de l'app
//   4. http://localhost:3000      → repli dev local
//
// ⚠️ L'URL ciblée DOIT figurer dans Supabase → Auth → URL Configuration →
// « Redirect URLs », sinon GoTrue ignore redirectTo et retombe sur le Site URL
// du dashboard (souvent localhost). Voir le README / la doc d'onboarding.

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const DEFAULT_EMAIL = "president@sig-strasbourg.fr";

async function main() {
  // 1er arg = email (vide ou "-" → défaut), 2e arg = base URL optionnelle.
  const emailArg = process.argv[2];
  const email = emailArg && emailArg !== "-" ? emailArg : DEFAULT_EMAIL;
  const baseUrlArg = process.argv[3];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local",
    );
  }

  // Destination de redirection après échange du code (origine de l'app déployée).
  const siteUrl =
    baseUrlArg ||
    process.env.MAGIC_LINK_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const redirectTo = new URL("/auth/callback", siteUrl).toString();

  const supabase = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo },
  });

  if (error || !data?.properties?.action_link) {
    throw new Error(
      `Impossible de générer le lien pour ${email}: ${error?.message ?? "compte introuvable (lancer d'abord `npm run db:seed`)"}`,
    );
  }

  console.log(`\n✅ Magic link pour ${email} (redirige vers ${siteUrl}) :\n`);
  console.log(data.properties.action_link);
  console.log(
    `\n→ Colle cette URL dans ton navigateur pour ouvrir la session.` +
      `\n  Si tu es renvoyé ailleurs (ex. localhost), ajoute ${siteUrl}/auth/callback` +
      `\n  dans Supabase → Auth → URL Configuration → Redirect URLs.\n`,
  );
}

main().catch((err) => {
  console.error("\n❌", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
