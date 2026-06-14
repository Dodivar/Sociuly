import { notFound, redirect } from "next/navigation";
import { getExperienceBySlug } from "@/lib/marketplace/experience-detail.server";
import { BookingTunnel } from "@/components/booking/booking-tunnel";
import type { BookingExperience } from "@/lib/booking/tunnel";
import { requireRole } from "@/lib/auth/rbac";
import { getQuoteByBookingRef, quoteAmounts, frDateShort } from "@/lib/devis/quotes.server";

// Paiement de l'acompte /reserver/[ref] (SPEC §4/§6).
// `ref` = bookingNumber (SOC-YYYY-NNNNN) d'un devis ACCEPTÉ.
//
// GARDE (SPEC §4) : on n'accède au paiement qu'après acceptation d'un devis.
// On résout le devis accepté correspondant ; sinon redirection. Les détails
// (date, effectif, lieu, montant) sont VERROUILLÉS sur le devis accepté — ils ne
// sont plus modifiables ici (sinon le prix divergerait du devis contractualisé).
// TODO(api): garde d'auth (org_buyer de l'Organization) + résolution Prisma.

type Props = {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ slug?: string }>;
};

export default async function BookingPage({ params }: Props) {
  const { ref } = await params;
  // Garde RBAC : paiement réservé au rôle org_buyer (SPEC §6).
  await requireRole(["org_buyer"], `/reserver/${ref}`);

  // 1. Le devis doit exister ET être accepté (sinon pas de paiement possible).
  const quote = await getQuoteByBookingRef(ref);
  if (!quote) redirect("/experiences");

  // 2. Expérience associée (source du visuel / capacité / créneaux).
  const detail = await getExperienceBySlug(quote.experienceSlug);
  if (!detail) notFound();

  // 3. Créneau verrouillé = date/heure du devis (sinon premier créneau).
  let slotIdx = detail.slots.findIndex(
    (s) => s.date === quote.requestedDateISO && (!quote.requestedTime || s.time === quote.requestedTime),
  );
  if (slotIdx < 0) slotIdx = 0;

  // 4. Montant ferme issu du devis (prime toute estimation recalculée).
  const { amountTTCCents } = quoteAmounts(quote.lines, quote.clubVatLiable);

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

  return (
    <BookingTunnel
      experience={experience}
      initial={{ slotIdx, participants: quote.participants }}
      locked
      lockedTotalCents={amountTTCCents}
      quoteNumber={quote.quoteNumber}
      lockedPlace={quote.addressForService ?? detail.venueLabel}
      lockedSlotText={`${frDateShort(quote.requestedDateISO)}${quote.requestedTime ? ` · ${quote.requestedTime.replace(":", "h")}` : ""}`}
      initialContact={{
        companyName: quote.organizationName,
        contactName: quote.contactName,
        contactEmail: quote.contactEmail,
        phone: quote.contactPhone ?? "",
      }}
    />
  );
}
