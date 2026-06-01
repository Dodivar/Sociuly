import Link from "next/link";
import { Icon } from "@/components/ds/icon";
import { PrestationsList } from "@/components/console/prestations-list";
import { getPrestations } from "@/lib/console/mock-prestations";

type Props = { params: Promise<{ clubId: string }> };

export default async function PrestationsAdminPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch DB scope sur l'asso du club_admin (cf. SPEC §4).
  const prestations = await getPrestations(clubId);

  const total = prestations.length;
  const published = prestations.filter((p) => p.status === "published").length;

  return (
    <>
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
          <h1 className="sy-h1" style={{ fontSize: 26 }}>Mes prestations</h1>
          <p className="sy-small sy-muted" style={{ marginTop: 2 }}>
            {total} prestation{total > 1 ? "s" : ""} · {published} publiée{published > 1 ? "s" : ""} sur la marketplace.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href={`/console/${clubId}/prestations/nouvelle`}
            className="sy-btn sy-btn-primary"
          >
            <Icon name="plus" size={14} color="#fff" />
            Nouvelle prestation
          </Link>
        </div>
      </header>

      <div style={{ padding: "24px 32px" }}>
        <PrestationsList clubId={clubId} prestations={prestations} />
      </div>
    </>
  );
}
