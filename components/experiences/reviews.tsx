"use client";

// Bloc avis de la fiche expérience avec pagination « Voir plus ».
// SPEC §3 — Review : note 1–5, commentaire ≤ 600 caractères.

import { useState } from "react";
import { Btn, Stars } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { ReviewCard } from "@/components/ds/patterns";
import type { ExperienceReview } from "@/lib/marketplace/experience-detail";

const PAGE = 4;

export function ExperienceReviews({
  reviews,
  rating,
  count,
}: {
  reviews: ExperienceReview[];
  rating: number;
  count: number;
}) {
  const [visible, setVisible] = useState(PAGE);
  const shown = reviews.slice(0, visible);
  const remaining = reviews.length - visible;

  return (
    <section>
      <div
        style={{
          marginTop: 28, display: "flex", alignItems: "baseline",
          justifyContent: "space-between", flexWrap: "wrap", gap: 8,
        }}
      >
        <h2 className="sy-h2">Avis ({count})</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Stars value={rating} size={14} />
          <span className="sy-h3">{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="reviews-grid">
        {shown.map((r) => (
          <ReviewCard
            key={r.id}
            name={r.author}
            date={r.date}
            rating={r.rating}
            body={r.body}
            tone={r.tone}
          />
        ))}
      </div>

      {remaining > 0 && (
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <Btn
            variant="outline"
            onClick={() => setVisible((v) => v + PAGE)}
            iconRight={<Icon name="chevron" size={14} />}
          >
            Voir plus d&apos;avis ({remaining})
          </Btn>
        </div>
      )}
    </section>
  );
}
