import { SiteFooter, TopNav } from "@/components/ds/patterns";
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
          {/* En-tête standard du site (navigation + connexion) */}
          <TopNav active="experiences" />

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
