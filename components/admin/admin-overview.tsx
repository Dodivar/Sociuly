"use client";

import { useState } from "react";
import { Avatar, Btn, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { AreaChart, BarsChart } from "@/components/admin/admin-chart";
import {
  PENDING_STATUS_LABEL,
  type AdminData,
  type AdminKpi,
  type ChartSeries,
  type PendingClub,
} from "@/lib/admin/data";

// Style des puces de statut — tokens uniquement (CLAUDE.md §6/§7).
export const PENDING_STATUS_CHIP: Record<
  PendingClub["status"],
  { bg: string; fg: string }
> = {
  to_verify: { bg: "var(--highlight-soft)", fg: "#6e5111" },
  docs_incomplete: { bg: "var(--surface-2)", fg: "var(--danger)" },
};

type Props = {
  data: AdminData;
  onOpenValidation: () => void;
  onReview: (id: string) => void;
};

export function AdminOverview({ data, onOpenValidation, onReview }: Props) {
  const [serie, setSerie] = useState<ChartSeries["id"]>("commissions");

  // Aperçu : les 3 demandes les plus anciennes (déjà triées dans le fetcher).
  const previewRows = data.pending.slice(0, 3);

  return (
    <div className="ov-root">
      <header className="ov-head">
        <div>
          <div className="sy-mono">Sociuly · Admin</div>
          <h1 className="sy-h1" style={{ fontSize: 24, marginTop: 4 }}>
            Vue globale — {data.periodLabel}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn variant="ghost" size="sm" icon={<Icon name="download" size={14} />}>
            Exporter CSV
          </Btn>
          <Btn variant="ghost" size="sm" iconRight={<Icon name="chevron" size={14} />}>
            Période
          </Btn>
        </div>
      </header>

      <div className="ov-kpis">
        {data.overviewKpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>

      <div className="ov-charts">
        <section className="sy-card" aria-label="Chiffre d'affaires et commissions">
          <div className="ov-chart-head">
            <h2 className="sy-h3">CA &amp; commissions · 6 mois</h2>
            <Tabs
              variant="pill"
              items={data.charts.series.map((s) => ({ id: s.id, label: s.label }))}
              active={serie}
              onChange={(id) => setSerie(id as ChartSeries["id"])}
            />
          </div>
          <div style={{ marginTop: 14 }}>
            <AreaChart
              months={data.charts.months}
              series={data.charts.series}
              activeId={serie}
              height={160}
            />
          </div>
        </section>

        <section className="sy-card" aria-label="Top formats">
          <h2 className="sy-h3">Top formats</h2>
          <div style={{ marginTop: 14 }}>
            <BarsChart items={data.charts.topFormats} height={160} />
          </div>
        </section>
      </div>

      <section
        className="sy-card ov-table"
        style={{ padding: 0, overflow: "hidden" }}
        aria-label="Clubs en attente de validation"
      >
        <div className="ov-table-head">
          <div>
            <h2 className="sy-h3">Clubs en attente de validation</h2>
            <div className="sy-mono" style={{ marginTop: 4 }}>
              {data.pendingCount} demandes · les plus anciennes en haut
            </div>
          </div>
          <Btn
            variant="ghost"
            size="sm"
            iconRight={<Icon name="arrow" size={14} />}
            onClick={onOpenValidation}
          >
            Tout traiter
          </Btn>
        </div>
        <ul className="ov-rows">
          {previewRows.map((a) => (
            <ValidationRow
              key={a.id}
              club={a}
              onReview={() => onReview(a.id)}
            />
          ))}
        </ul>
      </section>

      <style>{`
        .ov-root { padding: 24px 28px 80px; }
        .ov-head {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .ov-kpis {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        .ov-charts {
          margin-top: 16px;
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 16px;
          align-items: stretch;
        }
        .ov-chart-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .ov-table { margin-top: 16px; }
        .ov-table-head {
          padding: 16px 20px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
          border-bottom: 1px solid var(--line);
        }
        .ov-rows { list-style: none; margin: 0; padding: 0; }

        @media (max-width: 1180px) {
          .ov-kpis { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .ov-charts { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .ov-root { padding: 18px 16px 80px; }
          .ov-kpis { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: AdminKpi }) {
  const accent = kpi.accent;
  return (
    <div
      className="sy-card"
      style={{
        padding: 16,
        background: accent ? "var(--accent-soft)" : undefined,
        borderColor: accent ? "transparent" : undefined,
      }}
    >
      <div className="sy-mono" style={{ color: accent ? "var(--accent-deep)" : undefined }}>
        {kpi.label}
      </div>
      <div
        className="sy-num"
        style={{
          fontFamily: "var(--display)",
          fontWeight: 700,
          fontSize: 28,
          lineHeight: 1.05,
          marginTop: 10,
          fontVariationSettings: "var(--display-var)",
        }}
      >
        {kpi.value}
      </div>
      {kpi.delta && (
        <div
          className="sy-small sy-num"
          style={{
            marginTop: 4,
            color: accent
              ? "var(--accent-deep)"
              : kpi.deltaPositive
                ? "var(--success)"
                : "var(--ink-3)",
          }}
        >
          {kpi.deltaPositive && <span aria-hidden>↑ </span>}
          {kpi.delta}
        </div>
      )}
    </div>
  );
}

function ValidationRow({
  club,
  onReview,
}: {
  club: PendingClub;
  onReview: () => void;
}) {
  const chip = PENDING_STATUS_CHIP[club.status];
  const uploaded = club.docs.filter((d) => d.status === "uploaded").length;

  return (
    <li className="ov-row">
      <Avatar initials={club.initials} tone="ink" />
      <div className="ov-row-main" style={{ minWidth: 0 }}>
        <div className="sy-h4">{club.name}</div>
        <div className="sy-mono" style={{ marginTop: 2 }}>
          {club.sport} · {club.city} ({club.postalCode.slice(0, 2)})
        </div>
      </div>
      <div className="ov-row-docs sy-mono">{uploaded} pièce(s)</div>
      <div className="ov-row-status">
        <span className="sy-chip" style={{ background: chip.bg, color: chip.fg, fontWeight: 600 }}>
          {PENDING_STATUS_LABEL[club.status]}
        </span>
      </div>
      <div className="ov-row-when sy-mono">{club.submittedLabel}</div>
      <div className="ov-row-actions">
        <Btn variant="ghost" size="sm" onClick={onReview}>
          Examiner
        </Btn>
        <Btn variant="primary" size="sm" icon={<Icon name="check" size={14} color="#fff" />}>
          Valider
        </Btn>
      </div>

      <style>{`
        .ov-row {
          display: grid;
          grid-template-columns: 36px 1.8fr 1fr 0.9fr 0.8fr auto;
          gap: 14px; align-items: center;
          padding: 12px 20px;
          border-top: 1px solid var(--line);
        }
        .ov-row:first-child { border-top: none; }
        .ov-row:hover { background: var(--surface-2); }
        .ov-row-actions { display: flex; gap: 6px; justify-content: flex-end; }
        @media (max-width: 1180px) {
          .ov-row { grid-template-columns: 36px 1.6fr 0.9fr auto; }
          .ov-row-docs, .ov-row-when { display: none; }
        }
        @media (max-width: 600px) {
          .ov-row {
            grid-template-columns: 36px 1fr auto;
            grid-template-areas:
              "av main status"
              "av main actions";
            row-gap: 8px;
          }
          .ov-row-status { grid-area: status; justify-self: end; }
          .ov-row-actions { grid-area: actions; }
        }
      `}</style>
    </li>
  );
}
