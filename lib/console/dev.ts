// Club fictif pour naviguer la console en développement, tant que l'auth
// Supabase + le résolveur de clubId réel ne sont pas branchés.
// TODO(api): retirer une fois `connexion/actions.ts` câblé sur le ClubMember réel.

export const DEV_CLUB_ID = "demo";
export const DEV_CONSOLE_HOME = `/console/${DEV_CLUB_ID}/dashboard`;

// Cible des liens « Console club » du site public :
// - en dev → accès direct à la console du club fictif (navigation rapide des écrans) ;
// - en prod → page de connexion (un visiteur public n'est pas authentifié).
export const CONSOLE_PUBLIC_LINK =
  process.env.NODE_ENV === "production" ? "/connexion" : DEV_CONSOLE_HOME;
