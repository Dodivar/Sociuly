import { Progress } from "@/components/ds/components";
import type { Project } from "@/lib/console/dashboard";

type Props = { project: Project };

export function FundingCard({ project }: Props) {
  const max = Math.max(1, ...project.spark);
  const progress = project.goal > 0 ? project.raised / project.goal : 0;

  return (
    <section className="sy-card" aria-label={`Financement ${project.name}`}>
      <div className="sy-mono">{project.name} · 14 derniers jours</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
        <div
          className="sy-num"
          style={{
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 30,
            fontVariationSettings: "var(--display-var)",
          }}
        >
          €{project.raised.toLocaleString("fr-FR")}
        </div>
        <div className="sy-mono" style={{ color: "var(--success)" }}>
          <span aria-hidden>↑</span> +€{project.weeklyDelta.toLocaleString("fr-FR")}
        </div>
      </div>

      <div
        role="img"
        aria-label={`Contributions ${project.spark.length} derniers jours, sommet ${max}€`}
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height: 140,
        }}
      >
        {project.spark.map((v, i) => {
          const recent = i >= project.spark.length - 3;
          const last = i === project.spark.length - 1;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${(v / max) * 100}%`,
                background: recent ? "var(--accent)" : "var(--primary)",
                borderRadius: 4,
                opacity: last ? 1 : recent ? 0.85 : 0.55,
              }}
            />
          );
        })}
      </div>

      <Progress value={progress} size="tall" style={{ marginTop: 16 }} />
      <div
        className="sy-small sy-num"
        style={{
          marginTop: 6, display: "flex", justifyContent: "space-between",
        }}
      >
        <span>{Math.round(progress * 100)}% atteint</span>
        <span style={{ color: "var(--accent-deep)" }}>reste {project.daysLeft}j</span>
      </div>
    </section>
  );
}
