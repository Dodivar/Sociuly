import { Fragment } from "react";
import { Icon } from "@/components/ds/icon";

type StepState = "done" | "active" | "upcoming";

const COLORS: Record<StepState, { bg: string; fg: string; bd: string }> = {
  done:     { bg: "var(--primary)",  fg: "#fff",           bd: "var(--primary)" },
  active:   { bg: "var(--ink)",      fg: "var(--surface)", bd: "var(--ink)" },
  upcoming: { bg: "var(--surface)",  fg: "var(--ink-3)",   bd: "var(--line-2)" },
};

function StepDot({
  n, label, state, onClick,
}: {
  n: number;
  label: string;
  state: StepState;
  onClick?: () => void;
}) {
  const c = COLORS[state];
  const clickable = !!onClick;
  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 10,
        cursor: clickable ? "pointer" : "default",
      }}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Revenir à l'étape ${label}` : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick!(); } } : undefined}
    >
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

/**
 * Stepper du tunnel de réservation.
 * `active` = index 0-based de l'étape courante (Détails=0 … Confirmation=3).
 * `reachable` + `onStepClick` (optionnels) rendent les pastilles déjà franchies
 * cliquables pour revenir en arrière sans casser l'usage statique (page de
 * confirmation), qui n'en passe aucun.
 */
export function BookingStepper({
  active = 1,
  reachable,
  onStepClick,
}: {
  active?: number;
  reachable?: number;
  onStepClick?: (index: number) => void;
}) {
  const steps = ["Détails", "Coordonnées", "Acompte", "Confirmation"];
  const maxReachable = reachable ?? active;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, flex: 1, maxWidth: 720 }}>
      {steps.map((s, i) => {
        const state: StepState = i < active ? "done" : i === active ? "active" : "upcoming";
        // Navigable uniquement vers une étape déjà franchie (jamais en avant).
        const canClick = !!onStepClick && i <= maxReachable && i !== active;
        return (
          <Fragment key={s}>
            <StepDot
              n={i + 1}
              label={s}
              state={state}
              onClick={canClick ? () => onStepClick!(i) : undefined}
            />
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
