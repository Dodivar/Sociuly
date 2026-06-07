"use client";

// Sous-navigation de l'espace entreprise /compte (SPEC §6).
// Onglet actif déduit du chemin courant.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ds/icon";

type Item = { label: string; href: string; icon: IconName; exact?: boolean; badge?: number };

const ITEMS: Item[] = [
  { label: "Vue d'ensemble", href: "/compte", icon: "home", exact: true },
  { label: "Devis", href: "/compte/devis", icon: "chat" },
  { label: "Réservations", href: "/compte/reservations", icon: "calendar" },
  { label: "Factures", href: "/compte/factures", icon: "download" },
  { label: "Équipe", href: "/compte/equipe", icon: "users" },
];

export function AccountNav({ badges = {} }: { badges?: Partial<Record<string, number>> }) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="ac-nav" aria-label="Navigation de l'espace entreprise">
      <div className="ac-nav-inner">
        {ITEMS.map((it) => {
          const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
          const badge = badges[it.href];
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`ac-tab ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon name={it.icon} size={15} color={active ? "var(--ink)" : "var(--ink-3)"} />
              <span>{it.label}</span>
              {badge ? <span className="sy-badge">{badge}</span> : null}
            </Link>
          );
        })}
      </div>

      <style>{`
        .ac-nav { border-bottom: 1px solid var(--line); background: var(--surface); }
        .ac-nav-inner {
          max-width: 1100px; margin: 0 auto; padding: 0 var(--page-pad);
          display: flex; gap: 4px; overflow-x: auto;
        }
        .ac-nav-inner::-webkit-scrollbar { height: 0; }
        .ac-tab {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 14px; white-space: nowrap;
          color: var(--ink-3); font-size: 14px; font-weight: 500;
          border-bottom: 2px solid transparent; text-decoration: none;
          transition: color .15s ease, border-color .15s ease;
        }
        .ac-tab:hover { color: var(--ink); }
        .ac-tab.is-active { color: var(--ink); border-bottom-color: var(--primary); font-weight: 600; }
        .ac-tab:focus-visible { outline: 3px solid var(--ring); outline-offset: -3px; }
      `}</style>
    </nav>
  );
}
