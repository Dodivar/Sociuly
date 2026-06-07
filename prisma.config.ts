// Configuration Prisma CLI (Prisma 7).
// Les secrets vivent dans `.env.local` (convention projet, cf. .claude/rules/01-tech-stack.md,
// non committé) — on les charge explicitement ici car Prisma 7 ne lit plus `.env` tout seul.
// Next.js charge `.env.local` de son côté pour le runtime applicatif.
import { config } from "dotenv";

config({ path: ".env.local" });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // La CLI (migrate dev/deploy) utilise la connexion DIRECTE Supabase (port 5432),
  // qui ne passe pas par le pooler pgBouncer.
  datasource: {
    url: process.env["DIRECT_URL"],
  },
  migrations: {
    path: "prisma/migrations",
    // Seed (CLAUDE.md §10) — exécuté via `npx prisma db seed`.
    seed: "tsx prisma/seed.ts",
  },
});
