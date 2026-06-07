// Espace entreprise (org_buyer) — /compte (SPEC §5/§6).
// Données mock de l'organisation acheteuse de démonstration : Klaxoon SAS.
// L'espace regroupe devis, réservations, factures et équipe.
//
// TODO(api): remplacer par des fetchs Prisma scopés sur l'Organization de
// l'org_buyer connecté (auth Supabase). Garder les signatures async et les enums
// alignés sur le schéma. Montants en centimes (Int), jamais de float (SPEC §3).

import type { IconName } from "@/components/ds/icon";

// Organisation de démonstration. Aligné avec le devis Klaxoon (lib/devis/quotes.ts).
export const DEMO_ORG_NAME = "Klaxoon SAS";

export type OrgSummary = {
  id: string;
  name: string;
  initials: string;
  siret: string;
  sector: string;
  sizeBucket: string;
  primaryContact: { name: string; email: string };
};

export type OrgStat = {
  id: string;
  label: string;
  value: string;
  icon: IconName;
  hint?: string;
};

// ─────── Réservations de l'entreprise (vue acheteur) ───────
// Sous-ensemble pertinent de Booking.status côté entreprise (SPEC §3).
export type OrgBookingStatus =
  | "quote_accepted"
  | "deposit_paid"
  | "confirmed"
  | "completed"
  | "cancelled";

export const ORG_BOOKING_LABEL: Record<OrgBookingStatus, string> = {
  quote_accepted: "Acompte à régler",
  deposit_paid: "Acompte versé",
  confirmed: "Confirmée",
  completed: "Terminée",
  cancelled: "Annulée",
};

export type OrgBooking = {
  id: string;
  bookingNumber: string; // SOC-YYYY-NNNNN
  status: OrgBookingStatus;
  experienceTitle: string;
  experienceSlug: string;
  clubName: string;
  dateISO: string;
  dateLabel: string;
  participants: number;
  amountTTCCents: number;
  depositCents: number;
  projectTitle?: string;
  /** Lien de paiement de l'acompte si encore dû (quote_accepted). */
  payHref?: string;
  /** Avis laissé après réalisation ? (completed). */
  reviewed?: boolean;
};

// ─────── Factures (SPEC §3 — Invoice) ───────
export type OrgInvoiceStatus = "paid" | "pending";
export const ORG_INVOICE_LABEL: Record<OrgInvoiceStatus, string> = {
  paid: "Payée",
  pending: "À régler",
};

export type OrgInvoice = {
  id: string;
  invoiceNumber: string; // numéro légal séquentiel
  bookingNumber: string;
  experienceTitle: string;
  clubName: string;
  dateLabel: string;
  amountTTCCents: number;
  status: OrgInvoiceStatus;
  /** TODO(api): URL réelle du PDF (Supabase Storage / @react-pdf/renderer). */
  pdfUrl: string;
};

// ─────── Équipe de l'organisation ───────
export type OrgMemberRole = "admin" | "member";
export const ORG_ROLE_LABEL: Record<OrgMemberRole, string> = {
  admin: "Administrateur",
  member: "Membre",
};

export type OrgMember = {
  id: string;
  name: string;
  email: string;
  role: OrgMemberRole;
  initials: string;
  lastActiveLabel: string;
};

// ─────── Getters mock ───────
export async function getOrganizationSummary(): Promise<OrgSummary> {
  return {
    id: "org-klaxoon",
    name: DEMO_ORG_NAME,
    initials: "KX",
    siret: "81204759300025",
    sector: "Édition de logiciels",
    sizeBucket: "250–999 salariés",
    primaryContact: { name: "Camille Léger", email: "seminaires@klaxoon.example" },
  };
}

const BOOKINGS: OrgBooking[] = [
  {
    id: "ob1",
    bookingNumber: "SOC-2026-00042",
    status: "deposit_paid",
    experienceTitle: "Journée immersion · SIG",
    experienceSlug: "journee-immersion-sig",
    clubName: "SIG Strasbourg",
    dateISO: "2026-06-16",
    dateLabel: "mardi 16 juin 2026",
    participants: 40,
    amountTTCCents: 480_000,
    depositCents: 144_000,
    projectTitle: "École de jeunes U17",
  },
  {
    id: "ob2",
    bookingNumber: "SOC-2026-00051",
    status: "quote_accepted",
    experienceTitle: "Atelier cohésion d'équipe",
    experienceSlug: "atelier-cohesion-nancy",
    clubName: "SIG Strasbourg",
    dateISO: "2026-07-10",
    dateLabel: "vendredi 10 juillet 2026",
    participants: 28,
    amountTTCCents: 112_000,
    depositCents: 33_600,
    projectTitle: "Maillots saison",
    // Acompte encore dû → lien de paiement (réf. démo qui résout côté /reserver).
    payHref: "/reserver/SOC-2026-00042?slug=journee-immersion-sig",
  },
  {
    id: "ob3",
    bookingNumber: "SOC-2026-00018",
    status: "completed",
    experienceTitle: "Cocktail & visite des coulisses",
    experienceSlug: "cocktail-visite-coulisses-strasbourg",
    clubName: "SIG Strasbourg",
    dateISO: "2026-03-14",
    dateLabel: "vendredi 14 mars 2026",
    participants: 35,
    amountTTCCents: 96_250,
    depositCents: 28_875,
    projectTitle: "École de jeunes U17",
    reviewed: true,
  },
  {
    id: "ob4",
    bookingNumber: "SOC-2025-00204",
    status: "completed",
    experienceTitle: "Masterclass joueur pro",
    experienceSlug: "masterclass-joueur-pro-sig",
    clubName: "SIG Strasbourg",
    dateISO: "2025-12-05",
    dateLabel: "vendredi 5 décembre 2025",
    participants: 50,
    amountTTCCents: 175_000,
    depositCents: 52_500,
    projectTitle: "Mini-bus du club",
    reviewed: false,
  },
];

export async function getOrgBookings(): Promise<OrgBooking[]> {
  return BOOKINGS;
}

const INVOICES: OrgInvoice[] = [
  {
    id: "inv1",
    invoiceNumber: "FAC-2026-0042",
    bookingNumber: "SOC-2026-00042",
    experienceTitle: "Journée immersion · SIG",
    clubName: "SIG Strasbourg",
    dateLabel: "28 mai 2026",
    amountTTCCents: 144_000, // facture d'acompte
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "inv2",
    invoiceNumber: "FAC-2026-0018",
    bookingNumber: "SOC-2026-00018",
    experienceTitle: "Cocktail & visite des coulisses",
    clubName: "SIG Strasbourg",
    dateLabel: "16 mars 2026",
    amountTTCCents: 96_250,
    status: "paid",
    pdfUrl: "#",
  },
  {
    id: "inv3",
    invoiceNumber: "FAC-2025-0204",
    bookingNumber: "SOC-2025-00204",
    experienceTitle: "Masterclass joueur pro",
    clubName: "SIG Strasbourg",
    dateLabel: "8 décembre 2025",
    amountTTCCents: 175_000,
    status: "paid",
    pdfUrl: "#",
  },
];

export async function getOrgInvoices(): Promise<OrgInvoice[]> {
  return INVOICES;
}

const TEAM: OrgMember[] = [
  { id: "m1", name: "Camille Léger", email: "seminaires@klaxoon.example", role: "admin", initials: "CL", lastActiveLabel: "Aujourd'hui" },
  { id: "m2", name: "Adrien Wolff", email: "adrien.wolff@klaxoon.example", role: "member", initials: "AW", lastActiveLabel: "Il y a 3 jours" },
  { id: "m3", name: "Naïma Berkane", email: "naima.berkane@klaxoon.example", role: "member", initials: "NB", lastActiveLabel: "Il y a 2 semaines" },
];

export async function getOrgTeam(): Promise<OrgMember[]> {
  return TEAM;
}
