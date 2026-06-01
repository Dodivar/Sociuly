import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminData } from "@/lib/admin/mock-admin";

// Console admin Sociuly — réservée au rôle sociuly_admin (SPEC §6).
export const metadata: Metadata = {
  title: "Console admin · Sociuly",
  description:
    "Validation KYC des associations, modération, finances et signalements de la plateforme Sociuly.",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // TODO(auth): protéger derrière un guard rôle sociuly_admin (Supabase Auth)
  // et rediriger vers /connexion?redirect=/admin si non autorisé.
  // TODO(api): remplacer par un fetch Prisma (cf. SPEC §3/§5).
  const data = await getAdminData();

  return <AdminShell data={data} />;
}
