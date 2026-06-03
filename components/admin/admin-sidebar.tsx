"use client";

import { Icon, type IconName } from "@/components/ds/icon";

// Sections de la console admin. Navigation in-page (état React) : SPEC §6 ne
// définit qu'une seule route /admin — pas de sous-routes (cf. CLAUDE.md §5).
export type AdminSection =
  | "overview"
  | "validation"
  | "moderation"
  | "finances"
  | "reports"
  | "logs"
  | "settings";

type NavItem = {
  id: AdminSection;
  label: string;
  icon: IconName;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "overview",   label: "Vue globale",     icon: "grid" },
  { id: "validation", label: "Validation clubs", icon: "check" },
  { id: "moderation", label: "Modération",       icon: "eye" },
  { id: "finances",   label: "Finances",         icon: "euro" },
  { id: "reports",    label: "Signalements",     icon: "flag" },
  { id: "logs",       label: "Logs",             icon: "menu" },
  { id: "settings",   label: "Réglages",         icon: "settings" },
];

type Props = {
  active: AdminSection;
  onSelect: (id: AdminSection) => void;
  pendingCount: number;
};

export function AdminSidebar({ active, onSelect, pendingCount }: Props) {
  return (
    <aside className="as-sidebar" aria-label="Navigation console admin">
      <div className="as-brand">
        <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
          <circle cx="16" cy="16" r="14" fill="var(--primary)" />
          <circle cx="16" cy="16" r="6" fill="var(--accent)" />
        </svg>
        <div className="as-brand-text">
          <div className="as-brand-name">Sociuly</div>
          <div className="sy-mono as-muted">Console admin</div>
        </div>
      </div>

      <nav className="as-nav">
        {NAV_ITEMS.map((it) => {
          const isActive = active === it.id;
          const badge = it.id === "validation" ? pendingCount : undefined;
          return (
            <button
              key={it.id}
              type="button"
              className={`as-link ${isActive ? "is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(it.id)}
            >
              <Icon
                name={it.icon}
                size={16}
                color={isActive ? "var(--accent)" : "var(--ink-3)"}
              />
              <span className="as-label">{it.label}</span>
              {badge ? (
                <span
                  className="sy-badge as-badge"
                  aria-label={`${badge} demande${badge > 1 ? "s" : ""} en attente`}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="as-foot">
        <div className="sy-mono as-foot-kicker">Connecté</div>
        <div className="sy-h4 as-on-dark" style={{ marginTop: 4 }}>
          Équipe Sociuly
        </div>
        <div className="sy-mono as-muted" style={{ marginTop: 2 }}>
          admin@sociuly.fr
        </div>
      </div>

      <style>{`
        .as-sidebar {
          width: 232px;
          flex: 0 0 auto;
          background: var(--ink);
          padding: 22px 16px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          color: var(--surface);
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .as-brand { display: flex; align-items: center; gap: 10px; padding: 0 8px; }
        .as-brand-name {
          font-family: var(--display); font-weight: 700; font-size: 18px;
          color: var(--surface); font-variation-settings: var(--display-var);
        }
        .as-brand-text { line-height: 1.2; }
        .as-on-dark { color: var(--surface); }
        .as-muted   { color: var(--ink-3); }

        .as-nav { display: flex; flex-direction: column; gap: 2px; }
        .as-link {
          position: relative;
          display: flex; align-items: center; gap: 12px;
          width: 100%;
          padding: 10px 12px; border-radius: 10px;
          background: transparent; border: none;
          color: var(--ink-3); font-family: inherit; font-size: 14px; font-weight: 500;
          text-align: left; cursor: pointer;
          transition: background .15s ease, color .15s ease;
        }
        .as-link:hover { background: rgba(255,255,255,0.04); color: var(--surface); }
        .as-link:focus-visible {
          outline: 3px solid var(--ring); outline-offset: 2px;
        }
        .as-link.is-active {
          background: rgba(255,255,255,0.08);
          color: var(--surface); font-weight: 600;
        }
        .as-label { flex: 1; }

        .as-foot {
          margin-top: auto;
          padding: 12px; border-radius: 12px;
          background: rgba(255,255,255,0.06);
        }
        .as-foot-kicker { color: var(--highlight); }

        @media (max-width: 1024px) {
          .as-sidebar { width: 72px; padding: 18px 10px; }
          .as-brand-text, .as-label, .as-foot { display: none; }
          .as-link { justify-content: center; padding: 12px 8px; }
          .as-badge { position: absolute; transform: translate(14px, -10px); }
        }
        @media (max-width: 640px) {
          .as-sidebar {
            position: fixed; bottom: 0; left: 0; right: 0; top: auto;
            width: 100%; height: 60px; padding: 6px 6px;
            flex-direction: row; gap: 2px; align-items: center;
            border-top: 1px solid rgba(255,255,255,0.08);
            z-index: 20;
          }
          .as-brand, .as-foot { display: none; }
          .as-nav {
            flex-direction: row; flex: 1; justify-content: space-around;
            overflow-x: auto;
          }
          .as-link { padding: 8px; border-radius: 8px; }
        }
      `}</style>
    </aside>
  );
}
