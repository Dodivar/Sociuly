// Résolution de session + rôle — source unique de vérité pour le RBAC.
//
// CLAUDE.md §3 : `User.role ∈ org_buyer | club_admin | sociuly_admin`. Un même
// utilisateur peut être `club_admin` (via un ou plusieurs `ClubMember`) ET/OU
// `org_buyer` (rattaché à une `Organization`).
//
// Décision d'archi (cf. docs/adr/0001-rbac-role-resolution.md) :
//   • RBAC à deux niveaux, deux sources cohérentes :
//     – MIDDLEWARE (Edge, chaque requête) : `roleContextFromUser` lit le rôle +
//       les rattachements depuis les claims `app_metadata` du JWT Supabase.
//       Aucun aller-retour DB (Prisma incompatible Edge) → barrage rapide.
//     – SERVEUR (layouts/gardes/actions, runtime Node) : `getSession()` lit la
//       base (Prisma) — source de VÉRITÉ autoritaire, fraîche même si le JWT est
//       périmé (rattachement org récent, multi-club). Repli sur les claims JWT
//       si la base est injoignable (incident transitoire → on ne verrouille pas
//       un utilisateur légitime).
//   • Les claims sont alimentés par le trigger `on_auth_user_created` (rôle
//     initial) + l'Access Token Hook Supabase (rafraîchit club_ids/organization_id
//     à chaque émission de JWT) — cf. prisma/manual/0001_extensions_rls_auth.sql.

import { cache } from "react";
import { DEV_CLUB_ID } from "@/lib/console/dev";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  ROLES,
  isRole,
  roleContextFromUser,
  type Role,
  type SessionContext,
} from "./claims";

// Réexporte la surface pure (types + lecture des claims) pour conserver un point
// d'import unique « @/lib/auth/session » côté serveur. La logique vit dans
// `claims.ts` (compatible Edge) ; ce module y ajoute la résolution DB (Node-only).
export { ROLES, isRole, roleContextFromUser };
export type { Role, SessionContext };

/**
 * Indique si l'authentification est réellement appliquée.
 * En l'absence de Supabase configuré (maquette / dev / CI), on ne verrouille
 * rien afin de garder toutes les pages navigables — cohérent avec le reste du
 * code (cf. lib/supabase/middleware.ts, app/auth/callback/route.ts).
 */
export function isAuthEnforced(): boolean {
  return isSupabaseConfigured();
}

/**
 * Session de démonstration utilisée quand Supabase n'est pas configuré.
 * Le rôle est pilotable via `DEV_AUTH_ROLE` (.env.local) pour tester chaque
 * espace localement ; par défaut `club_admin` (accès à la console démo).
 */
export function devStubSession(): SessionContext {
  const envRole = process.env.DEV_AUTH_ROLE;
  const role: Role = isRole(envRole) ? envRole : "club_admin";
  return {
    userId: "dev-user",
    email: "dev@sociuly.fr",
    role,
    clubIds: [DEV_CLUB_ID],
    organizationId: "demo",
  };
}

/**
 * Récupère la session courante côté serveur (Server Components, Server Actions,
 * Route Handlers). Retourne `null` si l'utilisateur n'est pas authentifié.
 * En mode maquette (Supabase non configuré) retourne une session de démo.
 *
 * Le rôle + les rattachements sont résolus de façon AUTORITAIRE depuis la base
 * (Prisma) ; en cas d'indisponibilité (build sans DB, incident transitoire) on
 * retombe sur les claims JWT pour ne pas verrouiller un utilisateur légitime.
 *
 * Mémoïsé par requête (`react/cache`) : `getSession()` est appelé plusieurs fois
 * par rendu (garde de layout + getters scopés sur l'organisation) — une seule
 * lecture Supabase + DB par requête.
 */
export const getSession = cache(async function getSession(): Promise<SessionContext | null> {
  if (!isAuthEnforced()) {
    return devStubSession();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Résolution DB autoritaire. Import DYNAMIQUE : garde Prisma (Node-only) hors
  // du graphe statique de ce module, partagé avec le middleware Edge.
  try {
    const { resolveSessionFromDb } = await import("./resolve.server");
    const dbContext = await resolveSessionFromDb(user.id, user.email ?? null);
    if (dbContext) return dbContext;
  } catch (error) {
    // Base injoignable : repli sur les claims JWT (déjà signés, fiables). On
    // log sans interrompre l'accès — défense en profondeur côté RLS de toute façon.
    console.warn(
      "[auth] résolution DB du rôle indisponible, repli sur les claims JWT :",
      error instanceof Error ? error.message : error,
    );
  }

  return roleContextFromUser(user);
});
