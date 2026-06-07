import { QuotesView } from "@/components/console/quotes-view";
import { getQuotesForClub } from "@/lib/devis/quotes";

type Props = { params: Promise<{ clubId: string }> };

// Console club — demandes de devis entrantes & devis en cours (SPEC §6).
// TODO(api): remplacer par un fetch DB (Prisma) scopé sur le club du club_admin,
// réservé aux rôles manager/président (SPEC §4).
export default async function DevisPage({ params }: Props) {
  const { clubId } = await params;
  const quotes = await getQuotesForClub(clubId);

  return <QuotesView quotes={quotes} />;
}
