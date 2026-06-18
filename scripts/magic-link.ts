// Génère un lien de connexion pour un compte de test, sans envoyer d'e-mail —
// utile car les comptes seedés utilisent des adresses fictives
// (ex. president@sig-strasbourg.fr) dont personne ne possède la boîte mail.
//
// Le lien produit pointe vers /auth/confirm?token_hash=… (flux « token hash »),
// pas vers l'action_link brut de GoTrue. Avantages :
//   • fonctionne dans N'IMPORTE QUEL navigateur (pas de cookie PKCE requis) ;
//   • côté serveur via verifyOtp → pas de jetons dans le fragment d'URL ;
//   • ne dépend PAS de l'allowlist « Redirect URLs » de Supabase.
// Cf. app/auth/confirm/route.ts.
//
// Réservé au DÉVELOPPEMENT : nécessite la clé service_role (jamais exposée au
// client). Lancer : `npm run dev:magic-link [email] [base-url]`.
//
// Sans argument, cible le président de la SIG Strasbourg (club_pro seedé).
//
// Base URL de l'app ciblée (par ordre de priorité) :
//   1. 2ᵉ argument CLI            → ex. `npm run dev:magic-link "" https://sociuly.vercel.app`
//   2. MAGIC_LINK_SITE_URL (env)
//   3. NEXT_PUBLIC_SITE_URL (env) → l'URL canonique de l'app
//   4. http://localhost:3000      → repli dev local

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

  // Base URL de l'app vers laquelle on construit le lien /auth/confirm.
  const siteUrl =
    baseUrlArg ||
    process.env.MAGIC_LINK_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const supabase = createClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // generateLink valide le jeton et nous renvoie un `hashed_token` réutilisable
  // via verifyOtp côté serveur. On n'utilise PAS `action_link` (flux implicite).
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  const props = data?.properties;
  if (error || !props?.hashed_token) {
    throw new Error(
      `Impossible de générer le lien pour ${email}: ${error?.message ?? "compte introuvable (lancer d'abord `npm run db:seed`)"}`,
    );
  }

  const confirmUrl = new URL("/auth/confirm", siteUrl);
  confirmUrl.searchParams.set("token_hash", props.hashed_token);
  confirmUrl.searchParams.set("type", props.verification_type ?? "magiclink");

  console.log(`\n✅ Lien de connexion pour ${email} (app : ${siteUrl}) :\n`);
  console.log(confirmUrl.toString());
  console.log(
    `\n→ Colle cette URL dans ton navigateur pour ouvrir la session.` +
      `\n  Valable une seule fois, expire après ~1 h.\n`,
  );
}

main().catch((err) => {
  console.error("\n❌", err instanceof Error ? err.message : err, "\n");
  process.exit(1);
});
