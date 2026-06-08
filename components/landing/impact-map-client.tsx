"use client";

// Carte d'impact de la landing — MapLibre GL JS + tuiles OpenFreeMap (cf. lib/map).
// Vue « affichage » (pas la carte de recherche) : pastilles « % collecté » par club
// à travers les 3 villes pilotes, cliquables vers la marketplace filtrée par ville.
// Choix UX : le zoom à la molette est DÉSACTIVÉ (scrollZoom) pour ne pas capturer
// le défilement de la page d'accueil — on garde le pan + les boutons +/−.
// Lazy-loadée côté client uniquement (cf. impact-map.tsx → next/dynamic, ssr:false).

import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, type CSSProperties } from "react";
import { GRAND_EST_CENTER, GRAND_EST_ZOOM, MAP_STYLE_URL } from "@/lib/map";
import { CITY_LABEL, type City } from "@/lib/marketplace/experiences";

// Clubs mis en avant sur la carte d'impact (mock — sera dérivé de Project.collectedAmount
// / targetAmount + Club.geo). `pct` = part du projet de saison déjà financée.
const CLUBS: Array<{
  lng: number; lat: number; pct: number; label: string; city: City; hot?: boolean;
}> = [
  { lng: 7.7455, lat: 48.5839, pct: 92, label: "SIG Strasbourg", city: "strasbourg", hot: true },
  { lng: 7.7905, lat: 48.6012, pct: 55, label: "RC Strasbourg", city: "strasbourg" },
  { lng: 6.1844, lat: 48.6921, pct: 68, label: "SLUC Nancy Basket", city: "nancy" },
  { lng: 6.1700, lat: 48.6600, pct: 18, label: "FC Nancy-Sud", city: "nancy" },
  { lng: 6.1757, lat: 49.1193, pct: 32, label: "Metz Basket Métropole", city: "metz" },
];

// Construit l'élément DOM d'une pastille (lien vers la marketplace filtrée par ville).
function createPinElement(club: (typeof CLUBS)[number]): HTMLAnchorElement {
  const r = club.hot ? 34 : club.pct >= 50 ? 28 : 22;

  const link = document.createElement("a");
  link.href = `/experiences?ville=${club.city}`;
  link.className = "sy-impact-marker";
  link.setAttribute(
    "aria-label",
    `Voir les expériences à ${CITY_LABEL[club.city]} — ${club.label}, ${club.pct}% collectés`,
  );

  const pin = document.createElement("span");
  pin.className = "sy-impact-pin";
  pin.textContent = `${club.pct}%`;
  Object.assign(pin.style, {
    width: `${r}px`,
    height: `${r}px`,
    fontSize: r < 26 ? "9px" : "11px",
    background: club.hot ? "var(--accent)" : "var(--primary)",
  } satisfies Partial<CSSStyleDeclaration>);

  if (club.hot) {
    const ping = document.createElement("span");
    ping.className = "sy-impact-ping";
    pin.appendChild(ping);
  }

  const tip = document.createElement("span");
  tip.className = "sy-impact-tip";
  tip.setAttribute("role", "tooltip");
  tip.textContent = `${club.label} · ${CITY_LABEL[club.city]}`;

  link.append(pin, tip);
  return link;
}

export function ImpactMapClient({ style }: { style?: CSSProperties }) {
  const mapNodeRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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

    for (const club of CLUBS) {
      new maplibregl.Marker({ element: createPinElement(club), anchor: "center" })
        .setLngLat([club.lng, club.lat])
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

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
        .sy-impact-marker:focus-visible { outline: 3px solid var(--ring); outline-offset: 3px; border-radius: 50%; }
        .sy-impact-pin {
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; color: #fff;
          font-family: var(--display); font-weight: 700;
          box-shadow: 0 4px 12px rgba(20,36,31,.25); position: relative;
          transition: transform .16s ease;
        }
        .sy-impact-marker:hover .sy-impact-pin,
        .sy-impact-marker:focus-visible .sy-impact-pin { transform: scale(1.12); }
        .sy-impact-ping {
          position: absolute; inset: -6px; border-radius: 50%;
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

      {/* Encart « cette semaine près de vous » (superposé, conserve le DS) */}
      <div style={{ position: "absolute", left: 16, bottom: 16, right: 16, pointerEvents: "none" }}>
        <div
          className="sy-card"
          style={{
            background: "rgba(252,249,241,.95)", backdropFilter: "blur(12px)",
            padding: 14, borderRadius: "var(--radius-md)",
          }}
        >
          <div className="sy-mono">Cette semaine près de vous</div>
          <div className="sy-h3 sy-num" style={{ marginTop: 4 }}>€8 320 collectés · 5 clubs actifs</div>
        </div>
      </div>
    </div>
  );
}
