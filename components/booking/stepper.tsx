import { Fragment } from "react";
import { Icon } from "@/components/ds/icon";

type StepState = "done" | "active" | "upcoming";

const COLORS: Record<StepState, { bg: string; fg: string; bd: string }> = {
  done:     { bg: "var(--primary)",  fg: "#fff",           bd: "var(--primary)" },
  active:   { bg: "var(--ink)",      fg: "var(--surface)", bd: "var(--ink)" },
  upcoming: { bg: "var(--surface)",  fg: "var(--ink-3)",   bd: "var(--line-2)" },
};

function StepDot({ n, label, state }: { n: number; label: string; state: StepState }) {
  const c = COLORS[state];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: 28, height: 28, borderRadius: "50%",
          background: c.bg, color: c.fg, border: `1.5px solid ${c.bd}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--sans)", fontWeight: 700, fontSize: 13,
        }}
      >
        {state === "done" ? <Icon name="check" size={14} color="#fff" /> : n}
      </div>
      <div
        className="sy-small"
        style={{
          fontWeight: state === "active" ? 600 : 500,
          color: state === "upcoming" ? "var(--ink-3)" : "var(--ink)",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export function BookingStepper({ active = 1 }: { active?: number }) {
  const steps = ["Détails", "Coordonnées", "Acompte", "Confirmation"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, flex: 1, maxWidth: 720 }}>
      {steps.map((s, i) => {
        const state: StepState = i < active ? "done" : i === active ? "active" : "upcoming";
        return (
          <Fragment key={s}>
            <StepDot n={i + 1} label={s} state={state} />
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1, height: 1.5,
                  background: i < active ? "var(--primary)" : "var(--line-2)",
                }}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
