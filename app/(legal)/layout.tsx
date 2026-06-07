import type { ReactNode } from "react";
import { TopNav, SiteFooter } from "@/components/ds/patterns";

// Coquille commune aux pages légales statiques (/cgu, /confidentialite,
// /mentions-legales) : TopNav publique + corps prose + SiteFooter.
// Aucune route légale ne correspond à un onglet → aucun onglet surligné
// (détection automatique via TopNavTabs).
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sy-legal">
      <TopNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
