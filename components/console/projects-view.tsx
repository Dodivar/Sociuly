"use client";

import { useMemo, useState } from "react";
import {
  Btn, Card, Chip, IconBtn, Input, Progress, Tabs,
} from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import type {
  LinkedExperience, ProjectDetail, ProjectStatus, ProjectUpdate,
} from "@/lib/console/projects";

type Props = { projects: ProjectDetail[] };

const TABS = ["Tous", "Live", "Brouillons"] as const;
type Tab = (typeof TABS)[number];

type StatusVisual = { dot: string; label: string };
const STATUS_VISUAL: Record<ProjectStatus | "upcoming", StatusVisual> = {
  active:   { dot: "var(--accent)",    label: "En cours" },
  upcoming: { dot: "var(--highlight)", label: "À venir" },
  funded:   { dot: "var(--success)",   label: "Financé" },
  draft:    { dot: "var(--ink-3)",     label: "Brouillon" },
  archived: { dot: "var(--ink-2)",     label: "Archivé" },
};

function visualKey(p: { status: ProjectStatus; upcoming?: boolean }) {
  if (p.status === "active" && p.upcoming) return "upcoming" as const;
  return p.status;
}

function fmtEuros(cents: number) {
  return `€${Math.round(cents / 100).toLocaleString("fr-FR")}`;
}

export function ProjectsView({ projects }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("Tous");
  const [selectedId, setSelectedId] = useState<string | null>(
    projects[0]?.id ?? null,
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (tab === "Live" && !(p.status === "active" && !p.upcoming)) return false;
      if (tab === "Brouillons" && p.status !== "draft") return false;
      if (query) {
        const q = query.trim().toLowerCase();
        if (q && !p.title.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [projects, tab, query]);

  const selected =
    projects.find((p) => p.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div
      className="pv-root"
      data-mobile-detail={mobileDetailOpen ? "1" : "0"}
    >
      <aside className="pv-list" aria-label="Liste des projets">
        <header className="pv-list-header">
          <div className="pv-list-titlebar">
            <h2 className="sy-h2">Projets</h2>
            <IconBtn size="sm" aria-label="Nouveau projet">
              <Icon name="plus" size={15} />
            </IconBtn>
          </div>
          <Input
            placeholder="Rechercher…"
            icon={<Icon name="search" size={14} />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher un projet"
            style={{ marginTop: 12, height: 38 }}
          />
          <div style={{ marginTop: 12 }}>
            <Tabs
              variant="pill"
              items={[...TABS]}
              active={tab}
              onChange={(id) => setTab(id as Tab)}
            />
          </div>
        </header>

        <div className="pv-list-body">
          {filtered.length === 0 ? (
            <div className="pv-list-empty">
              <div className="sy-mono">Aucun projet</div>
              <p className="sy-small sy-muted" style={{ marginTop: 6 }}>
                Ajustez la recherche ou changez de filtre.
              </p>
            </div>
          ) : (
            filtered.map((p) => (
              <ProjectListRow
                key={p.id}
                project={p}
                active={p.id === selected?.id}
                onClick={() => {
                  setSelectedId(p.id);
                  setMobileDetailOpen(true);
                }}
              />
            ))
          )}
        </div>
      </aside>

      <section className="pv-detail" aria-label="Détail du projet sélectionné">
        {selected ? (
          <ProjectDetailPane
            project={selected}
            onBack={() => setMobileDetailOpen(false)}
          />
        ) : (
          <EmptyDetail />
        )}
      </section>

      <style>{`
        .pv-root {
          display: flex;
          flex: 1;
          min-height: calc(100vh - 60px);
          align-items: stretch;
        }
        .pv-list {
          width: 340px;
          flex: 0 0 auto;
          border-right: 1px solid var(--line);
          background: var(--surface);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: calc(100vh - 60px);
        }
        .pv-list-header {
          padding: 20px 18px;
          border-bottom: 1px solid var(--line);
        }
        .pv-list-titlebar {
          display: flex; justify-content: space-between; align-items: center;
        }
        .pv-list-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
          flex: 1;
        }
        .pv-list-empty {
          padding: 28px 12px; text-align: center;
        }

        .pv-detail {
          flex: 1; min-width: 0;
          padding: 28px 36px;
        }

        @media (max-width: 1180px) {
          .pv-list { width: 300px; }
          .pv-detail { padding: 24px 24px; }
        }
        @media (max-width: 900px) {
          .pv-list { width: 268px; }
        }
        @media (max-width: 768px) {
          .pv-root {
            flex-direction: column;
            min-height: auto;
          }
          .pv-list {
            width: 100%;
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 1px solid var(--line);
          }
          .pv-detail { padding: 18px 16px; }
          .pv-root[data-mobile-detail="1"] .pv-list { display: none; }
          .pv-root[data-mobile-detail="0"] .pv-detail { display: none; }
        }
      `}</style>
    </div>
  );
}

// ─────────────── List row ───────────────

function ProjectListRow({
  project, active, onClick,
}: {
  project: ProjectDetail;
  active: boolean;
  onClick: () => void;
}) {
  const key = visualKey(project);
  const v = STATUS_VISUAL[key];
  const progress = project.targetCents > 0
    ? project.raisedCents / project.targetCents
    : 0;
  const money =
    project.status === "draft"
      ? "brouillon"
      : project.status === "funded"
        ? `${fmtEuros(project.raisedCents)} collectés`
        : `${fmtEuros(project.raisedCents)} / ${fmtEuros(project.targetCents)}`;

  return (
    <button
      type="button"
      className="pv-row"
      data-active={active ? "1" : "0"}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`${project.title} — ${v.label}`}
    >
      <div className="pv-row-top">
        <span
          aria-hidden
          className="pv-dot"
          style={{ background: v.dot }}
        />
        <span className="sy-mono">{v.label}</span>
        {project.remainingLabel ? (
          <span className="sy-mono sy-num pv-row-remaining">
            {project.remainingLabel}
          </span>
        ) : null}
      </div>
      <div className="sy-h4 pv-row-title">{project.title}</div>
      <Progress value={progress} style={{ marginTop: 10 }} />
      <div className="sy-small sy-muted sy-num pv-row-money">{money}</div>

      <style>{`
        .pv-row {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1.5px solid transparent;
          border-radius: 12px;
          padding: 14px 16px;
          cursor: pointer;
          color: inherit;
          font: inherit;
          transition: background .15s ease, border-color .15s ease;
        }
        .pv-row:hover { background: var(--surface-2); }
        .pv-row:focus-visible {
          outline: 3px solid var(--ring);
          outline-offset: 2px;
        }
        .pv-row[data-active="1"] {
          background: var(--surface-2);
          border-color: var(--ink);
        }
        .pv-row-top {
          display: flex; align-items: center; gap: 8px;
        }
        .pv-dot {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          flex: 0 0 auto;
        }
        .pv-row-remaining { margin-left: auto; }
        .pv-row-title { margin-top: 6px; }
        .pv-row-money { margin-top: 6px; }
      `}</style>
    </button>
  );
}

// ─────────────── Detail pane ───────────────

function ProjectDetailPane({
  project, onBack,
}: {
  project: ProjectDetail;
  onBack: () => void;
}) {
  const key = visualKey(project);
  const v = STATUS_VISUAL[key];
  const progress = project.targetCents > 0
    ? project.raisedCents / project.targetCents
    : 0;
  const percent = Math.round(progress * 100);

  return (
    <>
      <button
        type="button"
        className="pv-back"
        onClick={onBack}
        aria-label="Retour à la liste"
      >
        <Icon name="arrowLeft" size={14} />
        <span>Retour</span>
      </button>

      {/* Title block */}
      <div className="pv-titlebar">
        <div style={{ minWidth: 0 }}>
          <Chip variant="accent" leadingDot>
            {v.label.toLowerCase()} · projet
          </Chip>
          <h1 className="sy-h1 pv-title">{project.title}</h1>
          <p className="sy-body pv-desc">{project.description}</p>
        </div>
        <div className="pv-actions">
          <Btn variant="outline" icon={<Icon name="eye" size={14} />}>
            Aperçu public
          </Btn>
          <Btn variant="dark">Modifier</Btn>
        </div>
      </div>

      {/* Big numbers */}
      <div className="pv-stats">
        <Card
          style={{
            background: "var(--accent-soft)",
            borderColor: "transparent",
            padding: 22,
          }}
        >
          <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>
            Collecté
          </div>
          <div
            style={{
              display: "flex", alignItems: "baseline", gap: 10, marginTop: 6,
            }}
          >
            <div
              className="sy-num"
              style={{
                fontFamily: "var(--display)", fontWeight: 700, fontSize: 44,
                lineHeight: 1, fontVariationSettings: "var(--display-var)",
              }}
            >
              {fmtEuros(project.raisedCents)}
            </div>
            <div className="sy-h4 sy-muted">
              / {fmtEuros(project.targetCents)}
            </div>
          </div>
          <Progress value={progress} size="tall" style={{ marginTop: 16 }} />
          <div
            className="sy-small sy-num"
            style={{ marginTop: 8, color: "var(--accent-deep)" }}
          >
            {percent}% atteint
          </div>
        </Card>

        <StatBig label="Soutiens" value={String(project.supportersCount)}
          hint="réservations" />
        <StatBig
          label="Reste"
          value={project.remainingLabel ?? "—"}
          hint={
            project.status === "funded"
              ? "objectif atteint"
              : project.status === "draft"
                ? "brouillon"
                : "avant clôture"
          }
          valueColor={project.remainingLabel === "à ouvrir"
            ? "var(--highlight)"
            : project.status === "funded"
              ? "var(--success)"
              : "var(--accent)"}
        />
        <StatBig
          label="Vues"
          value={project.viewsCount.toLocaleString("fr-FR")}
          hint={
            project.viewsWeeklyDeltaPercent > 0
              ? `+${project.viewsWeeklyDeltaPercent}% sem.`
              : "stable cette sem."
          }
          hintColor={project.viewsWeeklyDeltaPercent > 0
            ? "var(--success)"
            : "var(--ink-3)"}
        />
      </div>

      {/* Two columns */}
      <div className="pv-cols">
        <LinkedExperiencesCard items={project.linkedExperiences} />
        <UpdatesCard updates={project.updates} />
      </div>

      <style>{`
        .pv-back {
          display: none;
          align-items: center; gap: 6px;
          padding: 6px 10px;
          margin-bottom: 12px;
          background: var(--surface-2);
          border: none; border-radius: 999px;
          font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--ink-2); cursor: pointer;
        }
        .pv-back:hover { background: var(--surface-3); color: var(--ink); }
        .pv-back:focus-visible {
          outline: 3px solid var(--ring); outline-offset: 2px;
        }

        .pv-titlebar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
        }
        .pv-title { margin-top: 12px; font-size: 36px; }
        .pv-desc  { margin-top: 8px; max-width: 640px; }
        .pv-actions {
          display: flex; gap: 8px; flex-shrink: 0;
        }

        .pv-stats {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 16px; align-items: stretch;
        }
        .pv-cols {
          margin-top: 24px;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 20px;
        }

        @media (max-width: 1180px) {
          .pv-stats { grid-template-columns: 1.4fr 1fr 1fr; }
          .pv-stats > :nth-child(4) { grid-column: span 3; }
          .pv-title { font-size: 30px; }
        }
        @media (max-width: 900px) {
          .pv-stats {
            grid-template-columns: 1fr 1fr;
          }
          .pv-stats > :nth-child(1) { grid-column: span 2; }
          .pv-stats > :nth-child(4) { grid-column: auto; }
          .pv-cols { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .pv-back { display: inline-flex; }
          .pv-titlebar { flex-direction: column; align-items: stretch; }
          .pv-actions { width: 100%; }
          .pv-actions > * { flex: 1; }
          .pv-title { font-size: 26px; }
        }
        @media (max-width: 540px) {
          .pv-stats {
            grid-template-columns: 1fr;
          }
          .pv-stats > :nth-child(1) { grid-column: auto; }
        }
      `}</style>
    </>
  );
}

function StatBig({
  label, value, hint, valueColor, hintColor,
}: {
  label: string;
  value: string;
  hint?: string;
  valueColor?: string;
  hintColor?: string;
}) {
  return (
    <Card>
      <div className="sy-mono">{label}</div>
      <div
        className="sy-num"
        style={{
          fontFamily: "var(--display)", fontWeight: 700, fontSize: 32,
          marginTop: 6, fontVariationSettings: "var(--display-var)",
          color: valueColor,
        }}
      >
        {value}
      </div>
      {hint && (
        <div
          className="sy-small"
          style={{ marginTop: 4, color: hintColor ?? "var(--ink-3)" }}
        >
          {hint}
        </div>
      )}
    </Card>
  );
}

// ─────────────── Linked experiences ───────────────

const HUE_COLOR: Record<LinkedExperience["hue"], string> = {
  green:  "#1f4b3f",
  orange: "#c0451f",
  yellow: "#b8861a",
  teal:   "#1f5b58",
};

function LinkedExperiencesCard({ items }: { items: LinkedExperience[] }) {
  return (
    <Card>
      <div className="sy-mono">Expériences liées · {items.length}</div>
      <h3 className="sy-h2" style={{ marginTop: 4 }}>
        Ce qui finance ce projet
      </h3>

      {items.length === 0 ? (
        <div
          style={{
            marginTop: 14, padding: "20px 16px", borderRadius: 12,
            background: "var(--surface-2)", textAlign: "center",
          }}
        >
          <div className="sy-mono">Aucune expérience liée</div>
          <p className="sy-small sy-muted" style={{ marginTop: 6 }}>
            Liez au moins une expérience pour ouvrir le financement.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {items.map((it) => (
            <div
              key={it.id}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "10px 12px", borderRadius: 12,
                background: "var(--surface-2)",
              }}
            >
              <div
                className="sy-img"
                style={{
                  width: 48, height: 48, flex: "0 0 auto",
                  background: HUE_COLOR[it.hue], borderRadius: 8,
                }}
                aria-hidden
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="sy-h4">{it.title}</div>
                <div className="sy-mono" style={{ marginTop: 2 }}>
                  €{it.priceEuros} · {it.bookingsCount} résa
                </div>
              </div>
              <div
                className="sy-num"
                style={{
                  fontFamily: "var(--display)", fontWeight: 700, fontSize: 18,
                  fontVariationSettings: "var(--display-var)",
                }}
              >
                €{it.totalEuros.toLocaleString("fr-FR")}
              </div>
            </div>
          ))}
        </div>
      )}

      <Btn
        variant="outline"
        block
        style={{ marginTop: 14 }}
        icon={<Icon name="plus" size={13} />}
      >
        Lier une autre expérience
      </Btn>
    </Card>
  );
}

// ─────────────── Updates / timeline ───────────────

function UpdatesCard({ updates }: { updates: ProjectUpdate[] }) {
  return (
    <Card>
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}
      >
        <div>
          <div className="sy-mono">Mises à jour publiques</div>
          <h3 className="sy-h2" style={{ marginTop: 4 }}>
            Journal du projet
          </h3>
        </div>
        <Btn variant="ghost" size="sm" icon={<Icon name="plus" size={13} />}>
          Poster
        </Btn>
      </div>

      {updates.length === 0 ? (
        <div
          style={{
            marginTop: 16, padding: "20px 16px", borderRadius: 12,
            background: "var(--surface-2)", textAlign: "center",
          }}
        >
          <div className="sy-mono">Aucune mise à jour</div>
          <p className="sy-small sy-muted" style={{ marginTop: 6 }}>
            Postez la première pour tenir vos soutiens informés.
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <ProjectTimeline items={updates} />
        </div>
      )}
    </Card>
  );
}

function ProjectTimeline({ items }: { items: ProjectUpdate[] }) {
  return (
    <ol className="pv-timeline">
      <span className="pv-timeline-rail" aria-hidden />
      {items.map((it, i) => (
        <li
          key={it.id}
          className="pv-timeline-item"
          data-last={i === items.length - 1 ? "1" : "0"}
        >
          <span
            className="pv-timeline-dot"
            data-done={it.done ? "1" : "0"}
            aria-hidden
          >
            {it.done && <Icon name="check" size={10} color="#fff" />}
          </span>
          <div className="sy-mono">{it.date}</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>{it.title}</div>
          {it.body && (
            <div
              className="sy-small sy-muted"
              style={{ marginTop: 4 }}
            >
              {it.body}
            </div>
          )}
        </li>
      ))}

      <style>{`
        .pv-timeline {
          position: relative;
          padding: 0 0 0 26px;
          margin: 0;
          list-style: none;
        }
        .pv-timeline-rail {
          position: absolute;
          left: 9px; top: 8px; bottom: 8px;
          width: 2px;
          background: var(--line);
        }
        .pv-timeline-item {
          position: relative;
          padding-bottom: 22px;
        }
        .pv-timeline-item[data-last="1"] { padding-bottom: 0; }
        .pv-timeline-dot {
          position: absolute;
          left: -22px; top: 4px;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--surface);
          border: 2px solid var(--line-2);
          display: inline-flex; align-items: center; justify-content: center;
        }
        .pv-timeline-dot[data-done="1"] {
          background: var(--primary);
          border-color: var(--primary);
        }
      `}</style>
    </ol>
  );
}

// ─────────────── Empty state ───────────────

function EmptyDetail() {
  return (
    <div
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "100%", textAlign: "center",
        padding: 40, gap: 12,
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: 16,
          background: "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
        aria-hidden
      >
        <Icon name="trophy" size={24} color="var(--ink-3)" />
      </div>
      <h2 className="sy-h2">Aucun projet sélectionné</h2>
      <p className="sy-body" style={{ maxWidth: 360 }}>
        Sélectionnez un projet dans la liste ou créez-en un nouveau pour ouvrir
        le financement de votre saison.
      </p>
      <Btn variant="primary" icon={<Icon name="plus" size={14} color="#fff" />}>
        Nouveau projet
      </Btn>
    </div>
  );
}
