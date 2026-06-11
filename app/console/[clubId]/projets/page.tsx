import { getProjects } from "@/lib/console/projects";
import { ProjectsView } from "@/components/console/projects-view";

type Props = { params: Promise<{ clubId: string }> };

export default async function ProjetsPage({ params }: Props) {
  const { clubId } = await params;
  const projects = await getProjects(clubId);

  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0, overflow: "hidden", height: "100%" }}>
      <ProjectsView projects={projects} />
    </div>
  );
}

// Lecture DB à la demande : pas de prerender au build (la DB n'est pas câblée).
export const dynamic = "force-dynamic";
