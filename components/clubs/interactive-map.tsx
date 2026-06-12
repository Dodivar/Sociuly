"use client";

// Carte de découverte club-first (/clubs) — MapLibre GL JS + tuiles OpenFreeMap.
// Plote des CLUBS (la géo vit sur Club.geo, SPEC §6) : marker = pastille initiales,
// popup = mini-fiche club. Synchro hover/select liste ↔ carte. Centrée Grand-Est ;
// recadrage auto sur la position si la géolocalisation est déjà autorisée.
// Lazy-loadée côté client uniquement (cf. results.tsx → next/dynamic, ssr:false).

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ds/icon";
import { Stars } from "@/components/ds/components";
import { GRAND_EST_CENTER, GRAND_EST_ZOOM, MAP_STYLE_URL } from "@/lib/map";
import { SPORT_LABEL, type DiscoveryClub } from "@/lib/clubs/discovery";

type Props = {
  clubs: DiscoveryClub[];
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string | null) => void;
  // En mobile la carte est masquée (display:none) quand on bascule sur la liste :
  // au retour, MapLibre doit recalculer ses dimensions (conteneur ré-affiché).
  visible?: boolean;
  style?: CSSProperties;
};

// Applique le style de la pastille selon son état (actif = survol/sélection).
function styleMarkerPill(pill: HTMLButtonElement, active: boolean) {
  pill.style.transform = `scale(${active ? 1.12 : 1})`;
  pill.style.background = active ? "var(--accent)" : "var(--surface)";
  pill.style.color = active ? "#fff" : "var(--primary)";
  pill.style.border = `1.5px solid ${active ? "var(--accent-deep)" : "var(--ink)"}`;
  pill.style.boxShadow = active ? "var(--shadow-md)" : "0 4px 12px rgba(11,21,48,.18)";
  pill.style.zIndex = active ? "6" : "2";
}

export function InteractiveClubsMap({
  clubs,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
  visible = true,
  style,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Markers MapLibre indexés par id de club (pour synchro hover/select).
  const markersRef = useRef<Map<string, { marker: maplibregl.Marker; pill: HTMLButtonElement }>>(
    new Map(),
  );
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  onHoverRef.current = onHover;
  onSelectRef.current = onSelect;

  const [ready, setReady] = useState(false);
  // Incrémenté à chaque déplacement : force le recalcul de la position du popup.
  const [, setTick] = useState(0);

  const selected = clubs.find((c) => c.id === selectedId) ?? null;

  // ─── Init MapLibre (une seule fois) ───
  useEffect(() => {
    if (!mapNodeRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapNodeRef.current,
      style: MAP_STYLE_URL,
      center: GRAND_EST_CENTER,
      zoom: GRAND_EST_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: false, timeout: 8000 },
      trackUserLocation: false,
      showUserLocation: true,
    });
    map.addControl(geolocate, "top-right");

    map.on("load", () => {
      setReady(true);
      // On ne déclenche le recadrage que si la permission est DÉJÀ accordée
      // (pas de prompt intrusif). Sinon on reste sur la vue Grand-Est.
      navigator.permissions
        ?.query({ name: "geolocation" })
        .then((res) => {
          if (res.state === "granted") geolocate.trigger();
        })
        .catch(() => {
          /* Permissions API indisponible — vue Grand-Est par défaut. */
        });
    });

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
    const nextIds = new Set(clubs.map((c) => c.id));

    for (const [id, entry] of store) {
      if (!nextIds.has(id)) {
        entry.marker.remove();
        store.delete(id);
      }
    }

    for (const c of clubs) {
      const existing = store.get(c.id);
      if (existing) {
        existing.pill.textContent = c.initials;
        existing.pill.setAttribute("aria-label", `${c.name} — ${SPORT_LABEL[c.sport]}`);
        existing.marker.setLngLat([c.lng, c.lat]);
        continue;
      }

      const root = document.createElement("div");
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "sy-num";
      pill.textContent = c.initials;
      pill.setAttribute("aria-label", `${c.name} — ${SPORT_LABEL[c.sport]}`);
      Object.assign(pill.style, {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "34px",
        height: "34px",
        padding: "0 8px",
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

      pill.addEventListener("mouseenter", () => onHoverRef.current(c.id));
      pill.addEventListener("mouseleave", () => onHoverRef.current(null));
      pill.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(c.id);
      });
      root.appendChild(pill);

      const marker = new maplibregl.Marker({ element: root, anchor: "center" })
        .setLngLat([c.lng, c.lat])
        .addTo(map);
      store.set(c.id, { marker, pill });
    }
  }, [clubs, ready]);

  // ─── Reflète l'état hover/select sur les pastilles ───
  useEffect(() => {
    for (const [id, entry] of markersRef.current) {
      styleMarkerPill(entry.pill, id === hoveredId || id === selectedId);
    }
  }, [hoveredId, selectedId, clubs]);

  // Recalcule les dimensions quand la carte redevient visible (toggle mobile).
  useEffect(() => {
    if (visible && ready) {
      requestAnimationFrame(() => mapRef.current?.resize());
    }
  }, [visible, ready]);

  const popupPoint =
    selected && mapRef.current && ready
      ? mapRef.current.project([selected.lng, selected.lat])
      : null;

  return (
    <div ref={wrapRef} style={{ position: "relative", height: "100%", overflow: "hidden", ...style }}>
      <div ref={mapNodeRef} style={{ position: "absolute", inset: 0 }} />

      {ready && clubs.length === 0 && (
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
            Aucun club sur la carte pour ces filtres.
          </div>
        </div>
      )}

      {/* Popup mini-fiche du club sélectionné (superposition React → DS conservé) */}
      {selected && popupPoint && (
        <div
          style={{
            position: "absolute",
            left: popupPoint.x,
            top: popupPoint.y,
            transform: "translate(-50%, calc(-100% - 24px))",
            zIndex: 10,
            width: 252,
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
            <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>
              {SPORT_LABEL[selected.sport]} · {selected.typeLabel}
            </div>
            <Link href={`/clubs/${selected.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div className="sy-h4" style={{ marginTop: 2, paddingRight: 20 }}>{selected.name}</div>
            </Link>
            <div
              className="sy-small sy-muted"
              style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}
            >
              <Icon name="pin" size={12} color="var(--ink-3)" />
              <span>{selected.cityRaw} · {selected.distanceKm} km</span>
              {selected.reviews > 0 && (
                <>
                  <span>·</span>
                  <Stars value={selected.rating} size={11} />
                  <span className="sy-mono" style={{ fontSize: 10 }}>
                    {selected.rating.toFixed(1)} ({selected.reviews})
                  </span>
                </>
              )}
            </div>
            <div
              style={{
                marginTop: 10, display: "flex", alignItems: "center",
                justifyContent: "space-between", gap: 8,
              }}
            >
              <div className="sy-small" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Icon name="sparkle" size={12} color="var(--accent-deep)" />
                <span className="sy-h4">
                  {selected.experienceCount} {selected.experienceCount > 1 ? "expériences" : "expérience"}
                </span>
              </div>
              <Link href={`/clubs/${selected.slug}`} style={{ textDecoration: "none" }}>
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
