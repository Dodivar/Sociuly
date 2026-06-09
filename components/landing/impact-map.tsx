"use client";

// Wrapper de la carte d'impact de la landing.
// Perf : MapLibre (~230 Ko gzip) + les tuiles réseau ne sont chargés que lorsque
// la carte approche du viewport (IntersectionObserver). La carte est SOUS la ligne
// de flottaison (section « Notre impact ») : inutile de télécharger ce poids
// pendant le chargement initial, alors que l'utilisateur regarde encore le hero.
// MapLibre reste par ailleurs lazy-loadée côté client uniquement (ssr:false) :
// elle a besoin de `window` et alourdit le bundle.

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { MarketplaceExperience } from "@/lib/marketplace/experiences";

// Placeholder partagé : réserve la place (évite le layout shift via l'aspect-ratio
// porté par le conteneur) avant ET pendant le chargement du chunk MapLibre.
function MapPlaceholder() {
  return (
    <div
      className="sy-mono sy-muted"
      style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "var(--surface-2)", borderRadius: "var(--radius-lg)",
      }}
    >
      Chargement de la carte…
    </div>
  );
}

const ImpactMapClient = dynamic(
  () => import("./impact-map-client").then((m) => m.ImpactMapClient),
  { ssr: false, loading: () => <MapPlaceholder /> },
);

export function ImpactMap({
  experiences,
  style,
}: {
  experiences: MarketplaceExperience[];
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  // `inView` passe à true (définitivement) dès que la carte approche de l'écran ;
  // c'est ce qui déclenche l'import dynamique du chunk MapLibre + le fetch des tuiles.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;

    // IntersectionObserver indisponible (vieux navigateur / environnement de test)
    // → on charge directement plutôt que de ne jamais afficher la carte.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      // Précharge ~300 px avant l'entrée à l'écran pour un affichage fluide.
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      {inView ? (
        <ImpactMapClient experiences={experiences} style={{ position: "absolute", inset: 0 }} />
      ) : (
        <MapPlaceholder />
      )}
    </div>
  );
}
