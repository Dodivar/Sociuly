"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Chip, IconBtn, Input, Tabs } from "@/components/ds/components";
import { Icon, type IconName } from "@/components/ds/icon";
import {
  FORMAT_LABEL,
  LOCATION_LABEL,
  STATUS_LABEL,
  type ExperienceAdmin,
  type ExperienceStatus,
} from "@/lib/console/mock-experiences";

type TabId = "all" | "published" | "draft" | "paused" | "archived";

const TAB_DEFS: { id: TabId; label: string; match: (s: ExperienceStatus) => boolean }[] = [
  { id: "all",       label: "Toutes",    match: (s) => s !== "archived" },
  { id: "published", label: "Publiées",  match: (s) => s === "published" },
  { id: "draft",     label: "Brouillons", match: (s) => s === "draft" },
  { id: "paused",    label: "En pause",  match: (s) => s === "paused" },
  { id: "archived",  label: "Archivées", match: (s) => s === "archived" },
];

const STATUS_CHIP: Record<ExperienceStatus, { bg: string; fg: string }> = {
  published: { bg: "var(--primary-soft)",   fg: "var(--primary-deep)" },
  draft:     { bg: "var(--surface-2)",      fg: "var(--ink-2)" },
  paused:    { bg: "var(--highlight-soft)", fg: "#6e5111" },
  archived:  { bg: "var(--surface-2)",      fg: "var(--ink-3)" },
};

type Props = {
  clubId: string;
  experiences: ExperienceAdmin[];
};

export function ExperiencesList({ clubId, experiences }: Props) {
  const [tab, setTab] = useState<TabId>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<TabId, number> = { all: 0, published: 0, draft: 0, paused: 0, archived: 0 };
    for (const x of experiences) {
      for (const t of TAB_DEFS) if (t.match(x.status)) c[t.id]++;
    }
    return c;
  }, [experiences]);

  const filtered = useMemo(() => {
    const def = TAB_DEFS.find((t) => t.id === tab)!;
    const q = query.trim().toLowerCase();
    return experiences
      .filter((x) => def.match(x.status))
      .filter((x) => (q ? x.title.toLowerCase().includes(q) : true));
  }, [experiences, tab, query]);

  return (
    <section className="sy-card pl-card" style={{ padding: 0, overflow: "hidden" }}>
      <div className="pl-toolbar">
        <Tabs
          variant="pill"
          items={TAB_DEFS.map((t) => ({
            id: t.id,
            label: `${t.label} · ${counts[t.id]}`,
          }))}
          active={tab}
          onChange={(id) => setTab(id as TabId)}
        />
        <div style={{ flex: 1, minWidth: 220, maxWidth: 360 }}>
          <Input
            placeholder="Rechercher une expérience"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Icon name="search" size={14} />}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState query={query} tab={tab} clubId={clubId} />
      ) : (
        <ul className="pl-list">
          {filtered.map((x) => (
            <ExperienceRow key={x.id} clubId={clubId} x={x} />
          ))}
        </ul>
      )}

      <style>{`
        .pl-toolbar {
          padding: 16px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .pl-list { list-style: none; margin: 0; padding: 0; }
        .pl-row {
          display: grid;
          grid-template-columns: 56px 2fr 1fr 1fr 1fr 110px 40px;
          gap: 16px;
          align-items: center;
          padding: 14px 22px;
          border-top: 1px solid var(--line);
        }
        .pl-row:hover { background: var(--surface-2); }
        .pl-thumb {
          width: 56px; height: 56px; border-radius: 10px;
          background:
            repeating-linear-gradient(135deg, transparent 0 10px, rgba(11,21,48,.06) 10px 11px),
            var(--surface-2);
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-3);
        }
        .pl-title { font-weight: 600; color: var(--ink); font-size: 14px; }
        .pl-meta-line {
          display: flex; gap: 10px; flex-wrap: wrap;
          margin-top: 4px; align-items: center;
        }
        .pl-num {
          font-family: var(--display); font-weight: 700; font-size: 16px;
          font-variation-settings: var(--display-var);
        }
        .pl-actions { position: relative; }
        .pl-menu-row:hover { background: var(--surface-2); }
        [role="menu"] a:focus-visible .pl-menu-row,
        [role="menu"] button:focus-visible .pl-menu-row {
          background: var(--surface-2);
          outline: 2px solid var(--ring);
          outline-offset: -2px;
        }
        @media (max-width: 1180px) {
          .pl-row { grid-template-columns: 56px 2fr 1fr 1fr 110px 40px; }
          .pl-row .pl-location { display: none; }
        }
        @media (max-width: 900px) {
          .pl-row { grid-template-columns: 56px 1fr 110px 40px; }
          .pl-row .pl-price, .pl-row .pl-bookings { display: none; }
        }
        @media (max-width: 600px) {
          .pl-toolbar { padding: 14px; }
          .pl-row {
            grid-template-columns: 48px 1fr auto;
            grid-template-areas:
              "thumb title status"
              "thumb meta   actions";
            row-gap: 6px;
            padding: 14px;
          }
          .pl-thumb { grid-area: thumb; width: 48px; height: 48px; }
          .pl-main  { grid-area: title; }
          .pl-status-cell { grid-area: status; justify-self: end; }
          .pl-actions { grid-area: actions; justify-self: end; }
        }
      `}</style>
    </section>
  );
}

function ExperienceRow({ clubId, x }: { clubId: string; x: ExperienceAdmin }) {
  const s = STATUS_CHIP[x.status];
  const priceEuros = (x.basePriceCents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <li className="pl-row">
      <div className="pl-thumb" aria-hidden>
        <Icon name="image" size={18} />
      </div>

      <div className="pl-main" style={{ minWidth: 0 }}>
        <div className="pl-title">{x.title}</div>
        <div className="pl-meta-line">
          <Chip variant="outline" size="sm">{FORMAT_LABEL[x.format]}</Chip>
          <span className="sy-mono">{formatDuration(x.durationMinutes)}</span>
          {x.rating !== undefined && x.reviewsCount > 0 && (
            <span className="sy-mono" style={{ color: "var(--ink-2)" }}>
              ★ {x.rating.toFixed(1)} · {x.reviewsCount} avis
            </span>
          )}
        </div>
      </div>

      <div className="pl-price">
        <span className="pl-num sy-num">€{priceEuros}</span>
        <div className="sy-mono" style={{ marginTop: 2 }}>à partir de · TTC</div>
      </div>

      <div className="pl-location">
        <span className="sy-small" style={{ color: "var(--ink)", fontWeight: 500 }}>
          {LOCATION_LABEL[x.location]}
        </span>
      </div>

      <div className="pl-bookings">
        <span className="sy-small" style={{ color: "var(--ink)", fontWeight: 500 }}>
          {x.bookingsCount} commande{x.bookingsCount > 1 ? "s" : ""}
        </span>
        {x.pendingQuotes > 0 && (
          <div className="sy-mono" style={{ marginTop: 2, color: "var(--accent-deep)" }}>
            {x.pendingQuotes} devis en attente
          </div>
        )}
      </div>

      <div className="pl-status-cell">
        <span
          className="sy-chip"
          style={{ background: s.bg, color: s.fg, fontWeight: 600 }}
        >
          {STATUS_LABEL[x.status]}
        </span>
      </div>

      <div className="pl-actions">
        <RowMenu clubId={clubId} experience={x} />
      </div>
    </li>
  );
}

function RowMenu({ clubId, experience }: { clubId: string; experience: ExperienceAdmin }) {
  const [open, setOpen] = useState(false);
  const editHref = `/console/${clubId}/experiences/${experience.slug}`;
  const publicHref = `/experiences/${experience.slug}`;

  return (
    <>
      <IconBtn
        size="sm"
        aria-label="Actions sur l'expérience"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="settings" size={14} />
      </IconBtn>
      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "transparent",
              border: 0, cursor: "default", zIndex: 10,
            }}
          />
          <div
            role="menu"
            className="sy-card"
            style={{
              position: "absolute", right: 0, top: "calc(100% + 6px)",
              padding: 6, minWidth: 220, zIndex: 11,
              boxShadow: "var(--shadow-md)", borderColor: "var(--line)",
            }}
          >
            <MenuItem
              icon="eye"
              label="Voir la page publique"
              href={publicHref}
              disabled={experience.status !== "published"}
            />
            <MenuItem icon="settings" label="Éditer" href={editHref} />
            {experience.status === "published" && (
              <MenuItem icon="minus" label="Mettre en pause" />
            )}
            {experience.status === "paused" && (
              <MenuItem icon="bolt" label="Reprendre" />
            )}
            {experience.status === "draft" && (
              <MenuItem icon="upload" label="Publier" />
            )}
            <MenuItem icon="plus" label="Dupliquer" />
            <div className="sy-divider" style={{ margin: "4px 0" }} />
            {experience.status !== "archived" ? (
              <MenuItem icon="close" label="Archiver" danger />
            ) : (
              <MenuItem icon="bolt" label="Restaurer en brouillon" />
            )}
          </div>
        </>
      )}
    </>
  );
}

function MenuItem({
  icon,
  label,
  href,
  disabled,
  danger,
}: {
  icon: IconName;
  label: string;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  const color = disabled ? "var(--ink-3)" : danger ? "var(--danger)" : "var(--ink)";
  const inner = (
    <span
      className="pl-menu-row"
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 10px", borderRadius: 8,
        color, fontSize: 13, fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <Icon name={icon} size={14} color={color} />
      {label}
    </span>
  );
  if (disabled) return <div role="menuitem" aria-disabled>{inner}</div>;
  if (href) {
    return (
      <Link role="menuitem" href={href}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      role="menuitem"
      type="button"
      onClick={() => { /* TODO(api): brancher l'action serveur */ }}
      style={{ all: "unset", display: "block", width: "100%", cursor: "pointer" }}
    >
      {inner}
    </button>
  );
}

function EmptyState({
  query, tab, clubId,
}: { query: string; tab: TabId; clubId: string }) {
  const filtered = query.trim().length > 0;
  return (
    <div
      style={{
        padding: "48px 22px", textAlign: "center",
        borderTop: "1px solid var(--line)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 56, height: 56, borderRadius: 14,
          background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <Icon name="grid" size={22} color="var(--ink-3)" />
      </div>
      <div>
        <div className="sy-h3">
          {filtered
            ? "Aucune expérience ne correspond à votre recherche"
            : tab === "all"
              ? "Aucune expérience pour le moment"
              : `Aucune expérience ${labelOf(tab).toLowerCase()}`}
        </div>
        <div className="sy-small sy-muted" style={{ marginTop: 4 }}>
          Créez votre première expérience pour la rendre visible sur la marketplace.
        </div>
      </div>
      {!filtered && (
        <Link
          href={`/console/${clubId}/experiences/nouvelle`}
          className="sy-btn sy-btn-primary"
        >
          <Icon name="plus" size={14} color="#fff" />
          Nouvelle expérience
        </Link>
      )}
    </div>
  );
}

function labelOf(tab: TabId): string {
  return TAB_DEFS.find((t) => t.id === tab)?.label ?? "";
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}
