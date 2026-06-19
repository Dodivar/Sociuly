"use client";

// Résultats de la découverte club-first (/clubs, SPEC §6) : grille de ClubCard +
// carte interactive (clubs), synchro hover liste ↔ carte, pagination « voir plus ».
// Surface de découverte PRINCIPALE — le club est l'entrée, l'Experience l'unité
// de conversion (chaque carte mène à la vitrine /clubs/[slug]).

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { cx } from "@/lib/cx";
import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { ClubCard } from "@/components/ds/patterns";
import { useMarketplaceView } from "@/components/marketplace/view-context";
import { CITY_LABEL } from "@/lib/marketplace/experiences";
import { SPORT_LABEL, SPORT_ICON, type ClubFilters, type DiscoveryClub } from "@/lib/clubs/discovery";

const PAGE_SIZE = 8;

// Carte MapLibre lazy-loadée côté client uniquement (besoin de `window`, bundle lourd).
const InteractiveClubsMap = dynamic(
  () => import("@/components/clubs/interactive-map").then((m) => m.InteractiveClubsMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="sy-mono sy-muted"
        style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center", background: "var(--surface-2)",
        }}
      >
        Chargement de la carte…
      </div>
    ),
  },
);

type Props = {
  clubs: DiscoveryClub[];
  filters: ClubFilters;
};

export function ClubsResults({ clubs, filters }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Vue active en mobile (≤768px), partagée avec la barre de filtres (carte d'abord).
  const { view: mobileView, toggle: toggleMobileView } = useMarketplaceView();

  // Réinitialise la pagination quand les filtres serveur changent.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setSelectedId(null);
  }, [clubs]);

  const visible = useMemo(() => clubs.slice(0, visibleCount), [clubs, visibleCount]);
  const hasMore = visibleCount < clubs.length;

  const cityLabel = filters.city ? CITY_LABEL[filters.city] : "vous";

  return (
    <div className={cx("clubs-split", `mkt-mobile-${mobileView}`)}>
      {/* Liste */}
      <div className="clubs-list" style={{ padding: "20px var(--page-pad)", overflow: "auto" }}>
        <div style={{ marginBottom: 16 }}>
          <h2 className="sy-h1" style={{ fontSize: 26 }}>
            {clubs.length} {clubs.length > 1 ? "clubs" : "club"} près de {cityLabel}
          </h2>
          <p className="sy-small sy-muted" style={{ marginTop: 4 }}>
            Choisissez un club, découvrez ses expériences, demandez un devis.
          </p>
        </div>

        {clubs.length === 0 ? (
          <div
            className="sy-card"
            style={{ padding: 32, textAlign: "center", border: "1px dashed var(--line-2)" }}
          >
            <div className="sy-h3">Aucun club ne correspond</div>
            <div className="sy-body sy-muted" style={{ marginTop: 6 }}>
              Élargissez la recherche : changez de sport, de ville ou de format.
            </div>
          </div>
        ) : (
          <>
            <div className="clubs-grid">
              {visible.map((c) => (
                <div
                  key={c.id}
                  onMouseEnter={() => setHoveredId(c.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    outline: hoveredId === c.id || selectedId === c.id
                      ? "2px solid var(--primary)" : "2px solid transparent",
                    outlineOffset: 2,
                    transition: "outline-color .15s ease",
                  }}
                >
                  <ClubCard
                    name={c.name}
                    slug={c.slug}
                    initials={c.initials}
                    sportLabel={c.sport === "autre" ? c.typeLabel : SPORT_LABEL[c.sport]}
                    sportIcon={SPORT_ICON[c.sport]}
                    typeLabel={c.typeLabel}
                    city={c.cityRaw}
                    distanceKm={c.distanceKm}
                    rating={c.rating}
                    reviews={c.reviews}
                    experienceCount={c.experienceCount}
                    fromPrice={c.fromPrice}
                    project={c.project}
                    goal={c.goal}
                    hue={c.hue}
                    canHostVipMatch={c.canHostVipMatch}
                  />
                </div>
              ))}
            </div>

            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <Btn
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  iconRight={<Icon name="chevron" size={16} />}
                >
                  Voir plus ({clubs.length - visibleCount} restants)
                </Btn>
              </div>
            )}
          </>
        )}
      </div>

      {/* Carte */}
      <div className="clubs-map">
        <InteractiveClubsMap
          clubs={clubs}
          hoveredId={hoveredId}
          selectedId={selectedId}
          onHover={setHoveredId}
          onSelect={setSelectedId}
          visible={mobileView === "map"}
        />
      </div>

      {/* Bascule carte ↔ liste — mobile uniquement (pilule flottante centrée) */}
      <Btn
        variant="dark"
        className="clubs-toggle"
        onClick={toggleMobileView}
        icon={<Icon name={mobileView === "map" ? "menu" : "map"} size={15} color="#fff" />}
        aria-label={mobileView === "map" ? "Afficher la liste" : "Afficher la carte"}
      >
        {mobileView === "map" ? "Liste" : "Carte"}
      </Btn>

      <style>{`
        /* Conteneur plein écran : en-tête (hauteur naturelle) + zone carte/liste. */
        .clubs-viewport { height: 100vh; display: flex; flex-direction: column; }
        .clubs-header { position: relative; z-index: 20; flex: none; }
        .clubs-split { display: grid; grid-template-columns: 1.05fr 1fr; flex: 1; min-height: 0; }
        .clubs-list { min-height: 0; }
        .clubs-map { position: relative; min-height: 0; }
        .clubs-toggle { display: none; }
        .clubs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        @media (max-width: 1024px) {
          .clubs-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          /* Mobile : une seule vue à la fois, carte affichée en premier. */
          .clubs-split { grid-template-columns: 1fr; }
          .clubs-filters--map { display: none; }
          .clubs-grid { grid-template-columns: 1fr; }
          .mkt-mobile-map .clubs-list { display: none; }
          .mkt-mobile-list .clubs-map { display: none; }
          .mkt-mobile-list .clubs-list { padding-bottom: 84px; }
          .clubs-toggle {
            display: inline-flex;
            position: fixed;
            left: 50%;
            bottom: 20px;
            transform: translateX(-50%);
            z-index: 30;
            border-radius: 999px;
            box-shadow: var(--shadow-md);
          }
        }
      `}</style>
    </div>
  );
}
