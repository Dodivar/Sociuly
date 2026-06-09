import { ReservationsView } from "@/components/console/reservations-view";
import { getReservations } from "@/lib/console/reservations";

type Props = { params: Promise<{ clubId: string }> };

export default async function ReservationsPage({ params }: Props) {
  const { clubId } = await params;
  // TODO(api): remplacer par un fetch DB scopé sur l'asso du club_admin (cf. SPEC §3 — Booking).
  const bookings = await getReservations(clubId);

  return <ReservationsView bookings={bookings} />;
}
