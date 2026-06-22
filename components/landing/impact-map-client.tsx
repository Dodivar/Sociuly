"use client";

// Carte d'impact de la landing — MapLibre GL JS + tuiles OpenFreeMap (cf. lib/map).
// Vue « affichage » (pas la carte de recherche interactive) : elle plote les CLUBS
// partenaires (découverte club-first, SPEC §6 — la géo vit sur `Club.geo`), sous
// forme de pastilles « nom du club » précédées d'une icône du sport, cliquables
// vers la vitrine du club (/clubs/[slug]).
// Anti-chevauchement : comme la carte de découverte /clubs, les clubs trop proches
// au zoom courant sont REGROUPÉS via Supercluster en une pastille « compteur »
// (navy, nombre de clubs). À fort zoom les clusters se défont et chaque club
// retrouve sa pastille ; un clic sur un cluster zoome sur son emprise
// (getClusterExpansionZoom). Même configuration que components/clubs/interactive-map.
// Choix UX : le zoom à la molette est DÉSACTIVÉ (scrollZoom) pour ne pas capturer
// le défilement de la page d'accueil — on garde le pan + les boutons +/−.
// Lazy-loadée côté client uniquement (cf. impact-map.tsx → next/dynamic, ssr:false).

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import Supercluster from "supercluster";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { GRAND_EST_CENTER, GRAND_EST_ZOOM, MAP_STYLE_URL } from "@/lib/map";
import { Icon } from "@/components/ds/icon";
import { SPORT_ICON, SPORT_LABEL, type DiscoveryClub } from "@/lib/clubs/discovery";

// Config de regroupement — alignée sur la carte de découverte /clubs
// (components/clubs/interactive-map.tsx).
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
  | { kind: "leaf"; marker: maplibregl.Marker }
  | { kind: "cluster"; marker: maplibregl.Marker };

// Construit l'élément DOM d'une pastille « club » : icône du sport à gauche du nom,
// lien vers la vitrine du club. `hot` met en avant le club focal (pastille orange + halo).
function createPinElement(club: DiscoveryClub, hot: boolean): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = `/clubs/${club.slug}`;
  link.className = "sy-impact-marker";
  link.setAttribute(
    "aria-label",
    `${club.name} — ${SPORT_LABEL[club.sport]}, ${club.cityRaw}`,
  );

  const pin = document.createElement("span");
  pin.className = "sy-impact-pin";
  pin.style.background = hot ? "var(--accent)" : "var(--surface)";
  pin.style.color = hot ? "#fff" : "var(--ink)";
  pin.style.border = `1.5px solid ${hot ? "var(--accent-deep)" : "var(--ink)"}`;

  // Icône du sport (set Icon maison) — rendue en markup statique pour l'insérer
  // dans le DOM impératif du marqueur MapLibre. `currentColor` suit la couleur du pin.
  const iconWrap = document.createElement("span");
  iconWrap.className = "sy-impact-pin-icon";
  iconWrap.setAttribute("aria-hidden", "true");
  iconWrap.innerHTML = renderToStaticMarkup(
    <Icon name={SPORT_ICON[club.sport]} size={15} color="currentColor" />,
  );

  const label = document.createElement("span");
  label.className = "sy-num sy-impact-pin-label";
  label.textContent = club.name;

  pin.append(iconWrap, label);

  if (hot) {
    const ping = document.createElement("span");
    ping.className = "sy-impact-ping";
    pin.appendChild(ping);
  }

  const tip = document.createElement("span");
  tip.className = "sy-impact-tip";
  tip.setAttribute("role", "tooltip");
  tip.textContent = `${SPORT_LABEL[club.sport]} · ${club.typeLabel}`;

  link.append(pin, tip);
  return link;
}

// Dimensionne un cluster selon le nombre de clubs regroupés (densité lisible d'un
// coup d'œil) — palette DS « stade » (navy), compteur en blanc.
function clusterDiameter(count: number): number {
  if (count < 10) return 38;
  if (count < 25) return 46;
  return 54;
}

// Replie l'attribution OpenFreeMap : MapLibre l'affiche dépliée par défaut en mode
// compact. On retire la classe/attribut d'ouverture pour ne montrer que le bouton ⓘ
// (l'utilisateur peut toujours la déplier d'un clic).
function collapseAttribution(map: maplibregl.Map) {
  const el = map.getContainer().querySelector(".maplibregl-ctrl-attrib");
  if (el) {
    el.classList.remove("maplibregl-compact-show");
    el.removeAttribute("open");
  }
}

export function ImpactMapClient({
  clubs,
  style,
}: {
  clubs: DiscoveryClub[];
  style?: CSSProperties;
}) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Index spatial Supercluster (reconstruit quand la liste de clubs change).
  const superRef = useRef<Supercluster<ClubPointProps> | null>(null);
  // Markers MapLibre visibles, indexés par clé (`leaf:<id>` ou `cluster:<id>`).
  const markersRef = useRef<Map<string, MarkerEntry>>(new Map());
  // Conserve la dernière liste de clubs sans relancer l'init MapLibre.
  const clubsRef = useRef(clubs);
  clubsRef.current = clubs;
  // Club focal (le plus d'expériences) — mis en avant en pastille orange + halo.
  const hotIdRef = useRef<string | null>(null);
  // Ref « live » lue par syncMarkers (appelé hors cycle React, sur moveend).
  const syncRef = useRef<() => void>(() => {});

  const [ready, setReady] = useState(false);

  // Construit l'élément DOM d'un cluster : clic → zoom sur l'emprise du cluster.
  function createClusterElement(lng: number, lat: number, count: number, clusterId: number): HTMLButtonElement {
    const d = clusterDiameter(count);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sy-num sy-impact-cluster";
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
  // Appelée à l'init, sur `moveend`, et à chaque changement de la liste de clubs.
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
        if (!store.has(key)) {
          const club = clubsRef.current.find((c) => c.id === clubId);
          if (!club) continue;
          const el = createPinElement(club, club.id === hotIdRef.current);
          const marker = new maplibregl.Marker({ element: el, anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(map);
          store.set(key, { kind: "leaf", marker });
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
      scrollZoom: false, // ne pas piéger le scroll de la page
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Les pastilles/clusters sont des markers DOM positionnés par projection :
    // `styledata` (style parsé) suffit à les projeter. setReady est idempotent.
    map.once("styledata", () => setReady(true));
    map.on("load", () => {
      setReady(true);
      // L'attribution compacte s'ouvre dépliée par défaut → on la replie.
      collapseAttribution(map);
    });
    // Repli aussi après un resize (MapLibre peut re-déplier l'attribution).
    map.on("resize", () => collapseAttribution(map));
    // Re-clusterise une fois le geste terminé (pattern Supercluster standard).
    map.on("moveend", () => syncRef.current());

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // ─── (Re)construit l'index Supercluster et resynchronise les markers ───
  // Déclenché quand la liste de clubs change ou dès que la carte est prête.
  useEffect(() => {
    if (!ready) return;
    const list = clubs;
    // Club focal = celui qui propose le plus d'expériences (point premium mis en avant).
    hotIdRef.current = list.length
      ? list.reduce((a, b) => (b.experienceCount > a.experienceCount ? b : a)).id
      : null;

    const points: Array<Supercluster.PointFeature<ClubPointProps>> = list.map((c) => ({
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

  // Statistiques de l'encart, dérivées des clubs réellement affichés.
  const cityCount = new Set(clubs.map((c) => c.city)).size;

  return (
    <div
      style={{
        position: "relative", borderRadius: "var(--radius-lg)", overflow: "hidden",
        background: "var(--surface-2)", ...style,
      }}
    >
      <div ref={mapNodeRef} style={{ position: "absolute", inset: 0 }} />

      <style>{`
        @keyframes sy-ping { 0% { transform: scale(1); opacity: .6 } 100% { transform: scale(1.7); opacity: 0 } }
        .sy-impact-marker { display: block; text-decoration: none; cursor: pointer; }
        .sy-impact-marker:focus-visible { outline: 3px solid var(--ring); outline-offset: 3px; border-radius: 999px; }
        .sy-impact-pin {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px; border-radius: 999px;
          font-family: var(--display); font-weight: 700; font-size: 13px;
          font-variation-settings: var(--display-var); white-space: nowrap;
          box-shadow: 0 4px 12px rgba(20,36,31,.25); position: relative;
          transition: transform .16s ease;
        }
        .sy-impact-pin-icon { display: inline-flex; flex: 0 0 auto; }
        .sy-impact-pin-label { line-height: 1; }
        .sy-impact-marker:hover .sy-impact-pin,
        .sy-impact-marker:focus-visible .sy-impact-pin { transform: scale(1.08); }
        .sy-impact-cluster:hover { transform: scale(1.08); }
        .sy-impact-cluster:focus-visible { outline: 3px solid var(--ring); outline-offset: 3px; }
        .sy-impact-ping {
          position: absolute; inset: -6px; border-radius: 999px;
          border: 2px solid var(--accent); opacity: .4;
          animation: sy-ping 2s ease-out infinite; pointer-events: none;
        }
        .sy-impact-tip {
          position: absolute; top: calc(100% + 8px); left: 50%;
          transform: translateX(-50%) translateY(-4px);
          background: var(--ink); color: var(--surface);
          font-family: var(--mono); font-size: 11px; letter-spacing: .02em;
          padding: 6px 10px; border-radius: 8px; white-space: nowrap;
          opacity: 0; pointer-events: none; z-index: 7;
          box-shadow: var(--shadow-md);
          transition: opacity .16s ease, transform .16s ease;
        }
        .sy-impact-marker:hover .sy-impact-tip,
        .sy-impact-marker:focus-visible .sy-impact-tip {
          opacity: 1; transform: translateX(-50%) translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .sy-impact-pin, .sy-impact-tip, .sy-impact-cluster { transition: none; }
          .sy-impact-ping { animation: none; }
        }
      `}</style>

      {/* Encart « clubs près de vous » (superposé, conserve le DS) */}
      <div style={{ position: "absolute", left: 16, bottom: 16, right: 16, pointerEvents: "none" }}>
        <div
          className="sy-card"
          style={{
            background: "rgba(252,249,241,.95)", backdropFilter: "blur(12px)",
            padding: 14, borderRadius: "var(--radius-md)",
          }}
        >
          <div className="sy-mono">Clubs près de vous</div>
          <div className="sy-h3 sy-num" style={{ marginTop: 4 }}>
            {clubs.length} {clubs.length > 1 ? "clubs" : "club"} · {cityCount}{" "}
            {cityCount > 1 ? "villes" : "ville"}
          </div>
        </div>
      </div>
    </div>
  );
}
