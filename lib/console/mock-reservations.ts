// Cf. SPEC.md §3 — Booking · §5 — commission / annulation / versement.
// TODO(api): remplacer par un fetch DB (Prisma) scopé sur l'asso du club_admin.
// Garder la signature async, l'enum aligné sur le schéma et le calcul de commission.
//
// Les libellés de dates sont pré-formatés (FR) côté donnée pour éviter tout
// décalage de fuseau au rendu (le composant de vue est "use client").

export type BookingStatus =
  | "pending_payment"
  | "confirmed"
  | "cancelled_by_customer"
  | "cancelled_by_club"
  | "completed"
  | "refunded";

export type BookingLocation = "at_client" | "at_club" | "flexible";

export type BookingAdmin = {
  id: string;
  bookingNumber: string; // SOC-YYYY-NNNNN
  status: BookingStatus;

  // Prestation réservée
  prestationTitle: string;
  prestationSlug: string;

  // Client
  customerName: string;
  customerEmail: string;
  customerPhone?: string;

  // Créneau (pré-formaté)
  dateShort: string;   // "sam. 13 juin"
  dateLong: string;    // "samedi 13 juin 2026"
  timeRange: string;   // "16h00 – 19h00"
  durationMinutes: number;
  participants: number;

  // Lieu
  location: BookingLocation;
  addressForService?: string; // si location = at_client

  // Montants (cents, EUR) — commission Sociuly = 6 % du TTC (SPEC §5)
  grossAmountCents: number; // payé par le client
  feeAmountCents: number;   // commission Sociuly
  netAmountCents: number;   // versé au club = gross − fee

  // Projet financé (libellé lisible)
  projectTitle?: string;

  // Annulation / jalons (pré-formatés)
  cancellationDeadlineLabel?: string; // "6 juin 2026"
  createdAtLabel: string;             // "28 mai 2026"
  confirmedAtLabel?: string;
  completedAtLabel?: string;
  resolutionLabel?: string;           // annulations / remboursements

  // Message laissé par le client
  customerNotes?: string;
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending_payment: "À valider",
  confirmed: "Confirmée",
  completed: "Terminée",
  cancelled_by_customer: "Annulée · client",
  cancelled_by_club: "Annulée · club",
  refunded: "Remboursée",
};

export const LOCATION_LABEL: Record<BookingLocation, string> = {
  at_client: "Chez le client",
  at_club: "Au club",
  flexible: "Flexible",
};

// SPEC §5 — commission 6 % du TTC, montants en cents.
function withCommission(grossCents: number) {
  const feeAmountCents = Math.round(grossCents * 0.06);
  return {
    grossAmountCents: grossCents,
    feeAmountCents,
    netAmountCents: grossCents - feeAmountCents,
  };
}

const BOOKINGS: BookingAdmin[] = [
  {
    id: "b42",
    bookingNumber: "SOC-2026-00042",
    status: "pending_payment",
    prestationTitle: "Barbecue convivial",
    prestationSlug: "barbecue-convivial",
    customerName: "Camille Léger",
    customerEmail: "camille.l@example.com",
    customerPhone: "06 12 34 56 78",
    dateShort: "sam. 13 juin",
    dateLong: "samedi 13 juin 2026",
    timeRange: "16h00 – 19h00",
    durationMinutes: 180,
    participants: 24,
    location: "at_client",
    addressForService: "12 rue de Vannes, 35000 Rennes",
    ...withCommission(28000),
    projectTitle: "Tournoi U17",
    cancellationDeadlineLabel: "6 juin 2026",
    createdAtLabel: "28 mai 2026",
    customerNotes:
      "Bonjour, c'est pour l'anniversaire de mon père (65 ans). On sera plutôt 22 adultes + 2 enfants. Pas d'allergies, mais on aimerait des merguez et des saucisses végé.",
  },
  {
    id: "b41",
    bookingNumber: "SOC-2026-00041",
    status: "confirmed",
    prestationTitle: "Olympiades inter-classes",
    prestationSlug: "olympiades-inter-classes",
    customerName: "Lycée Bréquigny",
    customerEmail: "contact@lycee-brequigny.fr",
    dateShort: "sam. 20 juin",
    dateLong: "samedi 20 juin 2026",
    timeRange: "14h00 – 17h00",
    durationMinutes: 180,
    participants: 80,
    location: "flexible",
    ...withCommission(72000),
    projectTitle: "Tournoi U17",
    cancellationDeadlineLabel: "13 juin 2026",
    createdAtLabel: "22 mai 2026",
    confirmedAtLabel: "26 mai 2026",
    customerNotes:
      "Journée d'intégration des secondes. Prévoir un parcours adapté aux groupes de 8.",
  },
  {
    id: "b40",
    bookingNumber: "SOC-2026-00040",
    status: "confirmed",
    prestationTitle: "Anniversaire enfant",
    prestationSlug: "anniversaire-enfant",
    customerName: "Famille Dupuy",
    customerEmail: "dupuy.famille@example.com",
    customerPhone: "06 98 76 54 32",
    dateShort: "sam. 27 juin",
    dateLong: "samedi 27 juin 2026",
    timeRange: "11h00 – 14h00",
    durationMinutes: 180,
    participants: 18,
    location: "at_client",
    addressForService: "8 allée des Tilleuls, 35700 Rennes",
    ...withCommission(18000),
    projectTitle: "Maillots de saison",
    cancellationDeadlineLabel: "20 juin 2026",
    createdAtLabel: "19 mai 2026",
    confirmedAtLabel: "24 mai 2026",
  },
  {
    id: "b39",
    bookingNumber: "SOC-2026-00039",
    status: "confirmed",
    prestationTitle: "Buvette fête de quartier",
    prestationSlug: "buvette-fete-de-quartier",
    customerName: "Mairie de Rennes",
    customerEmail: "evenementiel@ville-rennes.fr",
    customerPhone: "02 99 00 00 00",
    dateShort: "sam. 4 juil.",
    dateLong: "samedi 4 juillet 2026",
    timeRange: "18h00 – 22h00",
    durationMinutes: 240,
    participants: 120,
    location: "at_client",
    addressForService: "Place de la Mairie, 35000 Rennes",
    ...withCommission(35000),
    projectTitle: "Rénovation vestiaires",
    cancellationDeadlineLabel: "27 juin 2026",
    createdAtLabel: "18 mai 2026",
    confirmedAtLabel: "20 mai 2026",
  },
  {
    id: "b35",
    bookingNumber: "SOC-2026-00035",
    status: "completed",
    prestationTitle: "Olympiades inter-classes",
    prestationSlug: "olympiades-inter-classes",
    customerName: "CE Orange Grand Ouest",
    customerEmail: "ce.grandouest@example.com",
    dateShort: "sam. 16 mai",
    dateLong: "samedi 16 mai 2026",
    timeRange: "10h00 – 13h00",
    durationMinutes: 180,
    participants: 60,
    location: "at_club",
    ...withCommission(72000),
    projectTitle: "Tournoi U17",
    createdAtLabel: "28 avr. 2026",
    confirmedAtLabel: "2 mai 2026",
    completedAtLabel: "16 mai 2026",
    resolutionLabel: "Versé le 17 mai 2026",
  },
  {
    id: "b31",
    bookingNumber: "SOC-2026-00031",
    status: "completed",
    prestationTitle: "Barbecue convivial",
    prestationSlug: "barbecue-convivial",
    customerName: "Famille Wagner",
    customerEmail: "wagner@example.com",
    customerPhone: "06 11 22 33 44",
    dateShort: "sam. 2 mai",
    dateLong: "samedi 2 mai 2026",
    timeRange: "12h00 – 15h00",
    durationMinutes: 180,
    participants: 20,
    location: "at_client",
    addressForService: "3 rue du Stade, 35510 Cesson-Sévigné",
    ...withCommission(28000),
    projectTitle: "Maillots de saison",
    createdAtLabel: "14 avr. 2026",
    confirmedAtLabel: "18 avr. 2026",
    completedAtLabel: "2 mai 2026",
    resolutionLabel: "Versé le 3 mai 2026 · avis 5★ laissé",
  },
  {
    id: "b28",
    bookingNumber: "SOC-2026-00028",
    status: "cancelled_by_customer",
    prestationTitle: "Buvette fête de quartier",
    prestationSlug: "buvette-fete-de-quartier",
    customerName: "Amicale de Bréquigny",
    customerEmail: "amicale@example.com",
    dateShort: "sam. 30 mai",
    dateLong: "samedi 30 mai 2026",
    timeRange: "17h00 – 21h00",
    durationMinutes: 240,
    participants: 90,
    location: "at_client",
    addressForService: "Square de Bréquigny, 35200 Rennes",
    ...withCommission(35000),
    projectTitle: "Rénovation vestiaires",
    createdAtLabel: "5 mai 2026",
    confirmedAtLabel: "8 mai 2026",
    resolutionLabel: "Annulée le 26 mai 2026 (après J−7) — avoir d'1 an émis chez le club",
  },
  {
    id: "b24",
    bookingNumber: "SOC-2026-00024",
    status: "cancelled_by_club",
    prestationTitle: "Soirée club-house",
    prestationSlug: "soiree-club-house",
    customerName: "Association Léo Lagrange",
    customerEmail: "contact@leolagrange35.org",
    dateShort: "sam. 9 mai",
    dateLong: "samedi 9 mai 2026",
    timeRange: "19h00 – 23h00",
    durationMinutes: 240,
    participants: 40,
    location: "at_club",
    ...withCommission(48000),
    projectTitle: "Tournoi U17",
    createdAtLabel: "20 avr. 2026",
    confirmedAtLabel: "23 avr. 2026",
    resolutionLabel: "Annulée par le club le 4 mai 2026 — remboursement intégral",
  },
  {
    id: "b19",
    bookingNumber: "SOC-2026-00019",
    status: "refunded",
    prestationTitle: "Tournoi 3v3 jeunes",
    prestationSlug: "tournoi-3v3-jeunes",
    customerName: "Entreprise Decathlon Rennes",
    customerEmail: "events.rennes@decathlon.example",
    dateShort: "sam. 25 avr.",
    dateLong: "samedi 25 avril 2026",
    timeRange: "9h00 – 15h00",
    durationMinutes: 360,
    participants: 60,
    location: "at_club",
    ...withCommission(95000),
    projectTitle: "Rénovation vestiaires",
    createdAtLabel: "2 avr. 2026",
    confirmedAtLabel: "5 avr. 2026",
    resolutionLabel: "Remboursée le 20 avr. 2026",
  },
];

export async function getReservations(_clubId: string): Promise<BookingAdmin[]> {
  return BOOKINGS;
}
