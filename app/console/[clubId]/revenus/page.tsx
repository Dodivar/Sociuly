import { RevenueView } from "@/components/console/revenue-view";
import { getRevenueData } from "@/lib/console/revenues.server";

type Props = { params: Promise<{ clubId: string }> };

export default async function RevenusPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch DB scopé sur le club du club_admin (cf. SPEC §4/§5).
  const data = await getRevenueData(clubId);

  return <RevenueView data={data} />;
}

// Lecture DB à la demande : pas de prerender au build (la DB n'est pas câblée).
export const dynamic = "force-dynamic";
