"use client";

import React, { useState } from "react";
import {
  Btn, Card, Chip, IconBtn, Input, Progress, Tabs,
} from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import type { Project, ProjectStatus } from "@/lib/console/mock-projects";

// ─── helpers ────────────────────────────────────────────────────────────────

function fmt(cents: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  }).format(cents / 100);
}

const STATUS_META: Record<ProjectStatus, { dot: string; label: string }> = {
  live:     { dot: "var(--accent)",    label: "En cours" },
  funded:   { dot: "var(--primary)",   label: "Financé" },
  draft:    { dot: "var(--ink-3)",     label: "Brouillon" },
  upcoming: { dot: "var(--highlight)", label: "À venir" },
};

const HUE_BG: Record<string, string> = {
  green: "#1f4b3f", orange: "#c0451f", teal: "#1f5b58", yellow: "#b8861a",
};

type TabId = "Tous" | "En cours" | "Brouillons";

// ─── ProjectListItem ─────────────────────────────────────────────────────────

function ProjectListItem({
  project, active, onClick,
}: { project: Project; active: boolean; onClick: () => void }) {
  const s = STATUS_META[project.status];
  const pct = project.goalCents > 0
    ? project.raisedCents / project.goalCents
    : 1;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%", textAlign: "left", padding: "14px 16px", borderRadius: 12,
        background: active ? "var(--surface-2)" : "transparent",
        border: `1.5px solid ${active ? "var(--ink)" : "transparent"}`,
        cursor: "pointer", transition: "background .15s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{
          display: "inline-block", width: 8, height: 8,
          borderRadius: "50%", background: s.dot, flexShrink: 0,
        }} />
        <span className="sy-mono">{s.label}</span>
        {project.daysLeft !== null && project.daysLeft > 0 && (
          <span className="sy-mono sy-num" style={{ marginLeft: "auto" }}>
            {project.daysLeft}j
          </span>
        )}
        {project.status === "upcoming" && (
          <span className="sy-mono" style={{ marginLeft: "auto", fontSize: 11 }}>
            à ouvrir
          </span>
        )}
      </div>
      <div className="sy-h4" style={{ marginTop: 6 }}>{project.title}</div>
      {project.goalCents > 0 && (
        <>
          <Progress value={pct} style={{ marginTop: 10 }} />
          <div className="sy-small sy-muted sy-num" style={{ marginTop: 6 }}>
            {fmt(project.raisedCents)} / {fmt(project.goalCents)}
          </div>
        </>
      )}
      {project.status === "draft" && (
        <div className="sy-small sy-muted" style={{ marginTop: 6 }}>brouillon</div>
      )}
    </button>
  );
}

// ─── ProjectTimeline ─────────────────────────────────────────────────────────

function ProjectTimeline({ items }: { items: Project["timeline"] }) {
  return (
    <div style={{ position: "relative", paddingLeft: 26 }}>
      <div style={{
        position: "absolute", left: 9, top: 8, bottom: 8,
        width: 2, background: "var(--line)",
      }} />
      {items.map((it, i) => (
        <div
          key={i}
          style={{ position: "relative", paddingBottom: i === items.length - 1 ? 0 : 22 }}
        >
          <div style={{
            position: "absolute", left: -22, top: 4,
            width: 18, height: 18, borderRadius: "50%",
            background: it.done ? "var(--primary)" : "var(--surface)",
            border: `2px solid ${it.done ? "var(--primary)" : "var(--line-2)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {it.done && <Icon name="check" size={10} color="#fff" />}
          </div>
          <div className="sy-mono">{it.date}</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>{it.title}</div>
          {it.body && (
            <div className="sy-small sy-muted" style={{ marginTop: 4 }}>{it.body}</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── ProjectDetail ───────────────────────────────────────────────────────────

function ProjectDetail({ project }: { project: Project }) {
  const s = STATUS_META[project.status];
  const pct = project.goalCents > 0
    ? project.raisedCents / project.goalCents
    : 1;

  return (
    <div style={{ flex: 1, minWidth: 0, padding: "28px 36px", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Chip variant="accent" leadingDot>
            {s.label} · projet
          </Chip>
          <h1
            className="sy-h1"
            style={{ marginTop: 12, fontSize: 32, lineHeight: 1.15 }}
          >
            {project.title}
          </h1>
          <p className="sy-body" style={{ marginTop: 8, maxWidth: 580, color: "var(--ink-3)" }}>
            {project.description}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Btn variant="outline" icon={<Icon name="eye" size={14} />}>Aperçu public</Btn>
          <Btn variant="dark">Modifier</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{
        marginTop: 22,
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        gap: 16,
      }}>
        <Card style={{ background: "var(--accent-soft)", borderColor: "transparent", padding: 22 }}>
          <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>Collecté</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
            <span style={{
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 40,
              lineHeight: 1, fontVariationSettings: "var(--display-var)",
            }} className="sy-num">
              {fmt(project.raisedCents)}
            </span>
            {project.goalCents > 0 && (
              <span className="sy-h4 sy-muted">/ {fmt(project.goalCents)}</span>
            )}
          </div>
          {project.goalCents > 0 && (
            <>
              <Progress value={pct} size="tall" style={{ marginTop: 16 }} />
              <div className="sy-small sy-num" style={{ marginTop: 8, color: "var(--accent-deep)" }}>
                {Math.round(pct * 100)}% atteint
              </div>
            </>
          )}
        </Card>

        <Card>
          <div className="sy-mono">Soutiens</div>
          <div style={{
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, marginTop: 6,
            fontVariationSettings: "var(--display-var)",
          }} className="sy-num">
            {project.bookings}
          </div>
          <div className="sy-small sy-muted" style={{ marginTop: 4 }}>réservations</div>
        </Card>

        <Card>
          <div className="sy-mono">Reste</div>
          <div style={{
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, marginTop: 6,
            color: project.daysLeft && project.daysLeft > 0 ? "var(--accent)" : "var(--ink-3)",
            fontVariationSettings: "var(--display-var)",
          }} className="sy-num">
            {project.status === "funded"
              ? "Financé ✓"
              : project.daysLeft !== null && project.daysLeft > 0
                ? `${project.daysLeft} j`
                : "—"}
          </div>
          <div className="sy-small sy-muted" style={{ marginTop: 4 }}>
            {project.status === "funded" ? "objectif atteint" : "avant clôture"}
          </div>
        </Card>

        <Card>
          <div className="sy-mono">Vues</div>
          <div style={{
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, marginTop: 6,
            fontVariationSettings: "var(--display-var)",
          }} className="sy-num">
            {project.views > 0
              ? new Intl.NumberFormat("fr-FR").format(project.views)
              : "—"}
          </div>
          {project.viewsDelta && (
            <div className="sy-small" style={{ marginTop: 4, color: "var(--primary)" }}>
              {project.viewsDelta} sem.
            </div>
          )}
        </Card>
      </div>

      {/* Bottom grid */}
      <div style={{
        marginTop: 24,
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: 20,
      }}>
        {/* Linked prestations */}
        <Card>
          <div className="sy-mono">
            Prestations liées · {project.prestations.length}
          </div>
          <h3 className="sy-h2" style={{ marginTop: 4 }}>Ce qui finance ce projet</h3>

          {project.prestations.length === 0 ? (
            <div className="sy-small sy-muted" style={{ marginTop: 14 }}>
              Aucune prestation liée pour l'instant.
            </div>
          ) : (
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              {project.prestations.map((pp) => (
                <div
                  key={pp.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "10px 12px", borderRadius: 12, background: "var(--surface-2)",
                  }}
                >
                  <div style={{
                    width: 48, height: 48, flexShrink: 0,
                    background: HUE_BG[pp.hue], borderRadius: 8,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="sy-h4">{pp.title}</div>
                    <div className="sy-mono" style={{ marginTop: 2 }}>
                      {fmt(pp.priceCents)} · {pp.bookings} résa
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--display)", fontWeight: 700, fontSize: 18,
                    fontVariationSettings: "var(--display-var)", flexShrink: 0,
                  }} className="sy-num">
                    {fmt(pp.totalCents)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <Btn
            variant="outline"
            block
            icon={<Icon name="plus" size={13} />}
            style={{ marginTop: 14 }}
          >
            Lier une autre prestation
          </Btn>
        </Card>

        {/* Timeline */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div className="sy-mono">Mises à jour publiques</div>
              <h3 className="sy-h2" style={{ marginTop: 4 }}>Journal du projet</h3>
            </div>
            <Btn variant="ghost" size="sm" icon={<Icon name="plus" size={13} />}>
              Poster
            </Btn>
          </div>
          <div style={{ marginTop: 16 }}>
            {project.timeline.length > 0 ? (
              <ProjectTimeline items={project.timeline} />
            ) : (
              <div className="sy-small sy-muted">Aucune mise à jour pour l'instant.</div>
            )}
          </div>
        </Card>
      </div>

      <style>{`
        @media (max-width: 1200px) {
          .proj-kpis { grid-template-columns: 1fr 1fr !important; }
          .proj-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── ProjectsView (main exported component) ──────────────────────────────────

export function ProjectsView({ projects }: { projects: Project[] }) {
  const [activeId, setActiveId] = useState(projects[0]?.id ?? null);
  const [tab, setTab] = useState<TabId>("Tous");
  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) => {
    if (tab === "En cours" && p.status !== "live") return false;
    if (tab === "Brouillons" && p.status !== "draft") return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = projects.find((p) => p.id === activeId) ?? projects[0];

  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0, overflow: "hidden", minHeight: 0 }}>
      {/* List panel */}
      <div style={{
        width: 340, flexShrink: 0, borderRight: "1px solid var(--line)",
        background: "var(--surface)", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{ padding: "20px 18px", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="sy-h2">Projets</h2>
            <IconBtn size="sm"><Icon name="plus" size={15} /></IconBtn>
          </div>
          <Input
            placeholder="Rechercher…"
            icon={<Icon name="search" size={14} />}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            style={{ marginTop: 12, height: 38 }}
          />
          <div style={{ marginTop: 12 }}>
            <Tabs
              variant="pill"
              items={["Tous", "En cours", "Brouillons"] as TabId[]}
              active={tab}
              onChange={(t) => setTab(t as TabId)}
            />
          </div>
        </div>

        <div style={{
          padding: 12, display: "flex", flexDirection: "column",
          gap: 4, overflowY: "auto", flex: 1,
        }}>
          {filtered.length === 0 && (
            <div className="sy-small sy-muted" style={{ padding: "20px 8px", textAlign: "center" }}>
              Aucun projet trouvé.
            </div>
          )}
          {filtered.map((p) => (
            <ProjectListItem
              key={p.id}
              project={p}
              active={p.id === activeId}
              onClick={() => setActiveId(p.id)}
            />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {active ? (
        <ProjectDetail project={active} />
      ) : (
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div className="sy-body sy-muted">Sélectionnez un projet</div>
        </div>
      )}
    </div>
  );
}
