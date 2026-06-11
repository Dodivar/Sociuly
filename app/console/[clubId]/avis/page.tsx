import { ReviewsView } from "@/components/console/reviews-view";
import { getReviewsData } from "@/lib/console/reviews.server";

type Props = { params: Promise<{ clubId: string }> };

export default async function AvisPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch DB scopé sur le club du club_admin (cf. SPEC §4/§5).
  const data = await getReviewsData(clubId);

  return <ReviewsView data={data} />;
}

// Lecture DB à la demande : pas de prerender au build (la DB n'est pas câblée).
export const dynamic = "force-dynamic";
