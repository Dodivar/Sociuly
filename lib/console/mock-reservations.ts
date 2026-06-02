// Cf. SPEC.md §3 — Booking · §4/§5 — commission / acompte / annulation / versement.
// TODO(api): remplacer par un fetch DB (Prisma) scopé sur le club du club_admin.
// Garder la signature async, l'enum aligné sur le schéma et le calcul de commission.
//
// Les libellés de dates sont pré-formatés (FR) côté donnée pour éviter tout
// décalage de fuseau au rendu (le composant de vue est "use client").

// SPEC §3 — machine d'état complète du Booking B2B.
export type BookingStatus =
  | "pending_quote"
  | "quote_accepted"
  | "deposit_paid"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled_by_org"
  | "cancelled_by_club"
  | "refunded";

export type BookingLocation = "at_client" | "at_club" | "at_venue" | "flexible";

export type BookingAdmin = {
  id: string;
  bookingNumber: string; // SOC-YYYY-NNNNN
  status: BookingStatus;

  // Expérience commandée
  experienceTitle: string;
  experienceSlug: string;

  // Entreprise acheteuse (org_buyer) + contact référent
  organizationName: string;
  organizationEmail: string;
  contactName: string;
  contactPhone?: string;

  // Créneau (pré-formaté)
  dateShort: string;   // "lun. 16 juin"
  dateLong: string;    // "lundi 16 juin 2026"
  timeRange: string;   // "09h00 – 17h00"
  durationMinutes: number;
  participants: number;

  // Lieu
  location: BookingLocation;
  addressForService?: string; // si location = at_client

  // Montants (cents, EUR) — commission Sociuly = 6 % du TTC (SPEC §5), acompte 30 % (SPEC §4/§11)
  grossAmountTTCCents: number; // TTC payé par l'entreprise
  feeAmountCents: number;      // commission Sociuly (6 % du TTC)
  netAmountCents: number;      // versé au club = TTC − commission
  depositCents: number;        // acompte (30 % du TTC)

  // Projet financé (libellé lisible)
  projectTitle?: string;

  // Annulation / jalons (pré-formatés)
  cancellationDeadlineLabel?: string; // "9 juin 2026"
  createdAtLabel: string;             // "28 mai 2026"
  confirmedAtLabel?: string;
  completedAtLabel?: string;
  resolutionLabel?: string;           // annulations / remboursements

  // Message laissé par l'entreprise
  organizationNotes?: string;
};

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending_quote: "Devis à envoyer",
  quote_accepted: "Devis accepté",
  deposit_paid: "Acompte versé",
  confirmed: "Confirmée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled_by_org: "Annulée · entreprise",
  cancelled_by_club: "Annulée · club",
  refunded: "Remboursée",
};

export const LOCATION_LABEL: Record<BookingLocation, string> = {
  at_client: "Dans l'entreprise",
  at_club: "Au club",
  at_venue: "Sur le site (Arena)",
  flexible: "Flexible",
};

// SPEC §5 — commission 6 % du TTC ; SPEC §4 — acompte par défaut 30 %. Montants en cents.
//
// TODO(§11) — décomposition HT / TVA / TTC : la base TVA dépend de Club.vatLiable
// (club pro assujetti vs loi 1901 exonéré) ET du traitement de la TVA sur la commission
// Sociuly. Décision comptable OUVERTE — ne PAS figer de taux ici. On expose le TTC payé,
// l'acompte et le solde ; la ventilation HT/TVA proviendra de la facture (§11).
function withAmounts(grossTTCCents: number) {
  const feeAmountCents = Math.round(grossTTCCents * 0.06);
  const depositCents = Math.round(grossTTCCents * 0.3);
  return {
    grossAmountTTCCents: grossTTCCents,
    feeAmountCents,
    netAmountCents: grossTTCCents - feeAmountCents,
    depositCents,
  };
}

const BOOKINGS: BookingAdmin[] = [
  {
    id: "b42",
    bookingNumber: "SOC-2026-00042",
    status: "deposit_paid",
    experienceTitle: "Journée immersion · SIG",
    experienceSlug: "journee-immersion-sig",
    organizationName: "Klaxoon SAS",
    organizationEmail: "seminaires@klaxoon.example",
    contactName: "Camille Léger · Office Manager",
    contactPhone: "06 12 34 56 78",
    dateShort: "lun. 16 juin",
    dateLong: "lundi 16 juin 2026",
    timeRange: "09h00 – 17h00",
    durationMinutes: 360,
    participants: 40,
    location: "at_venue",
    ...withAmounts(480000),
    projectTitle: "École de jeunes U17",
    cancellationDeadlineLabel: "9 juin 2026",
    createdAtLabel: "26 mai 2026",
    confirmedAtLabel: "28 mai 2026",
    organizationNotes:
      "Bonjour, c'est pour notre séminaire annuel d'équipe. Nous serons 40 collaborateurs (dont 6 à mobilité réduite). Prévoir une salle au calme pour le débrief de l'après-midi si possible. Merci !",
  },
  {
    id: "b41",
    bookingNumber: "SOC-2026-00041",
    status: "confirmed",
    experienceTitle: "Match VIP & hospitalités",
    experienceSlug: "match-vip-hospitalites",
    organizationName: "Lohr Group",
    organizationEmail: "evenementiel@lohr.example",
    contactName: "Thomas Berger · Responsable RH",
    contactPhone: "06 98 76 54 32",
    dateShort: "mar. 23 juin",
    dateLong: "mardi 23 juin 2026",
    timeRange: "18h00 – 22h00",
    durationMinutes: 240,
    participants: 30,
    location: "at_venue",
    ...withAmounts(240000),
    projectTitle: "Mini-bus du club",
    cancellationDeadlineLabel: "16 juin 2026",
    createdAtLabel: "20 mai 2026",
    confirmedAtLabel: "24 mai 2026",
    organizationNotes:
      "Soirée de fin d'année pour l'équipe commerciale. Merci de prévoir un cocktail dînatoire et l'accès aux loges.",
  },
  {
    id: "b40",
    bookingNumber: "SOC-2026-00040",
    status: "quote_accepted",
    experienceTitle: "Atelier cohésion d'équipe",
    experienceSlug: "atelier-cohesion-equipe",
    organizationName: "Caisse d'Épargne Grand Est",
    organizationEmail: "rh.grandest@ce.example",
    contactName: "Sophie Marchal · DRH",
    dateShort: "sam. 27 juin",
    dateLong: "samedi 27 juin 2026",
    timeRange: "14h00 – 17h00",
    durationMinutes: 180,
    participants: 24,
    location: "at_client",
    addressForService: "1 place du Corbeau, 67000 Strasbourg",
    ...withAmounts(120000),
    projectTitle: "Maillots saison",
    cancellationDeadlineLabel: "20 juin 2026",
    createdAtLabel: "22 mai 2026",
    organizationNotes:
      "Atelier d'intégration des nouveaux conseillers. Groupes de 8 idéalement, format dynamique.",
  },
  {
    id: "b39",
    bookingNumber: "SOC-2026-00039",
    status: "confirmed",
    experienceTitle: "Initiation basket encadrée",
    experienceSlug: "initiation-basket-encadree",
    organizationName: "Decathlon Campus",
    organizationEmail: "events.campus@decathlon.example",
    contactName: "Adrien Klein · People Ops",
    contactPhone: "06 11 22 33 44",
    dateShort: "sam. 4 juil.",
    dateLong: "samedi 4 juillet 2026",
    timeRange: "10h00 – 13h00",
    durationMinutes: 150,
    participants: 36,
    location: "at_club",
    ...withAmounts(90000),
    projectTitle: "Tournoi U17",
    cancellationDeadlineLabel: "27 juin 2026",
    createdAtLabel: "18 mai 2026",
    confirmedAtLabel: "20 mai 2026",
  },
  {
    id: "b38",
    bookingNumber: "SOC-2026-00038",
    status: "in_progress",
    experienceTitle: "Séminaire sur mesure",
    experienceSlug: "seminaire-sur-mesure",
    organizationName: "Saint-Gobain PAM",
    organizationEmail: "seminaire@saint-gobain-pam.example",
    contactName: "Nadia Schmitt · Head of People",
    contactPhone: "06 44 55 66 77",
    dateShort: "mar. 2 juin",
    dateLong: "mardi 2 juin 2026",
    timeRange: "09h00 – 17h00",
    durationMinutes: 480,
    participants: 60,
    location: "at_venue",
    ...withAmounts(350000),
    projectTitle: "École de jeunes U17",
    createdAtLabel: "5 mai 2026",
    confirmedAtLabel: "9 mai 2026",
  },
  {
    id: "b35",
    bookingNumber: "SOC-2026-00035",
    status: "completed",
    experienceTitle: "Atelier cohésion d'équipe",
    experienceSlug: "atelier-cohesion-equipe",
    organizationName: "Électricité de Strasbourg",
    organizationEmail: "rh@es.example",
    contactName: "Julien Faivre · Office Manager",
    dateShort: "ven. 16 mai",
    dateLong: "vendredi 16 mai 2026",
    timeRange: "14h00 – 17h00",
    durationMinutes: 180,
    participants: 28,
    location: "at_club",
    ...withAmounts(120000),
    projectTitle: "École de jeunes U17",
    createdAtLabel: "28 avr. 2026",
    confirmedAtLabel: "2 mai 2026",
    completedAtLabel: "16 mai 2026",
    resolutionLabel: "Versé le 17 mai 2026",
  },
  {
    id: "b31",
    bookingNumber: "SOC-2026-00031",
    status: "completed",
    experienceTitle: "Journée immersion · SIG",
    experienceSlug: "journee-immersion-sig",
    organizationName: "Brasseries Kronenbourg",
    organizationEmail: "events@kronenbourg.example",
    contactName: "Pauline Wagner · Responsable communication",
    contactPhone: "06 22 33 44 55",
    dateShort: "ven. 2 mai",
    dateLong: "vendredi 2 mai 2026",
    timeRange: "09h00 – 15h00",
    durationMinutes: 360,
    participants: 45,
    location: "at_venue",
    ...withAmounts(480000),
    projectTitle: "Maillots saison",
    createdAtLabel: "14 avr. 2026",
    confirmedAtLabel: "18 avr. 2026",
    completedAtLabel: "2 mai 2026",
    resolutionLabel: "Versé le 3 mai 2026 · avis 5★ laissé",
  },
  {
    id: "b28",
    bookingNumber: "SOC-2026-00028",
    status: "cancelled_by_org",
    experienceTitle: "Match VIP & hospitalités",
    experienceSlug: "match-vip-hospitalites",
    organizationName: "Groupe Lorraine Énergie",
    organizationEmail: "rse@lorraine-energie.example",
    contactName: "Marc Antoine · Directeur RSE",
    dateShort: "ven. 30 mai",
    dateLong: "vendredi 30 mai 2026",
    timeRange: "18h00 – 22h00",
    durationMinutes: 240,
    participants: 30,
    location: "at_venue",
    ...withAmounts(240000),
    projectTitle: "Mini-bus du club",
    createdAtLabel: "5 mai 2026",
    confirmedAtLabel: "8 mai 2026",
    resolutionLabel: "Annulée par l'entreprise le 26 mai 2026 (après J−7) — acompte non remboursable conservé par le club (CGV §4)",
  },
  {
    id: "b24",
    bookingNumber: "SOC-2026-00024",
    status: "cancelled_by_club",
    experienceTitle: "Cocktail & visite des coulisses",
    experienceSlug: "cocktail-visite-coulisses",
    organizationName: "Banque CIC Est",
    organizationEmail: "evenements@cic-est.example",
    contactName: "Léa Humbert · Office Manager",
    dateShort: "ven. 9 mai",
    dateLong: "vendredi 9 mai 2026",
    timeRange: "19h00 – 23h00",
    durationMinutes: 240,
    participants: 40,
    location: "at_venue",
    ...withAmounts(110000),
    projectTitle: "École de jeunes U17",
    createdAtLabel: "20 avr. 2026",
    confirmedAtLabel: "23 avr. 2026",
    resolutionLabel: "Annulée par le club le 4 mai 2026 — remboursement intégral",
  },
  {
    id: "b19",
    bookingNumber: "SOC-2026-00019",
    status: "refunded",
    experienceTitle: "Initiation basket encadrée",
    experienceSlug: "initiation-basket-encadree",
    organizationName: "Decathlon Nancy",
    organizationEmail: "events.nancy@decathlon.example",
    contactName: "Hugo Mercier · People Ops",
    dateShort: "sam. 25 avr.",
    dateLong: "samedi 25 avril 2026",
    timeRange: "10h00 – 13h00",
    durationMinutes: 150,
    participants: 60,
    location: "at_club",
    ...withAmounts(90000),
    projectTitle: "Tournoi U17",
    createdAtLabel: "2 avr. 2026",
    confirmedAtLabel: "5 avr. 2026",
    resolutionLabel: "Remboursée le 20 avr. 2026",
  },
];

export async function getReservations(_clubId: string): Promise<BookingAdmin[]> {
  return BOOKINGS;
}
