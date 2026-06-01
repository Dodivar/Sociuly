import { getProjects } from "@/lib/console/mock-projects";
import { ProjectsView } from "@/components/console/projects-view";

type Props = { params: Promise<{ clubId: string }> };

<<<<<<< HEAD
export default async function ProjectsPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch Prisma (cf. SPEC §3 — entité Project).
  const projects = await getProjects(clubId);

  return <ProjectsView projects={projects} />;
=======
export default async function ProjetsPage({ params }: Props) {
  const { clubId } = await params;
  const projects = await getProjects(clubId);

  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0, overflow: "hidden", height: "100%" }}>
      <ProjectsView projects={projects} />
    </div>
  );
>>>>>>> e82c7c61783bbc408216ebbc5e45947e667bc44b
}
