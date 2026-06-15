// Téléchargement du PDF d'une facture — /compte/factures/[id]/pdf (SPEC §6).
//
// Réservé à l'org_buyer propriétaire de la facture (§8). Le PDF est servi depuis
// Supabase Storage (régénéré à la volée s'il est absent). Node runtime obligatoire
// (Prisma + génération PDF, incompatibles Edge).

import { NextResponse, type NextRequest } from "next/server";

import { requireRole } from "@/lib/auth/rbac";
import { isAuthEnforced } from "@/lib/auth/session";
import { currentOrgId } from "@/lib/account/org";
import { prisma } from "@/lib/prisma";
import { getInvoicePdfBytes } from "@/lib/documents/invoice.server";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireRole(["org_buyer"]);
  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { invoiceNumber: true, bookingId: true, booking: { select: { organizationId: true } } },
  });
  if (!invoice) return NextResponse.json({ error: "Facture introuvable." }, { status: 404 });

  // Contrôle d'accès : la facture doit appartenir à l'organisation de l'utilisateur.
  if (isAuthEnforced()) {
    const orgId = await currentOrgId();
    if (orgId && invoice.booking.organizationId !== orgId) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }
  }

  const bytes = await getInvoicePdfBytes(invoice.bookingId);
  if (!bytes) return NextResponse.json({ error: "Document indisponible." }, { status: 404 });

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
