"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { cx } from "@/lib/cx";
import { Btn, Chip } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { ExperienceCard } from "@/components/ds/patterns";
import {
  CATEGORY_LABEL,
  CITY_LABEL,
  PAGE_SIZE,
  type MarketplaceExperience,
  type MarketplaceFilters,
} from "@/lib/marketplace/experiences";

// Carte MapLibre lazy-loadée côté client uniquement (besoin de `window`,
// bundle lourd) — placeholder pendant le chargement.
const InteractiveMarketMap = dynamic(
  () => import("@/components/marketplace/interactive-map").then((m) => m.InteractiveMarketMap),
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

const FAV_KEY = "sociuly:favoris";

type Props = {
  experiences: MarketplaceExperience[];
  filters: MarketplaceFilters;
};

export function MarketplaceResults({ experiences, filters }: Props) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [favReady, setFavReady] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  // Vue active en mobile (≤768px) : la carte est affichée en premier pour
  // « trouver une activité », un bouton flottant bascule vers la liste.
  const [mobileView, setMobileView] = useState<"map" | "list">("map");

  // ─── Favoris : persistance localStorage (v1, SPEC §2 — pas de DB côté favoris) ───
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavorites(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* localStorage indisponible — favoris en mémoire seulement */
    }
    setFavReady(true);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  // Liste affichée (filtre favoris côté client + pagination « voir plus »).
  const list = useMemo(
    () => (favOnly ? experiences.filter((x) => favorites.has(x.id)) : experiences),
    [experiences, favOnly, favorites],
  );

  // Réinitialise la pagination quand les filtres serveur changent.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    setSelectedId(null);
  }, [experiences, favOnly]);

  const visible = list.slice(0, visibleCount);
  const hasMore = visibleCount < list.length;

  const cityLabel = filters.city ? CITY_LABEL[filters.city] : "vous";
  const favCount = favorites.size;

  return (
    <div className={cx("marketplace-split", `mkt-mobile-${mobileView}`)}>
      {/* Liste */}
      <div className="marketplace-list" style={{ padding: "20px var(--page-pad)", overflow: "auto" }}>
        <div
          style={{
            display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 16, flexWrap: "wrap", gap: 8,
          }}
        >
          <h2 className="sy-h1" style={{ fontSize: 26 }}>
            {list.length} {list.length > 1 ? "expériences" : "expérience"} près de {cityLabel}
          </h2>
          {favReady && favCount > 0 && (
            <Chip
              variant={favOnly ? "accent" : "outline"}
              onClick={() => setFavOnly((v) => !v)}
            >
              ♥ {favCount} {favCount > 1 ? "favoris" : "favori"}
            </Chip>
          )}
        </div>

        {list.length === 0 ? (
          <div
            className="sy-card"
            style={{ padding: 32, textAlign: "center", border: "1px dashed var(--line-2)" }}
          >
            <div className="sy-h3">Aucune expérience ne correspond</div>
            <div className="sy-body sy-muted" style={{ marginTop: 6 }}>
              {favOnly
                ? "Vous n'avez pas encore de favori dans ces résultats."
                : "Élargissez le rayon, le budget ou changez de ville."}
            </div>
          </div>
        ) : (
          <>
            <div className="experience-grid">
              {visible.map((x) => (
                <div
                  key={x.id}
                  onMouseEnter={() => setHoveredId(x.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    borderRadius: "var(--radius-lg)",
                    outline: hoveredId === x.id || selectedId === x.id
                      ? "2px solid var(--primary)" : "2px solid transparent",
                    outlineOffset: 2,
                    transition: "outline-color .15s ease",
                  }}
                >
                  <ExperienceCard
                    title={x.title}
                    price={x.price}
                    loc={`${CITY_LABEL[x.city]} · ${x.distanceKm} km`}
                    rating={x.rating}
                    reviews={x.reviews}
                    category={`${CATEGORY_LABEL[x.category]} · ${x.capacityLabel}`}
                    funds={x.funds}
                    goal={x.goal}
                    hue={x.hue}
                    href={`/experiences/${x.slug}`}
                    saved={favorites.has(x.id)}
                    onToggleSave={() => toggleFavorite(x.id)}
                  />
                </div>
              ))}
            </div>

            {hasMore && (
              <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
                <Btn
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  iconRight={<Icon name="chevron" size={16} />}
                >
                  Voir plus ({list.length - visibleCount} restantes)
                </Btn>
              </div>
            )}
          </>
        )}
      </div>

      {/* Carte */}
      <div className="marketplace-map">
        <InteractiveMarketMap
          experiences={list}
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
        className="marketplace-toggle"
        onClick={() => setMobileView((v) => (v === "map" ? "list" : "map"))}
        icon={<Icon name={mobileView === "map" ? "menu" : "map"} size={15} color="#fff" />}
        aria-label={mobileView === "map" ? "Afficher la liste" : "Afficher la carte"}
      >
        {mobileView === "map" ? "Liste" : "Carte"}
      </Btn>

      <style>{`
        /* Conteneur plein écran : en-tête (hauteur naturelle) + zone carte/liste
           (flex:1 → remplit tout le reste, s'adapte à l'ouverture des filtres). */
        .marketplace-viewport {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .marketplace-header { position: relative; z-index: 20; flex: none; }
        /* Zone carte/liste : remplit l'écran entre l'en-tête et le footer.
           La carte occupe 100% de la hauteur, la liste défile indépendamment. */
        .marketplace-split {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          flex: 1;
          min-height: 0;
        }
        .marketplace-list { min-height: 0; }
        .marketplace-map { position: relative; min-height: 0; }
        .marketplace-toggle { display: none; }
        .experience-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          /* Mobile : une seule vue à la fois, carte affichée en premier,
             bascule via la pilule flottante. */
          .marketplace-split { grid-template-columns: 1fr; }
          .experience-grid { grid-template-columns: 1fr; }
          .mkt-mobile-map .marketplace-list { display: none; }
          .mkt-mobile-list .marketplace-map { display: none; }
          .mkt-mobile-list .marketplace-list { padding-bottom: 84px; }
          .marketplace-toggle {
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
