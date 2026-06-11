import { notFound } from "next/navigation";
import { SiteFooter, TopNav } from "@/components/ds/patterns";
import { QuoteRequestForm, type QuoteRequestClub, type QuoteRequestExperience } from "@/components/devis/quote-request-form";
import { getExperienceBySlug } from "@/lib/marketplace/experience-detail.server";

// Demande de devis depuis une expérience — /experiences/[slug]/devis (SPEC §4/§6).
// Entrée du parcours B2B : remplace l'ancien accès direct au paiement. Le rail
// « Demander un devis » transmet date / heure / participants en présélection.

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string; heure?: string; participants?: string }>;
};

export default async function ExperienceQuotePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const detail = await getExperienceBySlug(slug);
  if (!detail) notFound();

  // Présélection du créneau (sinon premier disponible).
  let slotIdx = detail.slots.findIndex((s) => s.date === sp.date && (!sp.heure || s.time === sp.heure));
  if (slotIdx < 0) slotIdx = 0;

  const requested = Number(sp.participants);
  const participants = Number.isFinite(requested) && requested > 0
    ? Math.min(detail.capacityMax, Math.max(detail.capacityMin, Math.round(requested)))
    : Math.min(Math.max(detail.capacityMin, 20), detail.capacityMax);

  const experience: QuoteRequestExperience = {
    slug: detail.slug,
    title: detail.title,
    clubName: detail.club.name,
    cityLabel: detail.cityLabel,
    venueLabel: detail.venueLabel,
    location: detail.location,
    format: detail.format,
    capacityMin: detail.capacityMin,
    capacityMax: detail.capacityMax,
    priceModel: detail.priceModel,
    pricePerPersonCents: detail.pricePerPersonCents,
    basePriceCents: detail.basePriceCents,
    slots: detail.slots,
    projectTitle: detail.project.title,
  };

  const club: QuoteRequestClub = {
    slug: detail.club.slug,
    name: detail.club.name,
    cityLabel: detail.cityLabel,
    venueLabel: detail.venueLabel,
  };

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav />
      <QuoteRequestForm club={club} experience={experience} initial={{ slotIdx, participants }} />
      <SiteFooter />
    </main>
  );
}
