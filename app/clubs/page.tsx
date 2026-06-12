import type { Metadata } from "next";
import { SiteFooter, TopNav } from "@/components/ds/patterns";
import { ClubsFilters } from "@/components/clubs/filters";
import { ClubsResults } from "@/components/clubs/results";
import { MarketplaceViewProvider } from "@/components/marketplace/view-context";
import { getDiscoveryClubs } from "@/lib/clubs/discovery.server";
import { filterAndSortClubs, parseClubFilters } from "@/lib/clubs/discovery";

// Découverte club-first (SPEC §6, amendement 2026-06) : surface de découverte
// PRINCIPALE de Sociuly. Liste + carte des clubs partenaires actifs des 3 villes
// pilotes ; le catalogue d'expériences (/experiences) est la surface secondaire.
export const metadata: Metadata = {
  title: "Clubs partenaires — Sociuly",
  description:
    "Découvrez les clubs sportifs partenaires de Sociuly à Strasbourg, Nancy et Metz. " +
    "Choisissez un club, explorez ses expériences premium pour vos équipes, demandez un devis.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClubsPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = parseClubFilters(params);
  const all = await getDiscoveryClubs();
  const results = filterAndSortClubs(all, filters);

  return (
    <main style={{ background: "var(--bg)" }}>
      {/* Zone plein écran (hauteur viewport) : en-tête + carte/liste. Le footer
          est en dehors, révélé au scroll. */}
      <div className="clubs-viewport">
        {/* Vue carte/liste partagée (en-tête ↔ résultats) : la barre de filtres
            se masque quand la carte est affichée en mobile. */}
        <MarketplaceViewProvider>
          <div className="clubs-header">
            <TopNav active="clubs" />
            <ClubsFilters filters={filters} />
          </div>

          {/* Résultats : grille de clubs + carte interactive (hover sync, pagination) */}
          <ClubsResults clubs={results} filters={filters} />
        </MarketplaceViewProvider>
      </div>

      <SiteFooter />
    </main>
  );
}
