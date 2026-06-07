import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// On exclut les assets statiques et les images pour éviter le refresh de
// session sur chaque chargement de PNG/SVG/favicon (gain perf, moins de bruit
// côté Supabase rate limit).
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
