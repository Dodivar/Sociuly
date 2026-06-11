import { PanelCard } from "@/components/account/account-bits";
import { InvoiceRows } from "@/components/account/org-lists";
import { getOrgInvoices } from "@/lib/account/org";

// Factures de l'entreprise — /compte/factures (SPEC §6).
export default async function CompteFacturesPage() {
  const invoices = await getOrgInvoices();

  return (
    <PanelCard title="Vos factures">
      <InvoiceRows invoices={invoices} />
    </PanelCard>
  );
}

// Lecture DB à la demande : pas de prerender au build (la DB n'est pas câblée).
export const dynamic = "force-dynamic";
