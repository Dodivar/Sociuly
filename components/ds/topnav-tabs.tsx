"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";

export type TopNavItem = { id: string; label: string; href: string };

/**
 * Déduit l'onglet actif à partir du chemin courant. Renvoie `null` sur les pages
 * hors navigation principale (accueil, légal, connexion…) → aucun onglet surligné.
 * La vue carte (`/experiences?vue=carte`) reste une sous-vue de la catalogue,
 * donc l'onglet « Expériences » y est mis en évidence.
 */
function resolveActiveId(pathname: string): string | null {
  if (pathname === "/clubs" || pathname.startsWith("/clubs/")) return "clubs";
  if (pathname === "/projets" || pathname.startsWith("/projets/")) return "projets";
  if (pathname === "/experiences" || pathname.startsWith("/experiences/")) return "experiences";
  return null;
}

export function TopNavTabs({
  items,
  active,
}: {
  items: ReadonlyArray<TopNavItem>;
  /** Override manuel optionnel ; sinon l'onglet actif est déduit de l'URL. */
  active?: string;
}) {
  const pathname = usePathname();
  const current = active ?? resolveActiveId(pathname);

  return (
    <div className="sy-topnav-tabs sy-tab-underline sy-tabs" style={{ padding: 0 }}>
      {items.map((it) => {
        const on = current === it.id;
        return (
          <Link
            key={it.id}
            href={it.href}
            aria-current={on ? "page" : undefined}
            className={cx("sy-tab", on && "on")}
            style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
          >
            {it.label}
          </Link>
        );
      })}
    </div>
  );
}
