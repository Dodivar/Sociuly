// RBAC — gardes serveur (layouts / pages), défense en profondeur.
//
// La logique de décision PURE (matrice de routes) vit dans `access.ts` et est
// partagée avec le middleware. Ici on l'enveloppe dans des gardes qui redirigent
// via `next/navigation` — à appeler dans les layouts/pages protégés au cas où le
// middleware serait contourné (matcher mal configuré, route hors matcher…).

import { redirect } from "next/navigation";
import { homePathForRole } from "./access";
import {
  getSession,
  isAuthEnforced,
  type Role,
  type SessionContext,
} from "./session";

// Ré-exporte la surface pure pour les consommateurs qui n'ont besoin que d'elle.
export { checkRouteAccess, homePathForRole, type AccessDecision } from "./access";

/**
 * Exige une session authentifiée. Redirige vers /connexion sinon.
 * No-op en mode maquette (retourne la session de démo).
 */
export async function requireSession(redirectTarget?: string): Promise<SessionContext> {
  const session = await getSession();
  if (!session) {
    const target = redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : "";
    redirect(`/connexion${target}`);
  }
  return session;
}

/**
 * Exige un des `roles`. Redirige vers l'espace de l'utilisateur sinon.
 * En mode maquette (auth non appliquée), ne bloque pas — on garde la
 * navigation des écrans ouverte.
 */
export async function requireRole(
  roles: Role[],
  redirectTarget?: string,
): Promise<SessionContext> {
  const session = await requireSession(redirectTarget);
  if (!isAuthEnforced()) return session;

  if (session.role === null || !roles.includes(session.role)) {
    redirect(homePathForRole(session.role, session.clubIds));
  }
  return session;
}

/**
 * Exige le rôle `club_admin` ET l'appartenance au club `clubId`.
 * Garde des routes /console/:clubId/**.
 */
export async function requireClubAccess(clubId: string): Promise<SessionContext> {
  const session = await requireRole(["club_admin"], `/console/${clubId}/dashboard`);
  if (!isAuthEnforced()) return session;

  if (!session.clubIds.includes(clubId)) {
    redirect(homePathForRole(session.role, session.clubIds));
  }
  return session;
}
