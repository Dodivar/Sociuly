"use client";

// Galerie de la fiche expérience : mosaïque (photo principale + miniatures) +
// viewer plein écran (lightbox) avec navigation clavier, bande de miniatures et
// compteur. Cf. SPEC §6 (page détail). Mock visuel = dégradés (les vraies photos
// arriveront via Supabase Storage).

import { useCallback, useEffect, useState } from "react";
import { IconBtn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import type { GalleryPhoto } from "@/lib/marketplace/experience-detail";

function HeroOverlay() {
  return (
    <svg
      viewBox="0 0 220 220"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }}
      aria-hidden
    >
      <circle cx="160" cy="60" r="36" fill="#f1c14a" opacity="0.7" />
      <path d="M0 170 Q 60 130 110 150 T 220 130 L 220 220 L 0 220 Z" fill="#e8623d" opacity="0.55" />
      <path d="M0 200 Q 80 175 130 195 T 220 185 L 220 220 L 0 220 Z" fill="#14332b" />
    </svg>
  );
}

export function ExperienceGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const count = photos.length;

  const show = useCallback((i: number) => { setIndex(((i % count) + count) % count); }, [count]);
  const next = useCallback(() => show(index + 1), [index, show]);
  const prev = useCallback(() => show(index - 1), [index, show]);
  const openAt = (i: number) => { setIndex(i); setOpen(true); };

  // Navigation clavier + verrouillage du scroll quand le viewer est ouvert.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, next, prev]);

  const tiles = photos.slice(0, 5);

  return (
    <>
      <div className="detail-gallery">
        {tiles.map((p, i) => {
          const isHero = i === 0;
          const isLast = i === tiles.length - 1;
          return (
            <button
              key={p.id}
              type="button"
              className={`sy-img gallery-tile${isHero ? " gallery-hero" : ""}`}
              style={{ borderRadius: 0, background: p.gradient, border: "none", padding: 0, cursor: "pointer" }}
              onClick={() => openAt(i)}
              aria-label={`Agrandir : ${p.label}`}
            >
              {isHero && <HeroOverlay />}
              {isHero && (
                <span className="sy-img-label" style={{ position: "absolute", bottom: 16, left: 16 }}>
                  {p.label}
                </span>
              )}
              {isLast && count > tiles.length && (
                <span
                  className="sy-btn sy-btn-dark sy-btn-sm"
                  style={{ position: "absolute", bottom: 12, right: 12, pointerEvents: "none" }}
                >
                  <Icon name="grid" size={13} color="#fff" /> Voir {count} photos
                </span>
              )}
            </button>
          );
        })}
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Galerie photos"
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(20,36,31,.92)", backdropFilter: "blur(4px)",
            display: "flex", flexDirection: "column",
          }}
        >
          {/* barre supérieure */}
          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px", color: "var(--surface)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sy-mono" style={{ color: "var(--surface)" }}>
              {index + 1} / {count}
            </span>
            <IconBtn aria-label="Fermer la galerie" onClick={() => setOpen(false)}>
              <Icon name="close" size={18} />
            </IconBtn>
          </div>

          {/* visionneuse */}
          <div
            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, padding: "0 12px", minHeight: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <IconBtn aria-label="Photo précédente" onClick={prev}>
              <Icon name="arrowLeft" size={18} />
            </IconBtn>
            <div
              className="sy-img"
              style={{
                flex: 1, maxWidth: 980, height: "100%", maxHeight: 620, borderRadius: "var(--radius-lg)",
                background: photos[index].gradient, position: "relative",
              }}
            >
              {index === 0 && <HeroOverlay />}
              <span className="sy-img-label" style={{ position: "absolute", bottom: 16, left: 16 }}>
                {photos[index].label}
              </span>
            </div>
            <IconBtn aria-label="Photo suivante" onClick={next}>
              <Icon name="arrow" size={18} />
            </IconBtn>
          </div>

          {/* bande de miniatures */}
          <div
            style={{ display: "flex", gap: 8, padding: "16px 20px", overflowX: "auto", justifyContent: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            {photos.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onClick={() => show(i)}
                aria-label={`Voir ${p.label}`}
                aria-current={i === index}
                className="sy-img"
                style={{
                  width: 76, height: 52, flex: "0 0 auto", borderRadius: 8, background: p.gradient,
                  padding: 0, cursor: "pointer",
                  outline: i === index ? "2px solid var(--accent)" : "2px solid transparent",
                  outlineOffset: 2, opacity: i === index ? 1 : 0.6,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
