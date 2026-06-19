"use client";

// Carte de découverte club-first (/clubs) — MapLibre GL JS + tuiles OpenFreeMap.
// Plote des CLUBS (la géo vit sur Club.geo, SPEC §6) : marker = pastille initiales,
// popup = mini-fiche club. Synchro hover/select liste ↔ carte. Centrée Grand-Est ;
// recadrage auto sur la position si la géolocalisation est déjà autorisée.
//
// Anti-chevauchement : les clubs proches (plusieurs par ville au zoom Grand-Est)
// sont REGROUPÉS via Supercluster. À fort zoom les clusters se défont et chaque
// club retrouve sa pastille. Un clic sur un cluster zoome sur son emprise
// (getClusterExpansionZoom). Clusters ET pastilles restent des <button> DOM
// (navigables au clavier — WCAG AA, cf. CLAUDE.md §7), contrairement à un rendu
// en layer canvas natif qui aurait cassé l'accessibilité et la synchro liste.
// Lazy-loadée côté client uniquement (cf. results.tsx → next/dynamic, ssr:false).

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";
import Link from "next/link";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ds/icon";
import { Stars } from "@/components/ds/components";
import { GRAND_EST_CENTER, GRAND_EST_ZOOM, MAP_STYLE_URL } from "@/lib/map";
import { SPORT_LABEL, SPORT_ICON, type DiscoveryClub } from "@/lib/clubs/discovery";

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

// Zoom max auquel Supercluster regroupe encore : au-delà, chaque club est isolé.
const CLUSTER_MAX_ZOOM = 16;
// Rayon de regroupement (px) : assez large pour dégrouper les villes du Grand-Est,
// assez serré pour séparer dès qu'on distingue les clubs.
const CLUSTER_RADIUS = 56;

// Propriétés portées par chaque point dans l'index Supercluster.
type ClubPointProps = { clubId: string };

// Une entrée du registre de markers : soit une pastille « club » (feuille), soit
// un cluster. Les deux sont des markers MapLibre à élément DOM.
type MarkerEntry =
  | { kind: "leaf"; clubId: string; marker: maplibregl.Marker; pill: HTMLButtonElement }
  | { kind: "cluster"; marker: maplibregl.Marker };

// Applique le style de la pastille feuille selon son état (actif = survol/sélection).
function styleMarkerPill(pill: HTMLButtonElement, active: boolean) {
  pill.style.transform = `scale(${active ? 1.12 : 1})`;
  pill.style.background = active ? "var(--accent)" : "var(--surface)";
  pill.style.color = active ? "#fff" : "var(--primary)";
  pill.style.border = `1.5px solid ${active ? "var(--accent-deep)" : "var(--ink)"}`;
  pill.style.boxShadow = active ? "var(--shadow-md)" : "0 4px 12px rgba(11,21,48,.18)";
  pill.style.zIndex = active ? "6" : "2";
}

// Dimensionne un cluster selon le nombre de clubs regroupés (densité lisible d'un
// coup d'œil) — palette DS « stade » (navy), compteur en blanc.
function clusterDiameter(count: number): number {
  if (count < 10) return 38;
  if (count < 25) return 46;
  return 54;
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
  // Index spatial Supercluster (reconstruit quand la liste de clubs change).
  const superRef = useRef<Supercluster<ClubPointProps> | null>(null);
  // Markers MapLibre visibles, indexés par clé (`leaf:<id>` ou `cluster:<id>`).
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  // Refs « live » lues par syncMarkers (appelé hors cycle React, sur moveend) :
  // garantit que les markers reconstruits reflètent l'état/les handlers courants.
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  const clubsRef = useRef(clubs);
  const hoveredIdRef = useRef(hoveredId);
  const selectedIdRef = useRef(selectedId);
  const syncRef = useRef<() => void>(() => {});
  onHoverRef.current = onHover;
  onSelectRef.current = onSelect;
  clubsRef.current = clubs;
  hoveredIdRef.current = hoveredId;
  selectedIdRef.current = selectedId;

  const [ready, setReady] = useState(false);
  // Incrémenté à chaque déplacement : force le recalcul de la position du popup.
  const [, setTick] = useState(0);

  const selected = clubs.find((c) => c.id === selectedId) ?? null;

  // Construit l'élément DOM d'une pastille « club » (feuille) + ses handlers.
  function createLeafElement(club: DiscoveryClub): { root: HTMLDivElement; pill: HTMLButtonElement } {
    const root = document.createElement("div");
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "sy-num";
    pill.setAttribute("aria-label", `${club.name} — ${SPORT_LABEL[club.sport]}`);

    // Icône du sport (set Icon maison) à gauche des initiales. `currentColor`
    // suit la couleur du pill, qui bascule au survol/sélection (styleMarkerPill).
    const ic = document.createElement("span");
    ic.setAttribute("aria-hidden", "true");
    ic.style.display = "inline-flex";
    ic.innerHTML = renderToStaticMarkup(
      <Icon name={SPORT_ICON[club.sport]} size={14} color="currentColor" />,
    );
    const txt = document.createElement("span");
    txt.textContent = club.initials;
    pill.append(ic, txt);
    Object.assign(pill.style, {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "5px",
      minWidth: "34px",
      height: "34px",
      padding: "0 9px",
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

    pill.addEventListener("mouseenter", () => onHoverRef.current(club.id));
    pill.addEventListener("mouseleave", () => onHoverRef.current(null));
    pill.addEventListener("click", (e) => {
      e.stopPropagation();
      onSelectRef.current(club.id);
    });
    root.appendChild(pill);
    return { root, pill };
  }

  // Construit l'élément DOM d'un cluster : clic → zoom sur l'emprise du cluster.
  function createClusterElement(lng: number, lat: number, count: number, clusterId: number): HTMLButtonElement {
    const d = clusterDiameter(count);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sy-num clubs-cluster";
    btn.textContent = String(count);
    btn.setAttribute("aria-label", `${count} clubs regroupés — cliquer pour agrandir la zone`);
    Object.assign(btn.style, {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: `${d}px`,
      height: `${d}px`,
      borderRadius: "999px",
      background: "var(--primary)",
      color: "#fff",
      border: "2px solid var(--surface)",
      fontFamily: "var(--display)",
      fontWeight: "700",
      fontSize: count < 100 ? "14px" : "12px",
      fontVariationSettings: "var(--display-var)",
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(11,21,48,.28)",
      transition: "transform .15s ease",
      zIndex: "3",
    } satisfies Partial<CSSStyleDeclaration>);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const map = mapRef.current;
      const index = superRef.current;
      if (!map || !index) return;
      const expansionZoom = index.getClusterExpansionZoom(clusterId);
      // Garantit une progression visible même si l'expansion théorique est faible.
      map.easeTo({
        center: [lng, lat],
        zoom: Math.max(expansionZoom, map.getZoom() + 0.8),
        duration: 420,
      });
    });
    return btn;
  }

  // Recalcule les clusters pour la fenêtre courante et réconcilie les markers.
  // Appelée à l'init, sur `moveend`, et à chaque changement de la liste filtrée.
  function syncMarkers() {
    const map = mapRef.current;
    const index = superRef.current;
    if (!map || !index || !ready) return;

    const b = map.getBounds();
    const bbox: [number, number, number, number] = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    const zoom = Math.round(map.getZoom());
    const features = index.getClusters(bbox, zoom);

    const store = markersRef.current;
    const desired = new Set<string>();

    for (const feature of features) {
      const [lng, lat] = feature.geometry.coordinates;
      const props = feature.properties;

      if ("cluster" in props && props.cluster) {
        const key = `cluster:${props.cluster_id}`;
        desired.add(key);
        if (!store.has(key)) {
          const el = createClusterElement(lng, lat, props.point_count, props.cluster_id);
          const marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(map);
          store.set(key, { kind: "cluster", marker });
        }
      } else {
        const clubId = (props as ClubPointProps).clubId;
        const key = `leaf:${clubId}`;
        desired.add(key);
        const existing = store.get(key);
        if (existing && existing.kind === "leaf") {
          existing.marker.setLngLat([lng, lat]);
        } else {
          const club = clubsRef.current.find((c) => c.id === clubId);
          if (!club) continue;
          const { root, pill } = createLeafElement(club);
          const marker = new maplibregl.Marker({ element: root, anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(map);
          store.set(key, { kind: "leaf", clubId, marker, pill });
        }
      }
    }

    // Retire les markers qui ne sont plus dans la fenêtre / le niveau de zoom.
    for (const [key, entry] of store) {
      if (!desired.has(key)) {
        entry.marker.remove();
        store.delete(key);
      }
    }

    // Reflète l'état hover/select sur les pastilles fraîchement (re)montées.
    for (const entry of store.values()) {
      if (entry.kind === "leaf") {
        styleMarkerPill(entry.pill, entry.clubId === hoveredIdRef.current || entry.clubId === selectedIdRef.current);
      }
    }
  }
  syncRef.current = syncMarkers;

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

    // Les pastilles/clusters sont des markers DOM, positionnés par projection :
    // ils n'ont pas besoin du premier rendu GL. On déclenche donc `ready` dès que
    // le style est parsé (`styledata`), ce qui suffit à projeter. `load` (qui
    // attend le premier rendu) reste le déclencheur principal et porte, lui, le
    // recadrage géoloc. setReady est idempotent (React ignore une valeur égale).
    map.once("styledata", () => setReady(true));
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
    // Re-clusterise une fois le geste terminé (pattern Supercluster standard :
    // pendant le geste les markers restent ancrés à leur lnglat, on regroupe au repos).
    map.on("moveend", () => syncRef.current());

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // ─── (Re)construit l'index Supercluster et resynchronise les markers ───
  // Déclenché quand la liste filtrée change ou dès que la carte est prête.
  useEffect(() => {
    if (!ready) return;
    const points: Array<Supercluster.PointFeature<ClubPointProps>> = clubs.map((c) => ({
      type: "Feature",
      properties: { clubId: c.id },
      geometry: { type: "Point", coordinates: [c.lng, c.lat] },
    }));
    superRef.current = new Supercluster<ClubPointProps>({
      radius: CLUSTER_RADIUS,
      maxZoom: CLUSTER_MAX_ZOOM,
    }).load(points);
    syncRef.current();
  }, [clubs, ready]);

  // ─── Reflète l'état hover/select sur les pastilles feuilles visibles ───
  useEffect(() => {
    for (const entry of markersRef.current.values()) {
      if (entry.kind === "leaf") {
        styleMarkerPill(entry.pill, entry.clubId === hoveredId || entry.clubId === selectedId);
      }
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

      <style>{`
        .clubs-cluster:hover { transform: scale(1.08); }
        .clubs-cluster:focus-visible { outline: 3px solid var(--ring); outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) {
          .clubs-cluster { transition: none; }
        }
      `}</style>

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
