"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Btn, Chip, DateField, Field, Select, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { useMarketplaceView } from "@/components/marketplace/view-context";
import { cx } from "@/lib/cx";
import {
  CATEGORIES,
  CITIES,
  PRICE_CEIL,
  PRICE_FLOOR,
  RADIUS_MAX,
  SORTS,
  buildQuery,
  countActiveFilters,
  type City,
  type Category,
  type MarketplaceFilters,
  type Sort,
} from "@/lib/marketplace/experiences";

// Coordonnées des 3 villes pilotes (géoloc → ville la plus proche). Mock v1.
const CITY_COORDS: Record<City, { lat: number; lng: number }> = {
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  nancy: { lat: 48.6921, lng: 6.1844 },
  metz: { lat: 49.1193, lng: 6.1757 },
};

function nearestCity(lat: number, lng: number): City {
  let best: City = "strasbourg";
  let bestDist = Infinity;
  for (const { id } of CITIES) {
    const c = CITY_COORDS[id];
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return best;
}

type Props = {
  filters: MarketplaceFilters;
};

export function MarketplaceFilters({ filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // En mobile, la carte est affichée en premier : les filtres (catégories, tri,
  // budget, note…) n'ont pas d'intérêt sur la carte → on les masque tant que la
  // liste n'est pas affichée. Sans effet sur desktop (liste + carte côte à côte).
  const { view } = useMarketplaceView();

  const [open, setOpen] = useState(false);
  const [geolocBusy, setGeolocBusy] = useState(false);
  const [geolocError, setGeolocError] = useState<string | null>(null);

  // États locaux pour les sliders (commit dans l'URL au relâchement).
  const [priceMin, setPriceMin] = useState(filters.priceMin);
  const [priceMax, setPriceMax] = useState(filters.priceMax);
  const [radiusKm, setRadiusKm] = useState(filters.radiusKm);

  // Resync si l'URL change ailleurs (navigation, reset…).
  useEffect(() => setPriceMin(filters.priceMin), [filters.priceMin]);
  useEffect(() => setPriceMax(filters.priceMax), [filters.priceMax]);
  useEffect(() => setRadiusKm(filters.radiusKm), [filters.radiusKm]);

  const activeCount = countActiveFilters(filters);

  function commit(next: Partial<MarketplaceFilters>) {
    const merged: MarketplaceFilters = { ...filters, ...next };
    const qs = buildQuery(merged);
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleCategory(id: Category | null) {
    commit({ category: filters.category === id ? null : id });
  }

  function handleSort(id: string) {
    commit({ sort: id as Sort });
  }

  function handleGeoloc() {
    if (!("geolocation" in navigator)) {
      setGeolocError("Géolocalisation indisponible sur ce navigateur.");
      return;
    }
    setGeolocBusy(true);
    setGeolocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeolocBusy(false);
        commit({ city: nearestCity(pos.coords.latitude, pos.coords.longitude) });
      },
      () => {
        setGeolocBusy(false);
        setGeolocError("Impossible de vous localiser. Choisissez une ville.");
      },
      { enableHighAccuracy: false, timeout: 8000 },
    );
  }

  function resetAll() {
    router.push(pathname, { scroll: false });
    setOpen(false);
  }

  return (
    <div
      className={cx("marketplace-filters", view === "map" && "marketplace-filters--map")}
      style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}
    >
      {/* Barre de chips + tri */}
      <div
        style={{
          padding: "14px var(--page-pad)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Btn
          variant={activeCount > 0 || open ? "dark" : "outline"}
          size="sm"
          icon={<Icon name="filter" size={13} />}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          Filtres · {activeCount}
        </Btn>
        <div className="sy-divider-vert" style={{ height: 24, margin: "0 6px" }} />

        <Chip
          variant={filters.category === null ? "solid" : "outline"}
          onClick={() => handleCategory(null)}
        >
          Toutes
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            variant={c.id === filters.category ? "solid" : "outline"}
            onClick={() => handleCategory(c.id)}
          >
            {c.label}
          </Chip>
        ))}

        <div style={{ flex: 1 }} />
        <Tabs
          variant="pill"
          items={SORTS.map((s) => ({ id: s.id, label: s.label }))}
          active={filters.sort}
          onChange={handleSort}
        />
      </div>

      {/* Panneau filtres avancés */}
      {open && (
        <div
          style={{
            padding: "4px var(--page-pad) 20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* Ville + géoloc */}
          <Field label="Ville">
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <Select
                  value={filters.city ?? ""}
                  onChange={(v) => commit({ city: (v || null) as City | null })}
                  options={CITIES.map((c) => ({ value: c.id, label: c.label }))}
                  placeholder="Toutes les villes"
                  ariaLabel="Choisir une ville"
                />
              </div>
              <Btn
                variant="outline"
                size="sm"
                icon={<Icon name="pin" size={14} />}
                onClick={handleGeoloc}
                aria-label="Me géolocaliser"
                disabled={geolocBusy}
              >
                {geolocBusy ? "…" : "Autour de moi"}
              </Btn>
            </div>
            {geolocError && (
              <div className="sy-small" role="alert" style={{ marginTop: 6, color: "var(--danger)" }}>
                {geolocError}
              </div>
            )}
          </Field>

          {/* Rayon km */}
          <Field label={`Rayon · ${radiusKm} km`}>
            <input
              type="range"
              min={1}
              max={RADIUS_MAX}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              onMouseUp={() => commit({ radiusKm })}
              onTouchEnd={() => commit({ radiusKm })}
              onKeyUp={() => commit({ radiusKm })}
              style={{ width: "100%", accentColor: "var(--primary)" }}
              aria-label="Rayon de recherche en kilomètres"
            />
          </Field>

          {/* Prix (min / max) */}
          <Field label={`Budget · €${priceMin} – €${priceMax}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="range"
                min={PRICE_FLOOR}
                max={PRICE_CEIL}
                step={50}
                value={priceMin}
                onChange={(e) => setPriceMin(Math.min(Number(e.target.value), priceMax))}
                onMouseUp={() => commit({ priceMin: Math.min(priceMin, priceMax) })}
                onTouchEnd={() => commit({ priceMin: Math.min(priceMin, priceMax) })}
                onKeyUp={() => commit({ priceMin: Math.min(priceMin, priceMax) })}
                style={{ width: "100%", accentColor: "var(--primary)" }}
                aria-label="Budget minimum"
              />
              <input
                type="range"
                min={PRICE_FLOOR}
                max={PRICE_CEIL}
                step={50}
                value={priceMax}
                onChange={(e) => setPriceMax(Math.max(Number(e.target.value), priceMin))}
                onMouseUp={() => commit({ priceMax: Math.max(priceMax, priceMin) })}
                onTouchEnd={() => commit({ priceMax: Math.max(priceMax, priceMin) })}
                onKeyUp={() => commit({ priceMax: Math.max(priceMax, priceMin) })}
                style={{ width: "100%", accentColor: "var(--primary)" }}
                aria-label="Budget maximum"
              />
            </div>
          </Field>

          {/* Date */}
          <Field label="Disponible à partir du">
            <DateField
              value={filters.date ?? ""}
              onChange={(v) => commit({ date: v || null })}
              ariaLabel="Date de disponibilité"
            />
          </Field>

          {activeCount > 0 && (
            <div style={{ alignSelf: "end" }}>
              <Btn variant="ghost" size="sm" icon={<Icon name="close" size={13} />} onClick={resetAll}>
                Réinitialiser
              </Btn>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
