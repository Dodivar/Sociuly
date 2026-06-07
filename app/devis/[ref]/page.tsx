import Link from "next/link";
import { notFound } from "next/navigation";
import { Logo, SiteFooter } from "@/components/ds/patterns";
import { QuoteView } from "@/components/devis/quote-view";
import { getQuoteByRef } from "@/lib/devis/quotes";

// Suivi & validation d'un devis côté entreprise — /devis/[ref] (SPEC §6).
// `ref` = token opaque (décision §11). En prod, l'accès est protégé : seul
// l'org_buyer de l'Organization concernée peut ouvrir le devis (lien magic-link
// de l'email). TODO(api): garde d'auth + scope Organization.

type Props = { params: Promise<{ ref: string }> };

export default async function QuotePage({ params }: Props) {
  const { ref } = await params;
  const quote = await getQuoteByRef(ref);
  if (!quote) notFound();

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <div
        style={{
          padding: "16px var(--page-pad)", borderBottom: "1px solid var(--line)",
          background: "var(--surface)", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 24, flexWrap: "wrap",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Logo />
        </Link>
        <div className="sy-mono">Devis · {quote.quoteNumber}</div>
      </div>

      <QuoteView quote={quote} />

      <SiteFooter />
    </main>
  );
}
