import type { ReactNode } from "react";
import { TopNav, SiteFooter } from "@/components/ds/patterns";

// Coquille commune aux pages légales statiques (/cgu, /confidentialite,
// /mentions-legales) : TopNav publique + corps prose + SiteFooter.
// `active="legal"` ne correspond à aucun onglet → aucun onglet surligné.
export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="sy-legal">
      <TopNav active="legal" />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
