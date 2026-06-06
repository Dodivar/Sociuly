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
    <main style={{ background: "var(--bg)" }}>
      {/* Zone plein écran (hauteur viewport) : en-tête + carte/liste. Le footer
          est en dehors, révélé au scroll. La carte/liste remplit en flex tout
          l'espace laissé par l'en-tête (s'adapte à l'ouverture des filtres). */}
      <div className="marketplace-viewport">
        <div className="marketplace-header">
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
        </div>

        {/* Résultats : liste + carte interactive (favoris, hover sync, pagination) */}
        <MarketplaceResults experiences={results} filters={filters} />
      </div>

      <SiteFooter />
    </main>
  );
}
