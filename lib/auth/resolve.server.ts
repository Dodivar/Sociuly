// Résolution AUTORITAIRE du contexte de session depuis la base (Prisma).
// Module SERVEUR uniquement (`server-only`) : ne doit JAMAIS entrer dans le
// graphe du middleware Edge — Prisma n'est pas compatible Edge
// (cf. .claude/rules/01-tech-stack.md). `getSession()` (lib/auth/session.ts)
// l'importe donc DYNAMIQUEMENT, hors du graphe statique partagé avec le middleware.
//
// Source de vérité du RBAC (SPEC §4) : le rôle et les rattachements réels —
//   • `User.role` + `User.organizationId` (org_buyer) ;
//   • `ClubMember[].clubId` (club_admin, multi-club SPEC §11).
// Les claims JWT `app_metadata` (lus par le middleware) restent un cache rapide
// pour l'Edge, mais peuvent être périmés (rattachement récent, multi-club) : la
// décision serveur (layouts/gardes) s'appuie sur cette lecture DB fraîche.

import "server-only";

import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { ROLES, type Role, type SessionContext } from "./claims";

function asRole(value: string | null | undefined): Role | null {
  return value != null && (ROLES as readonly string[]).includes(value)
    ? (value as Role)
    : null;
}

/**
 * Lit le contexte de session pour `userId` depuis la base.
 *
 * Retourne `null` si aucune base n'est configurée (build / CI sans Postgres) →
 * l'appelant retombe alors sur les claims JWT. Toute erreur d'I/O remonte
 * (l'appelant `getSession()` la capture pour ne pas verrouiller un utilisateur
 * légitime sur un incident DB transitoire).
 *
 * Si la ligne `User` n'existe pas encore (latence du trigger
 * `on_auth_user_created`), le rôle est `null` — accès aux espaces protégés
 * refusé tant que le rattachement n'est pas matérialisé.
 */
export async function resolveSessionFromDb(
  userId: string,
  email: string | null,
): Promise<SessionContext | null> {
  if (!isDatabaseConfigured) return null;

  const [row, memberships] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, organizationId: true },
    }),
    prisma.clubMember.findMany({
      where: { userId },
      select: { clubId: true },
    }),
  ]);

  return {
    userId,
    email,
    role: asRole(row?.role),
    clubIds: memberships.map((m) => m.clubId),
    organizationId: row?.organizationId ?? null,
  };
}
