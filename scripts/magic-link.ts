// Génère un magic link de connexion pour un compte de test, sans envoyer
// d'e-mail — utile car les comptes seedés utilisent des adresses fictives
// (ex. president@sig-strasbourg.fr) dont personne ne possède la boîte mail.
//
// Le lien renvoyé pointe vers /auth/callback : on le colle dans le navigateur
// pour ouvrir une session comme cet utilisateur (cf. app/auth/callback/route.ts).
//
// Réservé au DÉVELOPPEMENT : nécessite la clé service_role (jamais exposée au
// client). Lancer : `npm run dev:magic-link [email]`.
//
// Sans argument, cible le président de la SIG Strasbourg (club_pro seedé).

import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const DEFAULT_EMAIL = "president@sig-strasbourg.fr";

async function main() {
  const email = process.argv[2] ?? DEFAULT_EMAIL;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être définis dans .env.local",
    );
  }

  // Destination de redirection après échange du code (même origine que l'app).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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

  console.log(`\n✅ Magic link pour ${email} :\n`);
  console.log(data.properties.action_link);
  console.log("\n→ Colle cette URL dans ton navigateur pour ouvrir la session.\n");
}

main().catch((err) => {
  console.error("\n❌", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
