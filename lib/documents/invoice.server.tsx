// Émission et génération de la facture finale — SERVEUR UNIQUEMENT.
//
// Cycle (SPEC §3/§4) :
//  - `issueInvoiceForBooking` : appelé au passage deposit_paid → confirmed (webhook
//    Stripe signé). Crée la ligne Invoice (numéro légal FAC-YYYY-NNNNN atomique),
//    rend le PDF (@react-pdf/renderer) et le téléverse dans Supabase Storage.
//    Idempotent : si la facture existe déjà, ne fait rien.
//  - `getInvoicePdfBytes` : appelé par la route de téléchargement. Régénère le PDF
//    à la demande s'il est manquant (génération paresseuse, tolérance aux pannes).
//
// Tolérance aux pannes : l'échec du Storage/PDF ne doit jamais faire échouer la
// transition de paiement → la ligne Invoice est créée même sans `pdfStoragePath`,
// le PDF est régénéré au premier téléchargement.

import "server-only";

import { renderToBuffer } from "@react-pdf/renderer";

import { prisma } from "@/lib/prisma";
import { nextInvoiceNumber } from "@/lib/devis/numbering.server";
import {
  isServiceConfigured,
  uploadInvoicePdf,
  downloadInvoicePdf,
} from "@/lib/supabase/service";
import { InvoiceDocument, type InvoicePdfData } from "@/lib/documents/invoice-pdf";

const isoDay = (d: Date): string => d.toISOString().slice(0, 10);

/** Chemin de stockage déterministe d'une facture dans le bucket privé. */
function storagePath(invoiceNumber: string, createdAt: Date): string {
  return `${createdAt.getFullYear()}/${invoiceNumber}.pdf`;
}

/** Charge toutes les données nécessaires au rendu PDF d'une facture. */
async function loadPdfData(bookingId: string): Promise<{
  invoiceNumber: string;
  createdAt: Date;
  data: InvoicePdfData;
} | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { bookingId },
    include: {
      booking: {
        include: {
          club: true,
          organization: true,
          experience: { select: { title: true } },
          quote: { select: { quoteNumber: true, participants: true, lines: { orderBy: { order: "asc" } } } },
        },
      },
    },
  });
  if (!invoice) return null;

  const { booking } = invoice;
  const lines = booking.quote.lines.map((l) => ({
    label: l.label,
    detail: l.detail,
    quantity: l.quantity,
    unitPriceCents: l.unitPriceCents,
  }));

  const data: InvoicePdfData = {
    invoiceNumber: invoice.invoiceNumber,
    bookingNumber: booking.bookingNumber,
    quoteNumber: booking.quote.quoteNumber,
    issuedOnISO: isoDay(invoice.createdAt),
    eventDateISO: isoDay(booking.requestedDate),
    club: {
      name: booking.club.name,
      siret: booking.club.siret,
      addressLine: null,
      city: booking.club.city,
      postalCode: booking.club.postalCode,
      vatLiable: booking.club.vatLiable,
      tvaNumber: null, // TODO(api) : n° TVA intracom du club (à ajouter au modèle Club).
    },
    organization: {
      name: booking.organization.name,
      siret: booking.organization.siret,
      tvaIntracom: booking.organization.tvaIntracom,
      addressLine: booking.organization.billingAddress,
      postalCode: booking.organization.billingPostalCode,
      city: booking.organization.billingCity,
      country: booking.organization.billingCountry,
    },
    experienceTitle: booking.experience.title,
    participants: booking.quote.participants,
    lines,
    amountHTCents: invoice.amountHTCents,
    vatCents: invoice.vatCents,
    amountTTCCents: invoice.amountTTCCents,
    depositCents: booking.depositCents,
  };

  return { invoiceNumber: invoice.invoiceNumber, createdAt: invoice.createdAt, data };
}

/** Rend le PDF et le téléverse ; renvoie le chemin de stockage. */
async function renderAndUpload(bookingId: string): Promise<string | null> {
  if (!isServiceConfigured()) return null;
  const loaded = await loadPdfData(bookingId);
  if (!loaded) return null;

  const bytes = await renderToBuffer(<InvoiceDocument data={loaded.data} />);
  const path = storagePath(loaded.invoiceNumber, loaded.createdAt);
  await uploadInvoicePdf(path, new Uint8Array(bytes));
  await prisma.invoice.update({ where: { bookingId }, data: { pdfStoragePath: path } });
  return path;
}

/**
 * Émet la facture finale d'une réservation confirmée (idempotent). Crée la ligne
 * Invoice avec son numéro légal, puis tente de générer/téléverser le PDF.
 * L'échec de génération n'invalide pas la facture (PDF régénéré au téléchargement).
 */
export async function issueInvoiceForBooking(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      grossAmountTTCCents: true,
      vatCents: true,
      invoice: { select: { id: true } },
    },
  });
  if (!booking || booking.invoice) return; // introuvable ou déjà facturé → idempotent

  // Création atomique : numéro légal + ligne Invoice dans la même transaction.
  await prisma.$transaction(async (tx) => {
    // Re-vérifie l'absence de facture dans la transaction (anti-course).
    const existing = await tx.invoice.findUnique({ where: { bookingId }, select: { id: true } });
    if (existing) return;
    const invoiceNumber = await nextInvoiceNumber(tx);
    await tx.invoice.create({
      data: {
        invoiceNumber,
        bookingId: booking.id,
        amountHTCents: booking.grossAmountTTCCents - booking.vatCents,
        vatCents: booking.vatCents,
        amountTTCCents: booking.grossAmountTTCCents,
      },
    });
  });

  // Génération PDF hors transaction (réseau Storage) — best effort.
  try {
    await renderAndUpload(bookingId);
  } catch (err) {
    console.error("[invoice] génération PDF différée (régénérée au téléchargement)", bookingId, err);
  }
}

/**
 * Renvoie les octets du PDF d'une facture pour la route de téléchargement.
 * Régénère et téléverse le PDF s'il est absent du Storage (génération paresseuse).
 */
export async function getInvoicePdfBytes(bookingId: string): Promise<Uint8Array | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { bookingId },
    select: { pdfStoragePath: true },
  });
  if (!invoice) return null;

  if (invoice.pdfStoragePath) {
    try {
      return await downloadInvoicePdf(invoice.pdfStoragePath);
    } catch {
      // Fichier manquant côté Storage → on tente une régénération ci-dessous.
    }
  }

  const loaded = await loadPdfData(bookingId);
  if (!loaded) return null;
  const bytes = new Uint8Array(await renderToBuffer(<InvoiceDocument data={loaded.data} />));
  // Téléverse en arrière-plan si le Storage est configuré (best effort).
  if (isServiceConfigured()) {
    try {
      const path = storagePath(loaded.invoiceNumber, loaded.createdAt);
      await uploadInvoicePdf(path, bytes);
      await prisma.invoice.update({ where: { bookingId }, data: { pdfStoragePath: path } });
    } catch {
      // On sert quand même le PDF généré à la volée.
    }
  }
  return bytes;
}
