"use client";

// Carte marketplace interactive (markers cliquables, sync hover liste ↔ carte,
// popup mini-card). v1 = carte stylisée SVG pilotée par les données.
// TODO(map): remplacer le fond SVG par MapLibre GL JS + tuiles MapTiler (SPEC §1)
// une fois les coordonnées PostGIS et la clé MapTiler disponibles. L'API de ce
// composant (pins data-driven + hover/select) reste valable.

import Link from "next/link";
import type { CSSProperties } from "react";
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

export function InteractiveMarketMap({
  experiences,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
  style,
}: Props) {
  const selected = experiences.find((x) => x.id === selectedId) ?? null;

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
        background: "var(--surface-2)",
        ...style,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <pattern id="dotgrid-mkt" width="2.5" height="2.5" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.25" fill="var(--ink-3)" opacity="0.25" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dotgrid-mkt)" />
        <path d="M 0 30 Q 30 22 50 32 T 100 25" stroke="var(--line-2)" fill="none" strokeWidth="1.2" />
        <path d="M 0 60 Q 35 50 60 60 T 100 55" stroke="var(--line-2)" fill="none" strokeWidth="0.9" />
        <path d="M 30 0 Q 35 30 30 60 T 35 100" stroke="var(--line-2)" fill="none" strokeWidth="0.8" />
        <path d="M 70 0 Q 72 40 68 70 T 70 100" stroke="var(--line-2)" fill="none" strokeWidth="0.8" />
      </svg>

      {experiences.length === 0 && (
        <div
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", padding: 24, textAlign: "center",
          }}
        >
          <div className="sy-mono sy-muted">Aucune expérience sur la carte pour ces filtres.</div>
        </div>
      )}

      {experiences.map((x) => {
        const active = x.id === hoveredId || x.id === selectedId;
        return (
          <button
            key={x.id}
            type="button"
            onMouseEnter={() => onHover(x.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelect(x.id === selectedId ? null : x.id)}
            aria-label={`${x.title} — €${x.price}`}
            className="sy-num"
            style={{
              position: "absolute",
              left: `${x.x}%`,
              top: `${x.y}%`,
              transform: `translate(-50%, -50%) scale(${active ? 1.12 : 1})`,
              padding: "7px 14px",
              borderRadius: 999,
              background: active ? "var(--accent)" : "var(--surface)",
              color: active ? "#fff" : "var(--ink)",
              fontFamily: "var(--display)",
              fontWeight: 700,
              fontSize: 13,
              border: `1.5px solid ${active ? "var(--accent-deep)" : "var(--ink)"}`,
              boxShadow: active ? "var(--shadow-md)" : "0 4px 12px rgba(11,21,48,.18)",
              fontVariationSettings: "var(--display-var)",
              whiteSpace: "nowrap",
              cursor: "pointer",
              zIndex: active ? 5 : 2,
              transition: "transform .15s ease, background .15s ease, color .15s ease",
            }}
          >
            €{x.price}
          </button>
        );
      })}

      {/* Popup mini-card du marker sélectionné */}
      {selected && (
        <div
          style={{
            position: "absolute",
            left: `${Math.min(Math.max(selected.x, 20), 80)}%`,
            top: `${Math.min(Math.max(selected.y, 12), 70)}%`,
            transform: "translate(-50%, calc(-100% - 18px))",
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
            <Link
              href={`/experiences/${selected.slug}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
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
              <div
                className="sy-num"
                style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18 }}
              >
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
