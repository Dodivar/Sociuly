import { Avatar, IconBtn, SearchBar } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { Logo, SiteFooter } from "@/components/ds/patterns";
import { MarketplaceFilters } from "@/components/marketplace/filters";
import { MarketplaceResults } from "@/components/marketplace/results";
import {
  filterAndSortExperiences,
  getMarketplaceExperiences,
  parseFilters,
} from "@/lib/marketplace/experiences";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ExperiencesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const all = await getMarketplaceExperiences();
  const results = filterAndSortExperiences(all, filters);

  return (
    <main
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "14px var(--page-pad)", borderBottom: "1px solid var(--line)",
          background: "var(--surface)", display: "flex", alignItems: "center", gap: 24,
        }}
      >
        <Logo />
        <SearchBar compact style={{ flex: 1, maxWidth: 720 }} />
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
          <IconBtn aria-label="Favoris"><Icon name="heart" size={16} /></IconBtn>
          <IconBtn aria-label="Notifications"><Icon name="bell" size={16} /></IconBtn>
          <Avatar initials="ML" tone="orange" />
        </div>
      </div>

      {/* Barre de filtres — câblée sur l'URL (searchParams) */}
      <MarketplaceFilters filters={filters} />

      {/* Résultats : liste + carte interactive (favoris, hover sync, pagination) */}
      <MarketplaceResults experiences={results} filters={filters} />

      <SiteFooter />
    </main>
  );
}
