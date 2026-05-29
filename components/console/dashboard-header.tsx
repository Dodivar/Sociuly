import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

type Props = {
  greeting: string;
  summary: string;
};

export function DashboardHeader({ greeting, summary }: Props) {
  return (
    <header
      style={{
        padding: "20px 32px",
        borderBottom: "1px solid var(--line)",
        background: "var(--surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1 className="sy-h1" style={{ fontSize: 26 }}>{greeting}</h1>
        <p className="sy-small sy-muted" style={{ marginTop: 2 }}>{summary}</p>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn variant="outline" icon={<Icon name="upload" size={14} />}>Exporter</Btn>
        <Btn variant="primary" icon={<Icon name="plus" size={14} color="#fff" />}>
          Nouvelle prestation
        </Btn>
      </div>
    </header>
  );
}
