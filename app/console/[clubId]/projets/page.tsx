import { getProjects } from "@/lib/console/mock-projects";
import { ProjectsView } from "@/components/console/projects-view";

type Props = { params: Promise<{ clubId: string }> };

export default async function ProjectsPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch Prisma (cf. SPEC §3 — entité Project).
  const projects = await getProjects(clubId);

  return <ProjectsView projects={projects} />;
}
