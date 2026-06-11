import { notFound } from "next/navigation";
import { SiteFooter, TopNav } from "@/components/ds/patterns";
import { QuoteRequestForm, type QuoteRequestClub } from "@/components/devis/quote-request-form";
import { getClubBySlug } from "@/lib/clubs/club-detail.server";

// Demande de devis SUR MESURE depuis un club — /clubs/[slug]/devis (SPEC §4/§6).
// Même parcours B2B que /experiences/[slug]/devis, mais sans expérience pré-définie :
// le Quote sera créé avec experienceId = null (SPEC §3). L'entreprise décrit son
// projet (date / effectif / format / budget libres) et le club renvoie un devis ferme.

type Props = { params: Promise<{ slug: string }> };

export default async function ClubCustomQuotePage({ params }: Props) {
  const { slug } = await params;
  const detail = await getClubBySlug(slug);
  if (!detail) notFound();

  const club: QuoteRequestClub = {
    slug: detail.slug,
    name: detail.name,
    cityLabel: detail.cityLabel,
    venueLabel: `${detail.name} · ${detail.cityLabel}`,
  };

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav />
      <QuoteRequestForm club={club} />
      <SiteFooter />
    </main>
  );
}
