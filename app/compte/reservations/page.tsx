import { PanelCard } from "@/components/account/account-bits";
import { BookingRows } from "@/components/account/org-lists";
import { getOrgBookings } from "@/lib/account/org";

// Réservations de l'entreprise — /compte/reservations (SPEC §6).
export default async function CompteReservationsPage() {
  const bookings = await getOrgBookings();

  return (
    <PanelCard title="Vos réservations">
      <BookingRows bookings={bookings} />
    </PanelCard>
  );
}

// Lecture DB à la demande : pas de prerender au build (la DB n'est pas câblée).
export const dynamic = "force-dynamic";
