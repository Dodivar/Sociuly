// Résolution du clubId de la route /console/[clubId]/… vers un Club réel.
// En dev, les liens pointent vers DEV_CLUB_ID = "demo" (cf. lib/console/dev.ts) :
// on retombe alors sur le premier club actif (SIG). En prod, le param sera l'UUID
// du club (ou son slug). TODO(auth): vérifier l'appartenance ClubMember du
// club_admin connecté au niveau de la route.

import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Résout le param de route vers l'enregistrement Club (ou null). */
export async function resolveClub(param: string) {
  // Build sans base (CI/preview) : aucun club → les getters console renvoient un repli vide.
  if (!isDatabaseConfigured) return null;
  if (UUID_RE.test(param)) return prisma.club.findUnique({ where: { id: param } });
  if (param === "demo") {
    return prisma.club.findFirst({
      where: { status: "active" },
      orderBy: { createdAt: "asc" },
    });
  }
  return prisma.club.findUnique({ where: { slug: param } });
}

/** Résout le param de route vers un id de Club (ou null). */
export async function resolveClubId(param: string): Promise<string | null> {
  const club = await resolveClub(param);
  return club?.id ?? null;
}
