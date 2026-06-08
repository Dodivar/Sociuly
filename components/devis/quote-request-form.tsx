"use client";

// Formulaire de demande de devis — /experiences/[slug]/devis (SPEC §4/§6).
// C'est l'entrée du parcours B2B : l'entreprise décrit son besoin, le club
// recevra la demande dans sa console (Quote.draft) puis renverra un devis ferme.
// AUCUN paiement ici (le paiement n'arrive qu'après acceptation du devis).
//
// Modèle « frictionless » (décision §11) : on capte SIRET + email ; côté serveur
// l'Organization est créée/rapprochée et un magic-link est envoyé pour suivre le
// devis. TODO(api): server action (Zod) → upsert Organization + create Quote +
// email Resend. Ici la soumission affiche un état de confirmation (placeholder).

import { useMemo, useState } from "react";
import Link from "next/link";
import { Btn, Card, Field, Input, Textarea } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { eurDecimal, SAMPLE_SENT_QUOTE_REF } from "@/lib/devis/quotes";
import { slotLabel } from "@/lib/format";

export type QuoteRequestExperience = {
  slug: string;
  title: string;
  clubName: string;
  cityLabel: string;
  venueLabel: string;
  location: "at_client" | "at_club" | "at_venue" | "flexible";
  format: string;
  capacityMin: number;
  capacityMax: number;
  priceModel: "per_person" | "fixed";
  pricePerPersonCents: number;
  basePriceCents: number;
  slots: { date: string; time: string }[];
  projectTitle: string;
};

type Props = {
  experience: QuoteRequestExperience;
  initial: { slotIdx: number; participants: number };
};

type LocationMode = "at_client" | "at_venue";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function QuoteRequestForm({ experience, initial }: Props) {
  const { capacityMin, capacityMax, slots, priceModel, pricePerPersonCents, basePriceCents } = experience;
  const clamp = (n: number) => Math.min(capacityMax, Math.max(capacityMin, n));

  const [sent, setSent] = useState(false);
  const [slotIdx, setSlotIdx] = useState(initial.slotIdx);
  const [participants, setParticipants] = useState(clamp(initial.participants));
  const [locationMode, setLocationMode] = useState<LocationMode>(experience.location === "at_client" ? "at_client" : "at_venue");
  const [addressLine, setAddressLine] = useState("");
  const [addressPostal, setAddressPostal] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const canChooseLocation = experience.location === "flexible";
  const needsAddress = experience.location === "at_client" || (canChooseLocation && locationMode === "at_client");

  const estimateCents = useMemo(
    () => (priceModel === "per_person" ? pricePerPersonCents * participants : basePriceCents),
    [priceModel, pricePerPersonCents, basePriceCents, participants],
  );

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (participants < capacityMin || participants > capacityMax) e.participants = `Effectif entre ${capacityMin} et ${capacityMax} personnes`;
    if (needsAddress) {
      if (!addressLine.trim()) e.addressLine = "Adresse requise pour une intervention sur site";
      if (!/^\d{5}$/.test(addressPostal.trim())) e.addressPostal = "Code postal invalide (5 chiffres)";
      if (!addressCity.trim()) e.addressCity = "Ville requise";
    }
    if (!companyName.trim()) e.companyName = "Raison sociale requise";
    if (!/^\d{14}$/.test(siret.trim())) e.siret = "SIRET à 14 chiffres";
    if (!contactName.trim()) e.contactName = "Nom du contact requis";
    if (!contactEmail.trim()) e.contactEmail = "Email requis";
    else if (!EMAIL_RE.test(contactEmail.trim())) e.contactEmail = "Email invalide";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    // TODO(api): server action → upsert Organization + create Quote(draft) + email.
    setSent(true);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (sent) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px var(--page-pad)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Icon name="check" size={30} color="#fff" />
        </div>
        <h1 className="sy-h1" style={{ textAlign: "center", fontSize: 30 }}>Demande envoyée 🎉</h1>
        <p className="sy-body" style={{ textAlign: "center", marginTop: 12, color: "var(--ink-2)" }}>
          <strong style={{ color: "var(--ink)" }}>{experience.clubName}</strong> a reçu votre demande pour
          {" "}<strong style={{ color: "var(--ink)" }}>{experience.title}</strong>. Vous recevrez un
          devis ferme sous 48h à l'adresse <b style={{ color: "var(--ink)" }}>{contactEmail}</b>,
          avec un lien sécurisé pour le consulter et l'accepter. Aucun paiement n'est requis à ce stade.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
          <Link href="/experiences" style={{ textDecoration: "none" }}>
            <Btn variant="outline" size="lg">Découvrir d'autres expériences</Btn>
          </Link>
          {/* Lien dev : le parcours réel passe par le magic-link de l'email. */}
          <Link href={`/devis/${SAMPLE_SENT_QUOTE_REF}`} style={{ textDecoration: "none" }}>
            <Btn variant="primary" size="lg" iconRight={<Icon name="arrow" size={15} color="#fff" />}>
              Voir un exemple de devis
            </Btn>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form className="qr-grid" onSubmit={submit} noValidate>
      <div>
        <div className="sy-mono" style={{ color: "var(--primary)", marginBottom: 6 }}>Demande de devis · sans engagement</div>
        <h1 className="sy-h1" style={{ marginBottom: 6 }}>Demander un devis</h1>
        <p className="sy-small sy-muted" style={{ marginBottom: 22 }}>
          Décrivez votre besoin : {experience.clubName} vous renverra un devis ferme sous 48h.
        </p>

        <Card style={{ padding: "22px 24px" }}>
          {/* Date & créneau */}
          <Field label="Date souhaitée">
            <div className="sy-input" style={{ padding: "0 12px", display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="calendar" size={15} color="var(--ink-3)" />
              <select
                value={slotIdx}
                onChange={(e) => setSlotIdx(Number(e.target.value))}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "inherit", fontSize: 14, color: "var(--ink)", appearance: "none", cursor: "pointer", padding: "11px 0" }}
              >
                {slots.map((s, i) => (<option key={`${s.date}-${s.time}`} value={i}>{slotLabel(s)}</option>))}
              </select>
              <Icon name="chevron" size={14} color="var(--ink-3)" />
            </div>
          </Field>

          {/* Participants */}
          <Field label="Participants" hint={`Capacité : ${capacityMin}–${capacityMax} personnes`} error={errors.participants} style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "6px 10px", maxWidth: 220 }}>
              <button type="button" aria-label="Retirer un participant" disabled={participants <= capacityMin} onClick={() => setParticipants(clamp(participants - 1))} className="sy-btn sy-btn-soft sy-btn-icon-sm" style={{ opacity: participants <= capacityMin ? 0.4 : 1 }}>
                <Icon name="minus" size={15} />
              </button>
              <input type="number" min={capacityMin} max={capacityMax} value={participants} onChange={(e) => setParticipants(clamp(Number(e.target.value) || capacityMin))} aria-label="Nombre de participants" style={{ width: 64, textAlign: "center", border: "none", outline: "none", background: "transparent", fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: "var(--ink)" }} />
              <button type="button" aria-label="Ajouter un participant" disabled={participants >= capacityMax} onClick={() => setParticipants(clamp(participants + 1))} className="sy-btn sy-btn-soft sy-btn-icon-sm" style={{ opacity: participants >= capacityMax ? 0.4 : 1 }}>
                <Icon name="plus" size={15} />
              </button>
            </div>
          </Field>

          {/* Lieu */}
          <div className="sy-field" style={{ marginTop: 20 }}>
            <label className="sy-label">Lieu de l'événement</label>
            {canChooseLocation && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {([{ mode: "at_venue", label: `Au club · ${experience.venueLabel}` }, { mode: "at_client", label: "À votre adresse" }] as const).map((opt) => {
                  const on = locationMode === opt.mode;
                  return (
                    <button key={opt.mode} type="button" onClick={() => setLocationMode(opt.mode)} className="sy-chip" aria-pressed={on} style={{ cursor: "pointer", background: on ? "var(--ink)" : "var(--surface)", color: on ? "var(--surface)" : "var(--ink)", border: `1px solid ${on ? "var(--ink)" : "var(--line-2)"}` }}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
            {needsAddress ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Field label="Adresse" error={errors.addressLine}>
                  <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="12 rue des Tanneurs" autoComplete="street-address" />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12 }}>
                  <Field label="Code postal" error={errors.addressPostal}>
                    <Input inputMode="numeric" value={addressPostal} onChange={(e) => setAddressPostal(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="67000" maxLength={5} />
                  </Field>
                  <Field label="Ville" error={errors.addressCity}>
                    <Input value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="Strasbourg" autoComplete="address-level2" />
                  </Field>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
                <Icon name="pin" size={16} color="var(--ink-3)" />
                <div>
                  <div style={{ fontWeight: 500 }}>{experience.venueLabel}</div>
                  <div className="sy-small sy-muted">Cette expérience se déroule dans les installations du club.</div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Coordonnées entreprise */}
        <h2 className="sy-h3" style={{ marginTop: 24, marginBottom: 12 }}>Votre entreprise</h2>
        <Card style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Raison sociale" error={errors.companyName}>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex : Klaxoon SAS" autoComplete="organization" />
          </Field>
          <Field label="SIRET" error={errors.siret} hint="14 chiffres — sert à établir le devis et la facture">
            <Input inputMode="numeric" value={siret} onChange={(e) => setSiret(e.target.value.replace(/\D/g, "").slice(0, 14))} placeholder="81204759300025" maxLength={14} />
          </Field>
          <Field label="Contact référent" error={errors.contactName}>
            <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Camille Léger · Office Manager" autoComplete="name" />
          </Field>
          <Field label="Email professionnel" error={errors.contactEmail} hint="Le devis et son lien de suivi y seront envoyés">
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="camille@entreprise.fr" autoComplete="email" />
          </Field>
          <Field label="Téléphone (optionnel)">
            <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 12 34 56 78" autoComplete="tel" />
          </Field>
          <Field label="Message au club (optionnel)" hint="Précisez vos attentes : contexte, contraintes, options souhaitées…">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Bonjour, c'est pour notre séminaire annuel…" />
          </Field>
        </Card>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 8 }}>
          <Link href={`/experiences/${experience.slug}`} style={{ textDecoration: "none" }}>
            <Btn variant="ghost" icon={<Icon name="arrowLeft" size={14} />}>Retour à l'expérience</Btn>
          </Link>
          <Btn type="submit" variant="primary" size="lg" iconRight={<Icon name="arrow" size={16} color="#fff" />}>
            Envoyer ma demande de devis
          </Btn>
        </div>
      </div>

      {/* Récap latéral */}
      <aside>
        <div style={{ position: "sticky", top: 16 }}>
          <Card variant="elevated" style={{ padding: 20 }}>
            <div className="sy-mono">{experience.clubName}</div>
            <div className="sy-h3" style={{ marginTop: 2 }}>{experience.title}</div>
            <div className="sy-small sy-muted" style={{ marginTop: 4 }}>
              {experience.format} · {experience.cityLabel}
            </div>
            <div style={{ marginTop: 16, padding: 14, borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="sy-mono">Estimation TTC</div>
                <div className="sy-num" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 24, fontVariationSettings: "var(--display-var)" }}>
                  {eurDecimal(estimateCents)}
                </div>
              </div>
              {priceModel === "per_person" && (
                <div className="sy-small sy-muted" style={{ marginTop: 4 }}>{eurDecimal(pricePerPersonCents)} × {participants} pers.</div>
              )}
            </div>
            <div className="sy-small sy-muted" style={{ marginTop: 10 }}>
              Estimation indicative — le montant ferme figure dans le devis envoyé par le club.
            </div>
            <div className="sy-small sy-muted" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
              <Icon name="check" size={12} color="var(--success)" /> Devis ferme sous 48h · sans engagement
            </div>
          </Card>
        </div>
      </aside>

      <style>{`
        .qr-grid {
          padding: 28px var(--page-pad); max-width: 1200px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start;
        }
        @media (max-width: 1024px) { .qr-grid { grid-template-columns: 1fr; } }
      `}</style>
    </form>
  );
}
