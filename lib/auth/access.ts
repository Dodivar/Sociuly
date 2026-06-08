// RBAC — logique de décision d'accès aux routes (PURE, sans I/O ni next/*).
//
// Isolée ici pour être importable par le middleware (runtime Edge) sans tirer
// `next/navigation` ni `next/headers` dans son graphe. Les gardes serveur
// (qui redirigent) vivent dans `rbac.ts`.
//
// Matrice d'accès (SPEC §6) :
//   /admin/**         → sociuly_admin
//   /console/:id/**   → club_admin ET membre du club :id (via ClubMember)
//   /compte, /devis, /reserver → org_buyer

import { DEV_CLUB_ID } from "@/lib/console/dev";
import type { Role, SessionContext } from "./session";

/** Page d'atterrissage par défaut selon le rôle (post-login, redirections). */
export function homePathForRole(
  role: Role | null,
  clubIds: string[] = [],
): string {
  switch (role) {
    case "sociuly_admin":
      return "/admin";
    case "club_admin":
      // Multi-club (SPEC §11) : on entre sur le premier club rattaché.
      return `/console/${clubIds[0] ?? DEV_CLUB_ID}/dashboard`;
    case "org_buyer":
      return "/compte";
    default:
      // Authentifié mais sans rôle (compte orphelin) → retour à l'accueil public.
      return "/";
  }
}

export type AccessDecision =
  | { kind: "allow" }
  /** Non authentifié → rediriger vers /connexion en conservant la cible. */
  | { kind: "auth"; redirectTo: string }
  /** Authentifié mais rôle/appartenance insuffisant → renvoyer vers son espace. */
  | { kind: "forbidden"; redirectTo: string };

type RouteRule = {
  /** Préfixe de chemin protégé. */
  prefix: string;
  /** Rôles autorisés. */
  roles: Role[];
  /**
   * Vérification d'appartenance fine (ex : le club_admin doit être membre du
   * club ciblé). Reçoit le pathname et la session.
   */
  membership?: (pathname: string, session: SessionContext) => boolean;
};

/** Extrait `:clubId` de /console/:clubId/... */
function clubIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/console\/([^/]+)/);
  return m ? m[1] : null;
}

// L'ordre compte : la règle la plus spécifique (`/console/...`) est testée avant
// les préfixes courts (`/devis`). Comme `/console/x/devis` ne commence pas par
// `/devis`, il n'y a pas de collision, mais on garde un ordre lisible.
const ROUTE_RULES: RouteRule[] = [
  { prefix: "/admin", roles: ["sociuly_admin"] },
  {
    prefix: "/console",
    roles: ["club_admin"],
    membership: (pathname, session) => {
      const clubId = clubIdFromPath(pathname);
      // Pas de clubId dans l'URL (ex : /console seul) → on laisse passer le rôle.
      if (!clubId) return true;
      return session.clubIds.includes(clubId);
    },
  },
  { prefix: "/compte", roles: ["org_buyer"] },
  { prefix: "/devis", roles: ["org_buyer"] },
  { prefix: "/reserver", roles: ["org_buyer"] },
];

function matchRule(pathname: string): RouteRule | null {
  for (const rule of ROUTE_RULES) {
    if (pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)) {
      return rule;
    }
  }
  return null;
}

/**
 * Décide de l'accès à `pathname` pour la `session` donnée (PURE).
 * `session === null` → utilisateur non authentifié.
 */
export function checkRouteAccess(
  pathname: string,
  session: SessionContext | null,
): AccessDecision {
  const rule = matchRule(pathname);
  if (!rule) return { kind: "allow" }; // route publique

  if (!session) {
    const redirectTo = `/connexion?redirect=${encodeURIComponent(pathname)}`;
    return { kind: "auth", redirectTo };
  }

  const roleOk = session.role !== null && rule.roles.includes(session.role);
  const membershipOk = rule.membership ? rule.membership(pathname, session) : true;

  if (roleOk && membershipOk) return { kind: "allow" };

  return {
    kind: "forbidden",
    redirectTo: homePathForRole(session.role, session.clubIds),
  };
}
