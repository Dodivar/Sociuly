"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, Progress } from "@/components/ds/components";
import { Icon, type IconName } from "@/components/ds/icon";
import type { Club, NavBadges } from "@/lib/console/dashboard";

type NavId = "home" | "experiences" | "devis" | "resa" | "projets" | "rev" | "avis" | "team";

type NavItem = {
  id: NavId;
  label: string;
  icon: IconName;
  segment: string;
  badgeKey?: keyof NavBadges;
};

const ITEMS: NavItem[] = [
  { id: "home",        label: "Tableau de bord", icon: "home",     segment: "dashboard" },
  { id: "experiences", label: "Mes expériences", icon: "grid",     segment: "experiences", badgeKey: "experiences" },
  { id: "devis",       label: "Devis",           icon: "chat",     segment: "devis",       badgeKey: "devis" },
  { id: "resa",        label: "Réservations",    icon: "calendar", segment: "reservations", badgeKey: "resa" },
  { id: "projets",     label: "Projets",         icon: "trophy",   segment: "projets",     badgeKey: "projets" },
  { id: "rev",         label: "Revenus",         icon: "euro",     segment: "revenus" },
  { id: "avis",        label: "Avis",            icon: "star",     segment: "avis",        badgeKey: "avis" },
  { id: "team",        label: "Équipe",          icon: "users",    segment: "equipe" },
];

type Props = {
  club: Club;
  clubId: string;
  badges?: NavBadges;
};

export function ClubSidebar({ club, clubId, badges = {} }: Props) {
  const pathname = usePathname() ?? "";
  const base = `/console/${clubId}`;

  return (
    <aside className="cs-sidebar" aria-label="Navigation console club">
      <div className="cs-brand">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
          <circle cx="16" cy="16" r="14" fill="var(--primary)" />
          <circle cx="16" cy="16" r="6" fill="var(--accent)" />
        </svg>
        <div className="cs-brand-text">
          <div className="cs-brand-name">Sociuly</div>
          <div className="sy-mono cs-muted">Console club</div>
        </div>
      </div>

      <div className="cs-org">
        <Avatar initials={club.initials} tone="green" />
        <div className="cs-org-text">
          <div className="sy-h4 cs-on-dark">{club.name}</div>
          <div className="sy-mono cs-muted">{club.city}</div>
        </div>
        <Icon name="chevron" size={14} color="var(--ink-3)" />
      </div>

      <nav className="cs-nav">
        {ITEMS.map((it) => {
          const href = `${base}/${it.segment}`;
          const active = pathname.startsWith(href);
          const badge = it.badgeKey ? badges[it.badgeKey] : undefined;
          return (
            <Link
              key={it.id}
              href={href}
              className={`cs-link ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                name={it.icon}
                size={16}
                color={active ? "var(--accent)" : "var(--ink-3)"}
              />
              <span className="cs-label">{it.label}</span>
              {badge ? (
                <span className="sy-badge" aria-label={`${badge} nouveau${badge > 1 ? "x" : ""}`}>
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="cs-season">
        <div className="sy-mono cs-season-kicker">{club.season.label}</div>
        <div className="sy-h4 cs-on-dark" style={{ marginTop: 4 }}>
          Objectif {Math.round((club.season.goal / 1000))}k€
        </div>
        <Progress value={club.season.progress} style={{ marginTop: 8, background: "rgba(255,255,255,0.08)" }} />
        <div className="sy-small cs-muted sy-num" style={{ marginTop: 6 }}>
          €{club.season.raised.toLocaleString("fr-FR")} / €{club.season.goal.toLocaleString("fr-FR")}
        </div>
      </div>

      <style>{`
        .cs-sidebar {
          width: 240px;
          flex: 0 0 auto;
          background: var(--ink);
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          color: var(--surface);
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .cs-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px; }
        .cs-brand-name {
          font-family: var(--display); font-weight: 700; font-size: 18px;
          color: var(--surface); font-variation-settings: var(--display-var);
        }
        .cs-brand-text { line-height: 1.2; }
        .cs-on-dark { color: var(--surface); }
        .cs-muted   { color: var(--ink-3); }

        .cs-org {
          padding: 10px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; gap: 10px;
        }
        .cs-org-text { flex: 1; min-width: 0; }

        .cs-nav { display: flex; flex-direction: column; gap: 2px; }
        .cs-link {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          color: var(--ink-3); font-size: 14px; font-weight: 500;
          transition: background .15s ease, color .15s ease;
        }
        .cs-link:hover { background: rgba(255,255,255,0.04); color: var(--surface); }
        .cs-link:focus-visible {
          outline: 3px solid var(--ring); outline-offset: 2px;
        }
        .cs-link.is-active {
          background: rgba(255,255,255,0.08);
          color: var(--surface); font-weight: 600;
        }
        .cs-label { flex: 1; }

        .cs-season {
          margin-top: auto;
          padding: 12px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
        }
        .cs-season-kicker { color: var(--highlight); }

        @media (max-width: 1024px) {
          .cs-sidebar { width: 72px; padding: 18px 10px; }
          .cs-brand-text, .cs-org-text, .cs-label, .cs-season { display: none; }
          .cs-org { justify-content: center; padding: 8px; }
          .cs-link { justify-content: center; padding: 12px 8px; }
          .cs-link .sy-badge {
            position: absolute; transform: translate(14px, -10px);
          }
          .cs-link { position: relative; }
        }
        @media (max-width: 640px) {
          .cs-sidebar {
            position: fixed; bottom: 0; left: 0; right: 0; top: auto;
            width: 100%; height: 60px; padding: 6px 8px;
            flex-direction: row; gap: 4px; align-items: center;
            border-top: 1px solid rgba(255,255,255,0.08);
            z-index: 20;
          }
          .cs-brand, .cs-org, .cs-season { display: none; }
          .cs-nav { flex-direction: row; flex: 1; justify-content: space-around; }
          .cs-link { padding: 8px; border-radius: 8px; }
        }
      `}</style>
    </aside>
  );
}
