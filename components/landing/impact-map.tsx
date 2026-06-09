"use client";

// Wrapper de la carte d'impact de la landing : charge MapLibre uniquement côté
// client (ssr:false) avec un placeholder, pour ne pas alourdir le rendu initial
// de la page d'accueil (cf. impact-map-client.tsx pour la carte elle-même).

import dynamic from "next/dynamic";
import type { CSSProperties } from "react";
import type { MarketplaceExperience } from "@/lib/marketplace/experiences";

const ImpactMapClient = dynamic(
  () => import("./impact-map-client").then((m) => m.ImpactMapClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="sy-mono sy-muted"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--surface-2)", borderRadius: "var(--radius-lg)",
          aspectRatio: "4/3", width: "100%",
        }}
      >
        Chargement de la carte…
      </div>
    ),
  },
);

export function ImpactMap({
  experiences,
  style,
}: {
  experiences: MarketplaceExperience[];
  style?: CSSProperties;
}) {
  return <ImpactMapClient experiences={experiences} style={style} />;
}
