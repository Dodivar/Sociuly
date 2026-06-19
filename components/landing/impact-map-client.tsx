"use client";

// Carte d'impact de la landing — MapLibre GL JS + tuiles OpenFreeMap (cf. lib/map).
// Vue « affichage » (pas la carte de recherche interactive) : elle plote les CLUBS
// partenaires (découverte club-first, SPEC §6 — la géo vit sur `Club.geo`), sous
// forme de pastilles « nom du club » précédées d'une icône du sport, cliquables
// vers la vitrine du club (/clubs/[slug]).
// Choix UX : le zoom à la molette est DÉSACTIVÉ (scrollZoom) pour ne pas capturer
// le défilement de la page d'accueil — on garde le pan + les boutons +/−.
// Lazy-loadée côté client uniquement (cf. impact-map.tsx → next/dynamic, ssr:false).

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect, useRef, type CSSProperties } from "react";
import { GRAND_EST_CENTER, GRAND_EST_ZOOM, MAP_STYLE_URL } from "@/lib/map";
import { Icon } from "@/components/ds/icon";
import { SPORT_ICON, SPORT_LABEL, type DiscoveryClub } from "@/lib/clubs/discovery";

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

export function ImpactMapClient({
  clubs,
  style,
}: {
  clubs: DiscoveryClub[];
  style?: CSSProperties;
}) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  // Conserve la dernière liste de clubs sans relancer l'init MapLibre.
  const clubsRef = useRef(clubs);
  clubsRef.current = clubs;

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

    const list = clubsRef.current;
    // Club focal = celui qui propose le plus d'expériences (point premium mis en avant).
    const hotId = list.length
      ? list.reduce((a, b) => (b.experienceCount > a.experienceCount ? b : a)).id
      : null;

    for (const club of list) {
      new maplibregl.Marker({ element: createPinElement(club, club.id === hotId), anchor: "center" })
        .setLngLat([club.lng, club.lat])
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
          .sy-impact-pin, .sy-impact-tip { transition: none; }
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
