// RBAC — types + lecture des claims JWT (PURE, compatible Edge).
//
// Isolé de `session.ts` pour que le MIDDLEWARE (runtime Edge) puisse lire le rôle
// sans tirer dans son graphe `getSession()` → `resolve.server.ts` → Prisma (driver
// `pg`, Node-only, incompatible Edge). Aucune I/O, aucun `next/*`, aucun Prisma ici.
//
// CLAUDE.md §3 : `User.role ∈ org_buyer | club_admin | sociuly_admin`. Un même
// utilisateur peut être `club_admin` (via un ou plusieurs `ClubMember`) ET/OU
// `org_buyer` (rattaché à une `Organization`).

import type { User } from "@supabase/supabase-js";

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

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

/**
 * Construit le contexte de session à partir des claims `app_metadata` d'un
 * `User` Supabase. Fonction PURE (pas d'I/O), compatible Edge : utilisée par le
 * MIDDLEWARE (barrage rapide sans DB) et comme REPLI de `getSession()` quand la
 * base est injoignable.
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
