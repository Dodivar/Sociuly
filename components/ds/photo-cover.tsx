"use client";

import { useState } from "react";

// Photo de remplissage posée par-dessus un placeholder `.sy-img`.
// - `object-fit: cover` + `inset: 0` (cf. classe `.sy-img-cover`).
// - Voile sombre optionnel (`scrim`) pour garder labels/légendes lisibles.
// - Dégradation : si l'image échoue (hotlink externe indisponible), on se
//   masque pour révéler le dégradé du placeholder en dessous — la page ne
//   montre jamais d'icône d'image cassée.
//
// Client Component volontaire : `onError` impose une exécution navigateur
// (cf. règle « "use client" uniquement quand l'interactivité le requiert »).
export function PhotoCover({
  src,
  alt,
  scrim = "bottom",
  priority = false,
}: {
  src: string;
  alt: string;
  scrim?: "bottom" | "full" | "none";
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- hotlink CDN externe, pas d'optimisation next/image */}
      <img
        className="sy-img-cover"
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        style={{ objectFit: "cover", width: "100%", height: "100%" }}
      />
      {scrim !== "none" && (
        <span
          aria-hidden="true"
          className="sy-img-cover"
          style={{
            background:
              scrim === "full"
                ? "linear-gradient(180deg, rgba(20,36,31,.25) 0%, rgba(20,36,31,.55) 100%)"
                : "linear-gradient(180deg, rgba(20,36,31,0) 45%, rgba(20,36,31,.55) 100%)",
          }}
        />
      )}
    </>
  );
}
