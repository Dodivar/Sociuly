// Graphiques de la console admin — SVG / flex sans dépendance externe
// (CLAUDE.md §1 interdit l'ajout d'une lib de charting). Approche barres
// reprise de components/console/funding-card.tsx.

import type { ChartSeries, CategoryBar } from "@/lib/admin/data";

// ─────── Area chart (CA / commissions / reversé) ───────

type AreaChartProps = {
  months: string[];
  series: ChartSeries[];
  activeId: ChartSeries["id"];
  height?: number;
};

const VB_W = 600;
const PAD_X = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;

export function AreaChart({ months, series, activeId, height = 150 }: AreaChartProps) {
  const active = series.find((s) => s.id === activeId) ?? series[0];
  // Aucune série (ex. build sans base / période sans donnée) : graphique vide.
  if (!active) {
    return (
      <svg
        role="img"
        aria-label="Aucune donnée disponible"
        viewBox={`0 0 ${VB_W} ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height, display: "block" }}
      />
    );
  }
  const max = Math.max(1, ...series.flatMap((s) => s.points));
  const n = active.points.length;
  const plotH = height - PAD_TOP - PAD_BOTTOM;

  const x = (i: number) =>
    PAD_X + (i * (VB_W - PAD_X * 2)) / Math.max(1, n - 1);
  const y = (v: number) => PAD_TOP + plotH - (v / max) * plotH;

  const line = (pts: number[]) =>
    pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const area = (pts: number[]) => {
    const base = PAD_TOP + plotH;
    return `${line(pts)} L${x(n - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`;
  };

  const gridY = [0.25, 0.5, 0.75, 1].map((f) => PAD_TOP + plotH - f * plotH);

  return (
    <svg
      role="img"
      aria-label={`Évolution ${active.label.toLowerCase()} sur ${n} mois`}
      viewBox={`0 0 ${VB_W} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height, display: "block" }}
    >
      <defs>
        <linearGradient id="ac-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {gridY.map((gy, i) => (
        <line
          key={i}
          x1={PAD_X}
          x2={VB_W - PAD_X}
          y1={gy}
          y2={gy}
          stroke="var(--line)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* séries inactives, en arrière-plan */}
      {series
        .filter((s) => s.id !== active.id)
        .map((s) => (
          <path
            key={s.id}
            d={line(s.points)}
            fill="none"
            stroke="var(--line-2)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        ))}

      {/* série active : aire + ligne + points */}
      <path d={area(active.points)} fill="url(#ac-fill)" stroke="none" />
      <path
        d={line(active.points)}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {active.points.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={2.5} fill="var(--accent)" />
      ))}

      {months.map((m, i) => (
        <text
          key={m}
          x={x(i)}
          y={height - 6}
          textAnchor="middle"
          fontFamily="var(--mono)"
          fontSize={10}
          fill="var(--ink-3)"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

// ─────── Bars chart (top catégories) ───────

type BarsChartProps = {
  items: CategoryBar[];
  height?: number;
};

export function BarsChart({ items, height = 150 }: BarsChartProps) {
  const max = Math.max(1, ...items.map((it) => it.valueEuros));

  return (
    <div
      role="img"
      aria-label={`Top formats par chiffre d'affaires : ${items
        .map((it) => `${it.label} ${it.valueEuros}€`)
        .join(", ")}`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height,
        }}
      >
        {items.map((it, i) => (
          <div
            key={it.category}
            title={`${it.label} · €${it.valueEuros.toLocaleString("fr-FR")}`}
            style={{
              flex: 1,
              minWidth: 0,
              height: `${Math.max(4, (it.valueEuros / max) * 100)}%`,
              background: i === 0 ? "var(--accent)" : "var(--primary)",
              opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.1),
              borderRadius: "6px 6px 2px 2px",
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {items.map((it) => (
          <div
            key={it.category}
            className="sy-mono"
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: "center",
              fontSize: 9,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {it.label}
          </div>
        ))}
      </div>
    </div>
  );
}
