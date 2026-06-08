import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/auth/rbac";
import { getAdminData } from "@/lib/admin/mock-admin";

// Console admin Sociuly — réservée au rôle sociuly_admin (SPEC §6).
export const metadata: Metadata = {
  title: "Console admin · Sociuly",
  description:
    "Validation KYC des associations, modération, finances et signalements de la plateforme Sociuly.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Garde RBAC : réservé au rôle sociuly_admin (SPEC §6). Le middleware barre
  // déjà en amont ; garde de page = défense en profondeur.
  await requireRole(["sociuly_admin"], "/admin");
  // TODO(api): remplacer par un fetch Prisma (cf. SPEC §3/§5).
  const data = await getAdminData();

  return <AdminShell data={data} />;
}
