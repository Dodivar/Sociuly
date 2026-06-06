"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cx } from "@/lib/cx";

export type TopNavItem = { id: string; label: string; href: string };

/**
 * Déduit l'onglet actif à partir de l'URL courante (chemin + query `vue`).
 * Renvoie `null` sur les pages hors navigation principale (accueil, légal,
 * connexion…) → aucun onglet n'est surligné.
 */
function resolveActiveId(pathname: string, vue: string | null): string | null {
  if (pathname === "/clubs" || pathname.startsWith("/clubs/")) return "clubs";
  if (pathname === "/projets" || pathname.startsWith("/projets/")) return "projets";
  if (pathname === "/experiences" || pathname.startsWith("/experiences/")) {
    // La vue carte partage la route /experiences (cf. lien « Carte »).
    return vue === "carte" ? "carte" : "experiences";
  }
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
  const searchParams = useSearchParams();
  const current = active ?? resolveActiveId(pathname, searchParams.get("vue"));

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
