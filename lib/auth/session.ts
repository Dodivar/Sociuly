// Résolution de session + rôle — source unique de vérité pour le RBAC.
//
// CLAUDE.md §3 : `User.role ∈ org_buyer | club_admin | sociuly_admin`. Un même
// utilisateur peut être `club_admin` (via un ou plusieurs `ClubMember`) ET/OU
// `org_buyer` (rattaché à une `Organization`).
//
// Décision d'archi (cf. docs/adr/0001-rbac-role-resolution.md) :
//   • Le rôle + les rattachements (clubIds, organizationId) sont lus depuis les
//     claims `app_metadata` du JWT Supabase. Aucun aller-retour DB dans le
//     middleware (qui tourne sur chaque requête) → seam compatible RLS.
//   • Tant que le schéma Prisma / le trigger `on_auth_user_created` ne sont pas
//     en place (décision « dev stub + clean seam »), `roleContextFromUser` lit
//     ces claims s'ils existent ; sinon le rôle est `null` (utilisateur sans
//     rattachement → pas d'accès aux espaces protégés).
//
// TODO(prisma) : une fois les tables User/ClubMember/Organization créées, les
// claims seront alimentés par le trigger Postgres + un Access Token Hook
// Supabase. Le reste du code (middleware, gardes de layout) reste inchangé.

import type { User } from "@supabase/supabase-js";
import { DEV_CLUB_ID } from "@/lib/console/dev";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const ROLES = ["org_buyer", "club_admin", "sociuly_admin"] as const;
export type Role = (typeof ROLES)[number];

export type SessionContext = {
  userId: string;
  email: string | null;
  /** `null` = authentifié mais sans rôle résolu (compte orphelin / non rattaché). */
  role: Role | null;
  /** Clubs dont l'utilisateur est membre (via ClubMember). Vide si non club_admin. */
  clubIds: string[];
  /** Organisation acheteuse rattachée. `null` si non org_buyer. */
  organizationId: string | null;
};

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/**
 * Construit le contexte de session à partir d'un `User` Supabase.
 * Fonction PURE (pas d'I/O) : réutilisée par `getSession()` (côté Server
 * Component / Action) et par le middleware, qui dispose déjà du `user`.
 */
export function roleContextFromUser(user: User): SessionContext {
  const meta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const role = isRole(meta.role) ? meta.role : null;

  return {
    userId: user.id,
    email: user.email ?? null,
    role,
    clubIds: toStringArray(meta.club_ids),
    organizationId:
      typeof meta.organization_id === "string" ? meta.organization_id : null,
  };
}

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
 */
export async function getSession(): Promise<SessionContext | null> {
  if (!isAuthEnforced()) {
    return devStubSession();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  return roleContextFromUser(user);
}
