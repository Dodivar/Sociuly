import Image from "next/image";
import { generateBlurDataUrl, BLUR_FALLBACK } from "@/lib/blur-placeholder";
import type { PrestationHue } from "@/components/ds/patterns";

// ─── Colour palette (mirrors patterns.tsx to avoid a cross-import) ───────────
const HUES: Record<PrestationHue, { bg: string; accent: string }> = {
  green:  { bg: "#1f4b3f", accent: "#fbe082" },
  orange: { bg: "#c0451f", accent: "#fce3d8" },
  yellow: { bg: "#b8861a", accent: "#fff2c5" },
  sand:   { bg: "#8a6b3e", accent: "#f3dba6" },
  teal:   { bg: "#1f5b58", accent: "#d8efea" },
  rust:   { bg: "#8c4a25", accent: "#fbd6b9" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type PrestationImageProps = {
  /** Supabase Storage public / signed URL, or null to show the gradient placeholder. */
  src: string | null | undefined;
  alt: string;
  /** Matches PrestationCard's `hue` — used for the gradient fallback. */
  hue?: PrestationHue;
  /** Explicit pixel height. Defaults to compact ? 150 : 200. */
  height?: number;
  compact?: boolean;
  /** Pass true for above-the-fold cards to disable lazy loading. */
  priority?: boolean;
  /**
   * Pre-computed blur data URL (e.g. stored in DB at upload time).
   * When provided the server-side fetch is skipped entirely.
   */
  blurDataURL?: string;
  /**
   * Responsive sizes hint for the browser.
   * Default covers 1–3 column grid layouts.
   */
  sizes?: string;
};

// ─── Component (async Server Component) ──────────────────────────────────────

export async function PrestationImage({
  src,
  alt,
  hue = "green",
  height,
  compact = false,
  priority = false,
  blurDataURL: providedBlur,
  sizes = "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw",
}: PrestationImageProps) {
  const h = HUES[hue];
  const imgHeight = height ?? (compact ? 150 : 200);

  // ── Fallback: no image uploaded yet ──────────────────────────────────────
  if (!src) {
    return <GradientFallback h={h} height={imgHeight} />;
  }

  // ── Blur placeholder: use pre-computed value or generate server-side ──────
  const blurDataURL = providedBlur ?? (await generateBlurDataUrl(src));

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: imgHeight,
        overflow: "hidden",
        borderRadius: 0,           // clipped by parent card's overflow:hidden
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={blurDataURL}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

// ─── Gradient fallback (mirrors PrestationCard's sy-img placeholder) ─────────

function GradientFallback({
  h,
  height,
}: {
  h: { bg: string; accent: string };
  height: number;
}) {
  return (
    <div
      style={{
        position: "relative",
        height,
        background: `linear-gradient(135deg, ${h.bg} 0%, ${h.bg}cc 50%, ${h.bg}aa 100%)`,
      }}
    >
      <svg
        viewBox="0 0 200 120"
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.25,
        }}
      >
        <path d="M0 100 Q 40 60 80 80 T 200 70 L 200 120 L 0 120 Z" fill={h.accent} />
        <circle cx="160" cy="30" r="14" fill={h.accent} opacity="0.6" />
      </svg>
    </div>
  );
}
