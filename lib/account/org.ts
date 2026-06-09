// Espace entreprise (org_buyer) — /compte (SPEC §5/§6).
// Données servies par Prisma, scopées sur l'Organisation courante.
// L'espace regroupe devis, réservations, factures et équipe.
// Montants en centimes (Int), jamais de float (SPEC §3).

import type { IconName } from "@/components/ds/icon";
import { prisma } from "@/lib/prisma";
import type { BookingStatus } from "@/lib/generated/prisma/enums";

// Organisation de démonstration (fallback historique). En attendant le câblage de
// la session, l'org courante = première organisation (cf. resolveOrg).
export const DEMO_ORG_NAME = "Klaxoon SAS";

// TODO(auth): remplacer par l'Organization de l'org_buyer authentifié (session Supabase).
async function resolveOrg() {
  return prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });
}

const SIZE_LABEL: Record<string, string> = {
  tpe: "1–9 salariés",
  pme: "10–249 salariés",
  eti: "250–4999 salariés",
  ge: "5000+ salariés",
};

const initialsOf = (name: string) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();

const frLong = (d: Date) =>
  d.toLocaleDateString("fr-FR", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" });
const frShort = (d: Date) =>
  d.toLocaleDateString("fr-FR", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });

/** Étiquette d'activité relative simple à partir d'une date. */
function lastActiveOf(d: Date): string {
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaine${days >= 14 ? "s" : ""}`;
  return frShort(d);
}

/** BookingStatus (DB) → sous-ensemble côté acheteur. */
function toOrgBookingStatus(s: BookingStatus): OrgBookingStatus {
  switch (s) {
    case "deposit_paid": return "deposit_paid";
    case "confirmed":
    case "in_progress": return "confirmed";
    case "completed": return "completed";
    case "cancelled_by_org":
    case "cancelled_by_club":
    case "refunded": return "cancelled";
    default: return "quote_accepted";
  }
}

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

// ─────── Getters Prisma ───────
export async function getOrganizationSummary(): Promise<OrgSummary> {
  const org = await resolveOrg();
  if (!org) {
    return { id: "", name: "—", initials: "?", siret: "", sector: "", sizeBucket: "",
      primaryContact: { name: "", email: "" } };
  }
  const contact = org.primaryContactUserId
    ? await prisma.user.findUnique({ where: { id: org.primaryContactUserId }, select: { fullName: true, email: true } })
    : null;
  return {
    id: org.id,
    name: org.name,
    initials: initialsOf(org.name),
    siret: org.siret,
    sector: org.sector ?? "",
    sizeBucket: org.sizeBucket ? SIZE_LABEL[org.sizeBucket] ?? org.sizeBucket : "",
    primaryContact: { name: contact?.fullName ?? "", email: contact?.email ?? "" },
  };
}

export async function getOrgBookings(): Promise<OrgBooking[]> {
  const org = await resolveOrg();
  if (!org) return [];

  const rows = await prisma.booking.findMany({
    where: { organizationId: org.id },
    orderBy: { requestedDate: "desc" },
    include: {
      experience: { select: { title: true, slug: true, project: { select: { title: true } } } },
      club: { select: { name: true } },
      quote: { select: { participants: true } },
      review: { select: { id: true } },
    },
  });

  return rows.map((b) => {
    const status = toOrgBookingStatus(b.status);
    return {
      id: b.id,
      bookingNumber: b.bookingNumber,
      status,
      experienceTitle: b.experience.title,
      experienceSlug: b.experience.slug,
      clubName: b.club.name,
      dateISO: b.requestedDate.toISOString().slice(0, 10),
      dateLabel: frLong(b.requestedDate),
      participants: b.quote?.participants ?? 0,
      amountTTCCents: b.grossAmountTTCCents,
      depositCents: b.depositCents,
      projectTitle: b.experience.project?.title ?? undefined,
      payHref: status === "quote_accepted"
        ? `/reserver/${b.bookingNumber}?slug=${b.experience.slug}`
        : undefined,
      reviewed: status === "completed" ? b.review != null : undefined,
    };
  });
}

const PAID_BOOKING = new Set<BookingStatus>(["confirmed", "in_progress", "completed"]);

export async function getOrgInvoices(): Promise<OrgInvoice[]> {
  const org = await resolveOrg();
  if (!org) return [];

  const rows = await prisma.invoice.findMany({
    where: { booking: { organizationId: org.id } },
    orderBy: { createdAt: "desc" },
    include: {
      booking: {
        select: {
          bookingNumber: true, status: true,
          experience: { select: { title: true } },
          club: { select: { name: true } },
        },
      },
    },
  });

  return rows.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    bookingNumber: inv.booking.bookingNumber,
    experienceTitle: inv.booking.experience.title,
    clubName: inv.booking.club.name,
    dateLabel: frShort(inv.createdAt),
    amountTTCCents: inv.amountTTCCents,
    status: PAID_BOOKING.has(inv.booking.status) ? "paid" : "pending",
    pdfUrl: inv.pdfUrl ?? "#",
  }));
}

export async function getOrgTeam(): Promise<OrgMember[]> {
  const org = await resolveOrg();
  if (!org) return [];

  const users = await prisma.user.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: "asc" },
    select: { id: true, fullName: true, email: true, updatedAt: true },
  });

  return users.map((u) => {
    const name = u.fullName ?? u.email;
    return {
      id: u.id,
      name,
      email: u.email,
      role: u.id === org.primaryContactUserId ? "admin" : "member",
      initials: initialsOf(name),
      lastActiveLabel: lastActiveOf(u.updatedAt),
    };
  });
}
