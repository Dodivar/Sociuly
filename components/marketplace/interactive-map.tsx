"use client";

// Carte marketplace interactive — MapLibre GL JS + tuiles MapTiler (SPEC §1).
// Markers cliquables (pastille prix), synchro hover liste ↔ carte, popup mini-card.
// Centrée par défaut sur la région Grand-Est ; recadrage automatique sur la
// position de l'utilisateur si la géolocalisation est déjà autorisée.
// Lazy-loadée côté client uniquement (cf. results.tsx → next/dynamic, ssr:false) :
// MapLibre a besoin de `window` et alourdit le bundle.

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ds/icon";
import { Stars } from "@/components/ds/components";
import type { MarketplaceExperience } from "@/lib/marketplace/experiences";

type Props = {
  experiences: MarketplaceExperience[];
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  style?: CSSProperties;
};

// ─── Vue par défaut : région Grand-Est (couvre Strasbourg, Nancy, Metz) ───
const GRAND_EST_CENTER: [number, number] = [6.2, 48.7]; // [lng, lat]
const GRAND_EST_ZOOM = 7;

// Style des tuiles : MapTiler en prod (clé via env). Sans clé (dev/CI), on
// retombe sur un fond raster OpenStreetMap pour que la carte reste fonctionnelle.
// TODO(map): retirer le fallback OSM une fois NEXT_PUBLIC_MAPTILER_KEY provisionnée.
const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

const OSM_FALLBACK_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const MAP_STYLE: string | maplibregl.StyleSpecification = MAPTILER_KEY
  ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`
  : OSM_FALLBACK_STYLE;

// Applique le style de la pastille prix selon son état (actif = survol/sélection).
function styleMarkerPill(pill: HTMLButtonElement, active: boolean) {
  pill.style.transform = `scale(${active ? 1.12 : 1})`;
  pill.style.background = active ? "var(--accent)" : "var(--surface)";
  pill.style.color = active ? "#fff" : "var(--ink)";
  pill.style.border = `1.5px solid ${active ? "var(--accent-deep)" : "var(--ink)"}`;
  pill.style.boxShadow = active ? "var(--shadow-md)" : "0 4px 12px rgba(11,21,48,.18)";
  pill.style.zIndex = active ? "5" : "2";
}

export function InteractiveMarketMap({
  experiences,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
  style,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Markers MapLibre indexés par id d'expérience (pour synchro hover/select).
  const markersRef = useRef<Map<string, { marker: maplibregl.Marker; pill: HTMLButtonElement }>>(
    new Map(),
  );
  // Refs sur les callbacks pour éviter de recréer les markers à chaque rendu.
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  onHoverRef.current = onHover;
  onSelectRef.current = onSelect;

  const [ready, setReady] = useState(false);
  // Incrémenté à chaque déplacement de carte : force le recalcul de la position
  // (en pixels) du popup React superposé.
  const [, setTick] = useState(0);

  const selected = experiences.find((x) => x.id === selectedId) ?? null;

  // ─── Init MapLibre (une seule fois) ───
  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapNodeRef.current,
      style: MAP_STYLE,
      center: GRAND_EST_CENTER,
      zoom: GRAND_EST_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Contrôle de géolocalisation natif (bouton « cible » + point bleu).
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: false, timeout: 8000 },
      trackUserLocation: false,
      showUserLocation: true,
    });
    map.addControl(geolocate, "top-right");

    map.on("load", () => {
      setReady(true);
      // « Si la géoloc est active » : on ne déclenche le recadrage que si la
      // permission est DÉJÀ accordée, pour ne pas afficher de prompt intrusif.
      // Sinon on reste sur la vue Grand-Est par défaut.
      navigator.permissions
        ?.query({ name: "geolocation" })
        .then((res) => {
          if (res.state === "granted") geolocate.trigger();
        })
        .catch(() => {
          /* Permissions API indisponible — on garde la vue Grand-Est. */
        });
    });

    // Repositionne le popup React superposé pendant les déplacements/zoom.
    const bump = () => setTick((t) => t + 1);
    map.on("move", bump);

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // ─── Synchronise les markers avec la liste filtrée ───
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const store = markersRef.current;
    const nextIds = new Set(experiences.map((x) => x.id));

    // Retire les markers qui ne sont plus dans les résultats.
    for (const [id, entry] of store) {
      if (!nextIds.has(id)) {
        entry.marker.remove();
        store.delete(id);
      }
    }

    // Ajoute / met à jour les markers présents.
    for (const x of experiences) {
      const existing = store.get(x.id);
      if (existing) {
        existing.pill.textContent = `€${x.price}`;
        existing.marker.setLngLat([x.lng, x.lat]);
        continue;
      }

      // Racine positionnée par MapLibre ; la pastille interne porte le scale.
      const root = document.createElement("div");
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "sy-num";
      pill.setAttribute("aria-label", `${x.title} — €${x.price}`);
      pill.textContent = `€${x.price}`;
      Object.assign(pill.style, {
        padding: "7px 14px",
        borderRadius: "999px",
        fontFamily: "var(--display)",
        fontWeight: "700",
        fontSize: "13px",
        fontVariationSettings: "var(--display-var)",
        whiteSpace: "nowrap",
        cursor: "pointer",
        transition: "transform .15s ease, background .15s ease, color .15s ease",
      } satisfies Partial<CSSStyleDeclaration>);
      styleMarkerPill(pill, false);

      pill.addEventListener("mouseenter", () => onHoverRef.current(x.id));
      pill.addEventListener("mouseleave", () => onHoverRef.current(null));
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(x.id);
      });
      root.appendChild(pill);

      const marker = new maplibregl.Marker({ element: root, anchor: "center" })
        .setLngLat([x.lng, x.lat])
        .addTo(map);
      store.set(x.id, { marker, pill });
    }
  }, [experiences, ready]);

  // ─── Reflète l'état hover/select sur les pastilles ───
  useEffect(() => {
    for (const [id, entry] of markersRef.current) {
      styleMarkerPill(entry.pill, id === hoveredId || id === selectedId);
    }
  }, [hoveredId, selectedId, experiences]);

  // Position en pixels du popup superposé (recalculée à chaque move via `tick`).
  const popupPoint =
    selected && mapRef.current && ready
      ? mapRef.current.project([selected.lng, selected.lat])
      : null;

  return (
    <div ref={wrapRef} style={{ position: "relative", height: "100%", overflow: "hidden", ...style }}>
      <div ref={mapNodeRef} style={{ position: "absolute", inset: 0 }} />

      {ready && experiences.length === 0 && (
        <div
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", padding: 24, textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            className="sy-mono sy-muted sy-card"
            style={{ padding: "10px 16px", borderRadius: "var(--radius-md)" }}
          >
            Aucune expérience sur la carte pour ces filtres.
          </div>
        </div>
      )}

      {/* Popup mini-card du marker sélectionné (superposition React → DS conservé) */}
      {selected && popupPoint && (
        <div
          style={{
            position: "absolute",
            left: popupPoint.x,
            top: popupPoint.y,
            transform: "translate(-50%, calc(-100% - 22px))",
            zIndex: 10,
            width: 248,
          }}
          onMouseEnter={() => onHover(selected.id)}
          onMouseLeave={() => onHover(null)}
        >
          <div
            className="sy-card sy-card-elevated"
            style={{ padding: 12, borderRadius: "var(--radius-md)", position: "relative" }}
          >
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => onSelect(null)}
              className="sy-btn sy-btn-soft sy-btn-icon-sm"
              style={{ position: "absolute", top: 8, right: 8 }}
            >
              <Icon name="close" size={12} />
            </button>
            <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>{selected.club}</div>
            <Link href={`/experiences/${selected.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="sy-h4" style={{ marginTop: 2, paddingRight: 20 }}>{selected.title}</div>
            </Link>
            <div
              className="sy-small sy-muted"
              style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
            >
              <Icon name="pin" size={12} color="var(--ink-3)" />
              <span>{selected.distanceKm} km</span>
              <span>·</span>
              <Stars value={selected.rating} size={11} />
              <span className="sy-mono" style={{ fontSize: 10 }}>
                {selected.rating} ({selected.reviews})
              </span>
            </div>
            <div
              style={{
                marginTop: 10, display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 8,
              }}
            >
              <div className="sy-num" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18 }}>
                €{selected.price}
                <span className="sy-mono" style={{ fontSize: 10, marginLeft: 4 }}>à partir de</span>
              </div>
              <Link href={`/experiences/${selected.slug}`} style={{ textDecoration: "none" }}>
                <span className="sy-btn sy-btn-primary sy-btn-sm" style={{ borderRadius: 999 }}>
                  Voir <Icon name="arrow" size={12} color="#fff" />
                </span>
              </Link>
            </div>
          </div>
          {/* Pointe du popup */}
          <div
            style={{
              position: "absolute", left: "50%", bottom: -7, transform: "translateX(-50%) rotate(45deg)",
              width: 14, height: 14, background: "var(--surface)",
              borderRight: "1px solid var(--line)", borderBottom: "1px solid var(--line)",
            }}
          />
        </div>
      )}
    </div>
  );
}
