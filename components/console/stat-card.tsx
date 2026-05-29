import { Icon, type IconName } from "@/components/ds/icon";

export type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  icon: IconName;
};

export function StatCard({ label, value, delta, deltaPositive = true, icon }: StatCardProps) {
  return (
    <div className="sy-card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          aria-hidden
          style={{
            width: 32, height: 32, borderRadius: 9,
            background: "var(--primary-soft)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Icon name={icon} size={16} color="var(--primary)" />
        </div>
        <div className="sy-mono">{label}</div>
      </div>
      <div
        className="sy-num"
        style={{
          fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, lineHeight: 1.05,
          marginTop: 14, fontVariationSettings: "var(--display-var)",
        }}
      >
        {value}
      </div>
      {delta && (
        <div
          className="sy-small sy-num"
          style={{
            marginTop: 4,
            color: deltaPositive ? "var(--success)" : "var(--danger)",
          }}
        >
          <span aria-hidden>{deltaPositive ? "↑" : "↓"}</span> {delta} vs sem. dernière
        </div>
      )}
    </div>
  );
}
