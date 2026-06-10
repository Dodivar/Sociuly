import Link from "next/link";
import { Icon } from "@/components/ds/icon";
import { ExperiencesList } from "@/components/console/experiences-list";
import { getExperiences } from "@/lib/console/experiences.server";

type Props = { params: Promise<{ clubId: string }> };

export default async function ExperiencesAdminPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch DB scopé sur le club du club_admin (cf. SPEC §4).
  const experiences = await getExperiences(clubId);

  const total = experiences.length;
  const published = experiences.filter((x) => x.status === "published").length;

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
          <h1 className="sy-h1" style={{ fontSize: 26 }}>Mes expériences</h1>
          <p className="sy-small sy-muted" style={{ marginTop: 2 }}>
            {total} expérience{total > 1 ? "s" : ""} · {published} publiée{published > 1 ? "s" : ""} sur la marketplace.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link
            href={`/console/${clubId}/experiences/nouvelle`}
            className="sy-btn sy-btn-primary"
          >
            <Icon name="plus" size={14} color="#fff" />
            Nouvelle expérience
          </Link>
        </div>
      </header>

      <div style={{ padding: "24px 32px" }}>
        <ExperiencesList clubId={clubId} experiences={experiences} />
      </div>
    </>
  );
}
