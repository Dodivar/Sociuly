// Cf. SPEC.md §3 — Booking · §4/§5 — commission / acompte / annulation / versement.
// Données servies par Prisma (Booking du club + quote/experience/org). Les
// libellés de dates sont pré-formatés (FR, fuseau UTC) côté donnée pour éviter
// tout décalage au rendu (le composant de vue est "use client").


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


