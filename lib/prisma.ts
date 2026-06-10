// Singleton Prisma Client — équivalent serveur de lib/supabase/server.ts.
// Pattern global pour éviter l'épuisement des connexions (HMR en dev,
// réutilisation des instances Lambda côté Vercel serverless).
//
// Prisma 7 : le client a besoin d'un *driver adapter*. On utilise @prisma/adapter-pg
// branché sur la connexion POOLÉE Supabase (pgBouncer, port 6543) via DATABASE_URL.
//
// Toutes les opérations métier passent par ce client. La sécurité repose sur
// l'autorisation applicative + RLS deny-by-default côté DB (cf. migration SQL).

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * Vrai quand une base est configurée (`DATABASE_URL` présent). En prod et en dev
 * local, elle l'est toujours. En revanche un `next build` lancé sans base (CI /
 * preview sans Postgres) ne peut pas pré-rendre les pages adossées à Prisma : les
 * getters serveur court-circuitent alors vers un repli vide via ce drapeau, ce qui
 * laisse le build aboutir. Le comportement runtime (DATABASE_URL défini) est inchangé.
 */
export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
