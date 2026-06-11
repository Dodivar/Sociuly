import { ReservationsView } from "@/components/console/reservations-view";
import { getReservations } from "@/lib/console/reservations.server";

type Props = { params: Promise<{ clubId: string }> };

export default async function ReservationsPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch DB scopé sur l'asso du club_admin (cf. SPEC §3 — Booking).
  const bookings = await getReservations(clubId);

  return <ReservationsView bookings={bookings} />;
}

// Lecture DB à la demande : pas de prerender au build (la DB n'est pas câblée).
export const dynamic = "force-dynamic";
