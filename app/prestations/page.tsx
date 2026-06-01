import { SiteFooter, TopNav } from "@/components/ds/patterns";
import { MarketplaceShell } from "@/components/marketplace/marketplace-shell";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const initialView = view === "map" ? "map" : "list";

  return (
    <main
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
      }}
    >
      <TopNav active="prestations" />
      <MarketplaceShell view={initialView} />
      <SiteFooter />
    </main>
  );
}
