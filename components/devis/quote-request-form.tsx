"use client";

// Formulaire de demande de devis — SPEC §4/§6. Entrée du parcours B2B :
// l'entreprise décrit son besoin, le club le recevra dans sa console (Quote.draft)
// puis renverra un devis ferme. AUCUN paiement ici (le paiement n'arrive qu'après
// acceptation du devis).
//
// Deux modes, MÊME parcours (un seul pipeline Quote) :
//   • « expérience » : devis rattaché à une Experience (slug) — créneaux, capacité
//     et prix d'appel pré-remplis. Route /experiences/[slug]/devis.
//   • « sur mesure » : devis rattaché au CLUB seul (experienceId = null, SPEC §3) —
//     date / effectif / format / budget libres. Route /clubs/[slug]/devis.
//
// Modèle « frictionless » (décision §11) : on capte SIRET + contact ; la Server
// Action requestQuoteAction crée/rapproche l'Organization et ouvre un Quote(draft)
// côté club (numéro DEV, contact mémorisé sur le devis). Aucun paiement ici.

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { requestQuoteAction } from "@/lib/actions/quote-request";
import { Btn, Card, Field, Input, Select, Textarea } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { eurDecimal } from "@/lib/devis/quotes";

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

export type QuoteRequestClub = {
  slug: string;
  name: string;
  cityLabel: string;
  venueLabel: string;
};

type Props = {
  club: QuoteRequestClub;
  /** Présent → mode « expérience ». Absent → mode « sur mesure » (club seul). */
  experience?: QuoteRequestExperience;
  initial?: { slotIdx: number; participants: number };
};

type LocationMode = "at_client" | "at_venue";

const WEEKDAYS = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
function slotLabel(s: { date: string; time: string }): string {
  const d = new Date(`${s.date}T00:00:00`);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} · ${s.time.replace(":", "h")}`;
}

const FORMAT_OPTIONS = [
  { value: "sur_mesure", label: "Sur mesure" },
  { value: "demi_journee", label: "Demi-journée" },
  { value: "journee", label: "Journée" },
  { value: "soiree", label: "Soirée" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function QuoteRequestForm({ club, experience, initial }: Props) {
  const isCustom = !experience;
  const venueLabel = experience?.venueLabel ?? club.venueLabel;
  const cityLabel = experience?.cityLabel ?? club.cityLabel;

  // Capacité : bornée en mode expérience, libre (≥ 1) en sur mesure.
  const capacityMin = experience?.capacityMin ?? 1;
  const capacityMax = experience?.capacityMax ?? 100000;
  const clamp = (n: number) => Math.min(capacityMax, Math.max(capacityMin, n));

  const [sent, setSent] = useState(false);
  const [sentRef, setSentRef] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [slotIdx, setSlotIdx] = useState(initial?.slotIdx ?? 0);
  const [customDate, setCustomDate] = useState("");
  const [format, setFormat] = useState("sur_mesure");
  const [budget, setBudget] = useState("");
  const [participants, setParticipants] = useState(clamp(initial?.participants ?? 20));
  const [locationMode, setLocationMode] = useState<LocationMode>(
    experience && experience.location === "at_client" ? "at_client" : "at_venue",
  );
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

  // En sur mesure le lieu est toujours choisissable ; en expérience uniquement si flexible.
  const canChooseLocation = isCustom || experience.location === "flexible";
  const needsAddress = isCustom
    ? locationMode === "at_client"
    : experience.location === "at_client" || (canChooseLocation && locationMode === "at_client");

  // Estimation : seulement en mode expérience (le sur mesure est chiffré par le club).
  const estimateCents = useMemo(
    () =>
      experience
        ? experience.priceModel === "per_person"
          ? experience.pricePerPersonCents * participants
          : experience.basePriceCents
        : 0,
    [experience, participants],
  );

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (isCustom) {
      if (!customDate) e.customDate = "Date souhaitée requise";
      if (participants < 1) e.participants = "Au moins 1 participant";
    } else if (participants < capacityMin || participants > capacityMax) {
      e.participants = `Effectif entre ${capacityMin} et ${capacityMax} personnes`;
    }
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

  // Lieu final (enum Quote.location). En expérience non flexible → lieu de l'exp. ;
  // sinon le choix « Au club » mappe vers at_club, « À votre adresse » vers at_client.
  function resolvedLocation(): "at_client" | "at_club" | "at_venue" | "flexible" {
    if (experience && !canChooseLocation) return experience.location;
    return locationMode === "at_client" ? "at_client" : "at_club";
  }

  function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitError(null);

    const slot = experience?.slots[slotIdx];
    const serviceAddress = needsAddress
      ? `${addressLine.trim()}, ${addressPostal.trim()} ${addressCity.trim()}`.trim()
      : undefined;

    startTransition(async () => {
      const res = await requestQuoteAction({
        clubSlug: club.slug,
        experienceSlug: experience?.slug,
        requestedDateISO: isCustom ? customDate : slot?.date ?? "",
        requestedTime: isCustom ? undefined : slot?.time,
        participants,
        format: isCustom ? (format as "sur_mesure" | "demi_journee" | "journee" | "soiree") : undefined,
        budgetCents: isCustom && budget ? Number(budget) * 100 : undefined,
        location: resolvedLocation(),
        serviceAddress,
        company: { name: companyName.trim(), siret: siret.trim() },
        contact: { name: contactName.trim(), email: contactEmail.trim(), phone: phone.trim() || undefined },
        message: message.trim() || undefined,
      });
      if (!res.ok) { setSubmitError(res.error); return; }
      setSentRef(res.ref);
      setSent(true);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const requestTitle = isCustom ? "votre demande sur mesure" : experience.title;
  const backHref = isCustom ? `/clubs/${club.slug}` : `/experiences/${experience.slug}`;
  const backLabel = isCustom ? "Retour au club" : "Retour à l'expérience";

  if (sent) {
    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px var(--page-pad)" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Icon name="check" size={30} color="#fff" />
        </div>
        <h1 className="sy-h1" style={{ textAlign: "center", fontSize: 30 }}>Demande envoyée 🎉</h1>
        <p className="sy-body" style={{ textAlign: "center", marginTop: 12, color: "var(--ink-2)" }}>
          <strong style={{ color: "var(--ink)" }}>{club.name}</strong> a reçu {isCustom ? "votre demande de devis sur mesure" : <>votre demande pour <strong style={{ color: "var(--ink)" }}>{experience.title}</strong></>}.
          {" "}Vous recevrez un devis ferme sous 48h à l'adresse <b style={{ color: "var(--ink)" }}>{contactEmail}</b>,
          avec un lien sécurisé pour le consulter et l'accepter. Aucun paiement n'est requis à ce stade.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
          <Link href="/experiences" style={{ textDecoration: "none" }}>
            <Btn variant="outline" size="lg">Découvrir d'autres expériences</Btn>
          </Link>
          {sentRef && (
            <Link href={`/devis/${sentRef}`} style={{ textDecoration: "none" }}>
              <Btn variant="primary" size="lg" iconRight={<Icon name="arrow" size={15} color="#fff" />}>
                Suivre ma demande
              </Btn>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form className="qr-grid" onSubmit={submit} noValidate>
      <div>
        <div className="sy-mono" style={{ color: "var(--primary)", marginBottom: 6 }}>Demande de devis · sans engagement</div>
        <h1 className="sy-h1" style={{ marginBottom: 6 }}>{isCustom ? "Demander un devis sur mesure" : "Demander un devis"}</h1>
        <p className="sy-small sy-muted" style={{ marginBottom: 22 }}>
          {isCustom
            ? `Décrivez votre projet : ${club.name} vous proposera une expérience sur mesure et un devis ferme sous 48h.`
            : `Décrivez votre besoin : ${club.name} vous renverra un devis ferme sous 48h.`}
        </p>

        <Card style={{ padding: "22px 24px" }}>
          {/* Date & créneau */}
          {isCustom ? (
            <Field label="Date souhaitée" error={errors.customDate} hint="Date indicative — le club confirmera la disponibilité">
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </Field>
          ) : (
            <Field label="Date souhaitée">
              <Select
                value={String(slotIdx)}
                onChange={(v) => setSlotIdx(Number(v))}
                options={experience.slots.map((s, i) => ({ value: String(i), label: slotLabel(s) }))}
                allowEmpty={false}
                ariaLabel="Date souhaitée"
                leadingIcon={<Icon name="calendar" size={15} color="var(--ink-3)" />}
              />
            </Field>
          )}

          {/* Format (sur mesure uniquement) */}
          {isCustom && (
            <Field label="Format souhaité" style={{ marginTop: 20 }}>
              <Select
                value={format}
                onChange={(v) => setFormat(v)}
                options={FORMAT_OPTIONS}
                allowEmpty={false}
                ariaLabel="Format souhaité"
              />
            </Field>
          )}

          {/* Participants */}
          <Field
            label="Participants"
            hint={isCustom ? "Effectif indicatif" : `Capacité : ${capacityMin}–${capacityMax} personnes`}
            error={errors.participants}
            style={{ marginTop: 20 }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "6px 10px", maxWidth: 220 }}>
              <button type="button" aria-label="Retirer un participant" disabled={participants <= capacityMin} onClick={() => setParticipants(clamp(participants - 1))} className="sy-btn sy-btn-soft sy-btn-icon-sm" style={{ opacity: participants <= capacityMin ? 0.4 : 1 }}>
                <Icon name="minus" size={15} />
              </button>
              <input type="number" min={capacityMin} max={experience ? capacityMax : undefined} value={participants} onChange={(e) => setParticipants(clamp(Number(e.target.value) || capacityMin))} aria-label="Nombre de participants" style={{ width: 64, textAlign: "center", border: "none", outline: "none", background: "transparent", fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: "var(--ink)" }} />
              <button type="button" aria-label="Ajouter un participant" disabled={!!experience && participants >= capacityMax} onClick={() => setParticipants(clamp(participants + 1))} className="sy-btn sy-btn-soft sy-btn-icon-sm" style={{ opacity: experience && participants >= capacityMax ? 0.4 : 1 }}>
                <Icon name="plus" size={15} />
              </button>
            </div>
          </Field>

          {/* Budget indicatif (sur mesure uniquement) */}
          {isCustom && (
            <Field label="Budget indicatif (optionnel)" hint="En euros HT — aide le club à calibrer sa proposition" style={{ marginTop: 20 }}>
              <Input inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} placeholder="5000" />
            </Field>
          )}

          {/* Lieu */}
          <div className="sy-field" style={{ marginTop: 20 }}>
            <label className="sy-label">Lieu de l'événement</label>
            {canChooseLocation && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                {([{ mode: "at_venue", label: `Au club · ${venueLabel}` }, { mode: "at_client", label: "À votre adresse" }] as const).map((opt) => {
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
                  <div style={{ fontWeight: 500 }}>{venueLabel}</div>
                  <div className="sy-small sy-muted">
                    {isCustom ? "Le club vous accueille dans ses installations." : "Cette expérience se déroule dans les installations du club."}
                  </div>
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
          <Field
            label={isCustom ? "Décrivez votre projet" : "Message au club (optionnel)"}
            hint="Précisez vos attentes : contexte, contraintes, options souhaitées…"
          >
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Bonjour, c'est pour notre séminaire annuel…" />
          </Field>
        </Card>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, flexWrap: "wrap", gap: 8 }}>
          <Link href={backHref} style={{ textDecoration: "none" }}>
            <Btn variant="ghost" icon={<Icon name="arrowLeft" size={14} />}>{backLabel}</Btn>
          </Link>
          <Btn type="submit" variant="primary" size="lg" disabled={pending} iconRight={<Icon name="arrow" size={16} color="#fff" />}>
            {pending ? "Envoi…" : "Envoyer ma demande de devis"}
          </Btn>
        </div>
        {submitError && (
          <p className="sy-small" role="alert" style={{ marginTop: 10, color: "var(--danger)", textAlign: "right" }}>
            {submitError}
          </p>
        )}
      </div>

      {/* Récap latéral */}
      <aside>
        <div style={{ position: "sticky", top: 16 }}>
          <Card variant="elevated" style={{ padding: 20 }}>
            <div className="sy-mono">{club.name}</div>
            <div className="sy-h3" style={{ marginTop: 2 }}>{isCustom ? "Devis sur mesure" : experience.title}</div>
            <div className="sy-small sy-muted" style={{ marginTop: 4 }}>
              {isCustom
                ? `${FORMAT_OPTIONS.find((f) => f.value === format)?.label ?? "Sur mesure"} · ${cityLabel}`
                : `${experience.format} · ${cityLabel}`}
            </div>
            <div style={{ marginTop: 16, padding: 14, borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="sy-mono">{isCustom ? "Montant" : "Estimation TTC"}</div>
                <div className="sy-num" style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: isCustom ? 18 : 24, fontVariationSettings: "var(--display-var)" }}>
                  {isCustom ? "Sur devis" : eurDecimal(estimateCents)}
                </div>
              </div>
              {!isCustom && experience.priceModel === "per_person" && (
                <div className="sy-small sy-muted" style={{ marginTop: 4 }}>{eurDecimal(experience.pricePerPersonCents)} × {participants} pers.</div>
              )}
            </div>
            <div className="sy-small sy-muted" style={{ marginTop: 10 }}>
              {isCustom
                ? "Le club chiffre votre demande et vous renvoie un devis ferme."
                : "Estimation indicative — le montant ferme figure dans le devis envoyé par le club."}
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
