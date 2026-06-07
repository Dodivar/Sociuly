import Link from "next/link";
import { Icon } from "@/components/ds/icon";
import { PanelCard } from "@/components/account/account-bits";
import { QuoteRows } from "@/components/account/org-lists";
import { getQuotesForOrg } from "@/lib/devis/quotes";

// Devis de l'entreprise — /compte/devis (SPEC §6).
export default async function CompteDevisPage() {
  const quotes = await getQuotesForOrg();

  return (
    <PanelCard
      title="Tous vos devis"
      action={
        <Link href="/experiences" style={{ textDecoration: "none" }}>
          <span className="sy-btn sy-btn-soft sy-btn-sm"><Icon name="plus" size={13} /> Demander un devis</span>
        </Link>
      }
    >
      <QuoteRows quotes={quotes} />
    </PanelCard>
  );
}
