import { notFound } from "next/navigation";
import { getExperienceBySlug } from "@/lib/marketplace/experience-detail";
import { BookingTunnel } from "@/components/booking/booking-tunnel";
import type { BookingExperience } from "@/lib/booking/tunnel";

// Tunnel de réservation /reserver/[ref] (SPEC §6).
// `ref` = slug de l'expérience en v1 (transmis par le rail « Demander un devis »).
// La page est un Server Component fin : elle récupère l'expérience, lit la
// présélection (date / créneau / participants) passée en query par le rail, puis
// délègue toute l'interactivité au Client Component <BookingTunnel>.

type Props = {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ date?: string; heure?: string; participants?: string }>;
};

export default async function BookingPage({ params, searchParams }: Props) {
  const { ref } = await params;
  const sp = await searchParams;

  const detail = await getExperienceBySlug(ref);
  if (!detail) notFound();

  // Présélection du créneau : on mappe la date/heure de la query sur l'index du
  // créneau correspondant (sinon premier créneau disponible).
  let slotIdx = detail.slots.findIndex(
    (s) => s.date === sp.date && (!sp.heure || s.time === sp.heure),
  );
  if (slotIdx < 0) slotIdx = 0;

  // Effectif présélectionné, borné à la capacité de l'expérience.
  const requested = Number(sp.participants);
  const participants = Number.isFinite(requested) && requested > 0
    ? Math.min(detail.capacityMax, Math.max(detail.capacityMin, Math.round(requested)))
    : Math.min(Math.max(detail.capacityMin, 20), detail.capacityMax);

  const experience: BookingExperience = {
    ref,
    slug: detail.slug,
    title: detail.title,
    clubName: detail.club.name,
    cityLabel: detail.cityLabel,
    venueLabel: detail.venueLabel,
    rating: detail.rating,
    reviewCount: detail.reviewCount,
    hue: detail.hue,
    location: detail.location,
    format: detail.format,
    capacityMin: detail.capacityMin,
    capacityMax: detail.capacityMax,
    priceModel: detail.priceModel,
    pricePerPersonCents: detail.pricePerPersonCents,
    basePriceCents: detail.basePriceCents,
    projectTitle: detail.project.title,
    slots: detail.slots,
  };

  return <BookingTunnel experience={experience} initial={{ slotIdx, participants }} />;
}
