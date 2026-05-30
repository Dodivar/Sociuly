import { Icon } from "@/components/ds/icon";

const STEPS = [
  { num: 1, label: "Association" },
  { num: 2, label: "Contact" },
  { num: 3, label: "Documents" },
  { num: 4, label: "Compte bancaire" },
];

export default function InscriptionStepper({ current }: { current: number }) {
  return (
    <div style={{ width: "100%", maxWidth: 560, marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        {STEPS.map((step, i) => {
          const done = step.num < current;
          const active = step.num === current;
          return (
            <div key={step.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 1 }}>
              {/* connector line left */}
              {i > 0 && (
                <div style={{
                  position: "absolute",
                  top: 17,
                  right: "50%",
                  left: "-50%",
                  height: 2,
                  background: done || active ? "var(--accent)" : "var(--line-2)",
                  zIndex: 0,
                }} />
              )}

              {/* circle */}
              <div style={{
                width: 34, height: 34,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: active ? "none" : done ? "none" : "2px solid var(--line-2)",
                background: active ? "var(--accent)" : done ? "var(--primary-soft)" : "var(--surface)",
                color: active ? "#fff" : done ? "var(--primary-deep)" : "var(--ink-3)",
                fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14,
                boxShadow: active ? "0 0 0 4px var(--primary-soft)" : "none",
                transition: "all .2s ease",
                position: "relative", zIndex: 1,
              }}>
                {done
                  ? <Icon name="check" size={16} color="var(--primary-deep)" />
                  : step.num}
              </div>

              {/* label */}
              <span style={{
                marginTop: 8,
                fontFamily: "var(--mono)", fontSize: 10, letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: active ? "var(--ink)" : done ? "var(--ink-2)" : "var(--ink-3)",
                fontWeight: active ? 700 : 500,
                whiteSpace: "nowrap",
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
