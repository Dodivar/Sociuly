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
