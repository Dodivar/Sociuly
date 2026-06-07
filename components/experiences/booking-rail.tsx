"use client";

// Rail droit sticky de la fiche expérience — estimateur de devis B2B.
//
// IMPORTANT (SPEC §2/§5) : Sociuly est B2B et ne fait PAS de réservation
// instantanée. Le produit se vend par DEVIS. Ce rail produit donc une
// ESTIMATION indicative (recalcul live selon le nombre de participants) et le
// CTA « Demander un devis » transmet date / heure / participants à l'étape
// suivante. Le montant ferme arrive dans le Quote (SPEC §6). La commission
// Sociuly (6% TTC) n'est jamais surfacée à l'acheteur (SPEC §5) — calcul
// serveur uniquement.

import { useMemo, useState } from "react";
import Link from "next/link";
import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { ImpactMini } from "@/components/ds/impact";
import {
  eur,
  type ExperienceDetail,
  type ExperienceSlot,
} from "@/lib/marketplace/experience-detail";

const WEEKDAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTHS = [
  "janv.", "févr.", "mars", "avr.", "mai", "juin",
  "juil.", "août", "sept.", "oct.", "nov.", "déc.",
];

function slotLabel(s: ExperienceSlot): string {
  const d = new Date(`${s.date}T00:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${s.time.replace(":", "h")}`;
}

export function ExperienceBookingRail({ experience }: { experience: ExperienceDetail }) {
  const {
    slug, slots, capacityMin, capacityMax, priceModel,
    pricePerPersonCents, basePriceCents, format,
  } = experience;

  const [slotIdx, setSlotIdx] = useState(0);
  const [participants, setParticipants] = useState(Math.min(Math.max(capacityMin, 20), capacityMax));

  const slot = slots[slotIdx];

  // Recalcul live : per_person → tarif × participants ; fixed → forfait.
  const estimateCents = useMemo(
    () => (priceModel === "per_person" ? pricePerPersonCents * participants : basePriceCents),
    [priceModel, pricePerPersonCents, basePriceCents, participants],
  );

  const clamp = (n: number) => Math.min(capacityMax, Math.max(capacityMin, n));

  // Le CTA ouvre la demande de devis (SPEC §4/§6) — PAS le paiement. Le paiement
  // de l'acompte n'arrive qu'après acceptation du devis (/reserver/[bookingRef]).
  // On transmet la présélection date / heure / participants au formulaire.
  const ctaHref = `/experiences/${slug}/devis?date=${slot.date}&heure=${encodeURIComponent(slot.time)}&participants=${participants}`;

  return (
    <div
      className="sy-card sy-card-lg"
      style={{ boxShadow: "var(--shadow-md)", border: "1px solid var(--line)" }}
    >
      {/* Prix d'appel */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            className="sy-num"
            style={{
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, lineHeight: 1,
              fontVariationSettings: "var(--display-var)",
            }}
          >
            {eur(priceModel === "per_person" ? pricePerPersonCents : basePriceCents)}
          </span>
          {priceModel === "per_person" && <span className="sy-small sy-muted">/ pers.</span>}
        </div>
        <div className="sy-mono">à partir de · HT</div>
      </div>

      {/* Sélecteur date / heure */}
      <label className="sy-label" htmlFor="rail-slot" style={{ display: "block", marginTop: 16 }}>
        Date & créneau
      </label>
      <div
        className="sy-input"
        style={{ marginTop: 6, padding: "0 12px", display: "flex", alignItems: "center", gap: 8 }}
      >
        <Icon name="calendar" size={15} color="var(--ink-3)" />
        <select
          id="rail-slot"
          value={slotIdx}
          onChange={(e) => setSlotIdx(Number(e.target.value))}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontFamily: "inherit", fontSize: 14, color: "var(--ink)", appearance: "none",
            cursor: "pointer", padding: "11px 0",
          }}
        >
          {slots.map((s, i) => (
            <option key={`${s.date}-${s.time}`} value={i}>{slotLabel(s)}</option>
          ))}
        </select>
        <Icon name="chevron" size={14} color="var(--ink-3)" />
      </div>

      {/* Sélecteur participants */}
      <label className="sy-label" htmlFor="rail-participants" style={{ display: "block", marginTop: 14 }}>
        Participants
      </label>
      <div
        style={{
          marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between",
          border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "6px 10px",
        }}
      >
        <button
          type="button"
          aria-label="Retirer un participant"
          disabled={participants <= capacityMin}
          onClick={() => setParticipants((p) => clamp(p - 1))}
          className="sy-btn sy-btn-soft sy-btn-icon-sm"
          style={{ opacity: participants <= capacityMin ? 0.4 : 1 }}
        >
          <Icon name="minus" size={15} />
        </button>
        <input
          id="rail-participants"
          type="number"
          min={capacityMin}
          max={capacityMax}
          value={participants}
          onChange={(e) => setParticipants(clamp(Number(e.target.value) || capacityMin))}
          style={{
            width: 64, textAlign: "center", border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: "var(--ink)",
          }}
        />
        <button
          type="button"
          aria-label="Ajouter un participant"
          disabled={participants >= capacityMax}
          onClick={() => setParticipants((p) => clamp(p + 1))}
          className="sy-btn sy-btn-soft sy-btn-icon-sm"
          style={{ opacity: participants >= capacityMax ? 0.4 : 1 }}
        >
          <Icon name="plus" size={15} />
        </button>
      </div>
      <div className="sy-small sy-muted" style={{ marginTop: 6 }}>
        Capacité : {capacityMin}–{capacityMax} personnes · format {format.toLowerCase()}
      </div>

      {/* Estimation recalculée en direct */}
      <div
        style={{
          marginTop: 16, padding: "14px 16px", borderRadius: "var(--radius-md)",
          background: "var(--surface-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div>
            <div className="sy-mono">Estimation TTC</div>
            {priceModel === "per_person" && (
              <div className="sy-small sy-muted" style={{ marginTop: 2 }}>
                {eur(pricePerPersonCents)} × {participants} pers.
              </div>
            )}
          </div>
          <div
            className="sy-num"
            aria-live="polite"
            style={{
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 26, lineHeight: 1,
              fontVariationSettings: "var(--display-var)",
            }}
          >
            {eur(estimateCents)}
          </div>
        </div>
      </div>

      <Link href={ctaHref} style={{ textDecoration: "none", display: "block", marginTop: 14 }}>
        <Btn variant="primary" size="lg" block iconRight={<Icon name="arrow" size={16} color="#fff" />}>
          Demander un devis
        </Btn>
      </Link>

      <div
        className="sy-small sy-muted"
        style={{
          textAlign: "center", marginTop: 10,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10, flexWrap: "wrap",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="check" size={12} color="var(--success)" /> Devis ferme sous 48h
        </span>
        <span>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="lock" size={12} color="var(--ink-3)" /> Sans engagement
        </span>
      </div>
      <div className="sy-small sy-muted" style={{ textAlign: "center", marginTop: 8 }}>
        Estimation indicative — le montant ferme figure dans votre devis.
      </div>

      <div className="sy-divider" style={{ margin: "14px 0" }} />
      <ImpactMini />
    </div>
  );
}
