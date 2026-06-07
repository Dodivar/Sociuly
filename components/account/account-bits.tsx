// Briques réutilisables de l'espace entreprise /compte (server-safe).

import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ds/icon";

export function StatusChip({ label, bg, fg, border }: { label: string; bg: string; fg: string; border?: string }) {
  return (
    <span
      className="sy-chip sy-chip-sm"
      style={{ background: bg, color: fg, fontWeight: 600, border: border ? `1px solid ${border}` : undefined }}
    >
      {label}
    </span>
  );
}

export function StatCard({ icon, label, value, hint }: { icon: IconName; label: string; value: string; hint?: string }) {
  return (
    <div className="sy-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 30, height: 30, borderRadius: 9, flex: "0 0 auto",
            background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name={icon} size={15} color="var(--primary)" />
        </span>
        <div className="sy-mono">{label}</div>
      </div>
      <div
        className="sy-num"
        style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 28, marginTop: 10, fontVariationSettings: "var(--display-var)" }}
      >
        {value}
      </div>
      {hint && <div className="sy-small sy-muted" style={{ marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

export function PanelCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="sy-card" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "16px 18px", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}
      >
        <h2 className="sy-h3">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}

export function EmptyState({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 20px", gap: 10 }}>
      <span
        aria-hidden
        style={{ width: 52, height: 52, borderRadius: 14, background: "var(--surface-2)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      >
        <Icon name={icon} size={22} color="var(--ink-3)" />
      </span>
      <h3 className="sy-h3">{title}</h3>
      <p className="sy-small sy-muted" style={{ maxWidth: 360 }}>{text}</p>
    </div>
  );
}
