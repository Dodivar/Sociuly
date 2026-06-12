"use client";

// Barre de filtres de la découverte club-first (/clubs, SPEC §6).
// Facettes : sport (chips), ville, format, capacité + tri. Câblée sur l'URL
// (searchParams) — l'état vit dans l'URL, pas dans un store (cf. règles stack).

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Btn, Chip, Field, Select, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { useMarketplaceView } from "@/components/marketplace/view-context";
import { cx } from "@/lib/cx";
import { CITIES, type City } from "@/lib/marketplace/experiences";
import {
  CAPACITY_BUCKETS,
  CLUB_SORTS,
  FORMATS,
  SPORTS,
  buildClubQuery,
  countActiveClubFilters,
  type ClubFilters,
  type ClubFormat,
  type ClubSort,
  type Sport,
} from "@/lib/clubs/discovery";

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
  filters: ClubFilters;
};

export function ClubsFilters({ filters }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // En mobile, la carte est affichée en premier : les filtres n'ont pas d'intérêt
  // sur la carte → on les masque tant que la liste n'est pas affichée. Sans effet
  // sur desktop (liste + carte côte à côte). On réutilise le contexte de vue partagé.
  const { view } = useMarketplaceView();

  const [open, setOpen] = useState(false);
  const [geolocBusy, setGeolocBusy] = useState(false);
  const [geolocError, setGeolocError] = useState<string | null>(null);

  const activeCount = countActiveClubFilters(filters);

  function commit(next: Partial<ClubFilters>) {
    const merged: ClubFilters = { ...filters, ...next };
    const qs = buildClubQuery(merged);
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function handleSport(id: Sport | null) {
    commit({ sport: filters.sport === id ? null : id });
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
      className={cx("clubs-filters", view === "map" && "clubs-filters--map")}
      style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}
    >
      {/* Barre de chips sport + tri */}
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

        <Chip variant={filters.sport === null ? "solid" : "outline"} onClick={() => handleSport(null)}>
          Tous les sports
        </Chip>
        {SPORTS.map((s) => (
          <Chip
            key={s.id}
            variant={s.id === filters.sport ? "solid" : "outline"}
            onClick={() => handleSport(s.id)}
          >
            {s.label}
          </Chip>
        ))}

        <div style={{ flex: 1 }} />
        <Tabs
          variant="pill"
          items={CLUB_SORTS.map((s) => ({ id: s.id, label: s.label }))}
          active={filters.sort}
          onChange={(id) => commit({ sort: id as ClubSort })}
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

          {/* Format */}
          <Field label="Format">
            <Select
              value={filters.format ?? ""}
              onChange={(v) => commit({ format: (v || null) as ClubFormat | null })}
              options={FORMATS.map((f) => ({ value: f.id, label: f.label }))}
              placeholder="Tous les formats"
              ariaLabel="Choisir un format"
            />
          </Field>

          {/* Capacité */}
          <Field label="Capacité du groupe">
            <Select
              value={filters.minCapacity > 0 ? String(filters.minCapacity) : ""}
              onChange={(v) => commit({ minCapacity: v ? Number(v) : 0 })}
              options={CAPACITY_BUCKETS.map((b) => ({ value: String(b.value), label: b.label }))}
              placeholder="Toutes capacités"
              ariaLabel="Capacité minimale du groupe"
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
