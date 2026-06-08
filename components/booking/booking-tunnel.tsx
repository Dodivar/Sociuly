"use client";

// Tunnel de réservation /reserver/[ref] — Client Component pilotant les 4 étapes
// du BookingStepper (Détails → Coordonnées → Acompte → Confirmation).
//
// SPEC §2/§5/§6 : Sociuly est B2B et vend par DEVIS, pas en réservation
// instantanée. Ce tunnel modélise la contractualisation post-devis : l'acheteur
// (Organization) confirme les détails, ses coordonnées, puis règle l'acompte.
// Le CTA paiement est un PLACEHOLDER (UI seulement) — l'intégration Stripe
// Connect (acompte 30%, commission 6% TTC côté serveur) arrive en Phase B.
//
// Exigences couvertes :
//  - navigation avant/arrière entre les étapes, blocage si l'étape est invalide ;
//  - validation par étape (date dispo, adresse si `at_client`, infos entreprise) ;
//  - état persistant entre étapes (sessionStorage, clé dérivée de la réf.).

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Btn, Card, Field, Input, Select, Stars, Textarea } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { Logo } from "@/components/ds/patterns";
import { ImpactMini } from "@/components/ds/impact";
import { BookingStepper } from "@/components/booking/stepper";
import { eurDecimal } from "@/lib/marketplace/experience-detail";
import {
  type BookingExperience,
  type BookingForm,
  type FieldErrors,
  type StepNumber,
  allowsLocationChoice,
  depositCents,
  estimateCents,
  LAST_TUNNEL_STEP,
  makeBookingNumber,
  needsAddress,
  slotLabel,
  validateStep,
} from "@/lib/booking/tunnel";

type Props = {
  experience: BookingExperience;
  initial: { slotIdx: number; participants: number };
  /** Vrai quand on arrive depuis un devis accepté : les détails sont verrouillés. */
  locked?: boolean;
  /** Montant TTC ferme issu du devis accepté (centimes) — prime l'estimation locale. */
  lockedTotalCents?: number;
  /** N° du devis accepté (bandeau de contexte). */
  quoteNumber?: string;
  /** Libellé du lieu verrouillé (adresse du devis ou installations du club). */
  lockedPlace?: string;
  /** Libellé date/créneau verrouillé issu du devis (prime le créneau catalogue). */
  lockedSlotText?: string;
  /** Coordonnées entreprise pré-remplies depuis le devis accepté. */
  initialContact?: {
    companyName: string;
    contactName: string;
    contactEmail: string;
    phone: string;
  };
};

const STEP_META: Record<StepNumber, { title: string; desc: string }> = {
  1: {
    title: "Détails de l'expérience",
    desc: "Confirmez la date, l'effectif et le lieu de votre événement.",
  },
  2: {
    title: "Coordonnées de l'entreprise",
    desc: "Qui réserve cette expérience ? Le club vous recontactera sous 24h.",
  },
  3: {
    title: "Acompte (30%)",
    desc: "Réglez l'acompte pour confirmer votre réservation. Le solde est dû avant l'événement.",
  },
};

export function BookingTunnel({
  experience, initial, locked, lockedTotalCents, quoteNumber, lockedPlace, lockedSlotText, initialContact,
}: Props) {
  const router = useRouter();
  const draftKey = `sociuly_booking_${experience.ref}`;

  const [step, setStep] = useState<StepNumber>(1);
  // Étape maximale atteinte → borne la navigation avant via le stepper.
  const [maxStep, setMaxStep] = useState<StepNumber>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  // Numéro de réservation stable pour le placeholder de confirmation.
  const [bookingNumber] = useState(makeBookingNumber);

  const [form, setForm] = useState<BookingForm>({
    slotIdx: initial.slotIdx,
    participants: initial.participants,
    locationMode: experience.location === "at_client" ? "at_client" : "at_venue",
    addressLine: "",
    addressPostal: "",
    addressCity: "",
    companyName: initialContact?.companyName ?? "",
    contactName: initialContact?.contactName ?? "",
    contactEmail: initialContact?.contactEmail ?? "",
    phone: initialContact?.phone ?? "",
    message: "",
    cgvAccepted: false,
  });

  // Réhydratation depuis sessionStorage (état persistant entre étapes / reloads).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(draftKey);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<BookingForm>;
        setForm((p) => ({ ...p, ...draft }));
      }
    } catch { /* sessionStorage indisponible */ }
  }, [draftKey]);

  // Persistance à chaque modification.
  useEffect(() => {
    try {
      sessionStorage.setItem(draftKey, JSON.stringify(form));
    } catch { /* ignore */ }
  }, [draftKey, form]);

  const set = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // Montant : verrouillé sur le devis accepté si fourni, sinon estimation locale.
  const totalCents = useMemo(
    () => (locked && lockedTotalCents != null ? lockedTotalCents : estimateCents(experience, form.participants)),
    [locked, lockedTotalCents, experience, form.participants],
  );
  const deposit = depositCents(totalCents);
  const balance = totalCents - deposit;

  const slot = experience.slots[form.slotIdx];
  const addressRequired = needsAddress(experience, form);

  // Valide l'étape courante ; si OK, avance (ou déclenche le paiement à l'étape 3).
  const goNext = () => {
    // En mode verrouillé, l'étape 1 (détails) provient du devis accepté : déjà
    // validée à la contractualisation, on ne la re-valide pas (adresse incluse).
    const skipValidation = locked && step === 1;
    const errs = skipValidation ? {} : validateStep(step, experience, form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    if (step === LAST_TUNNEL_STEP) {
      // CTA paiement — PLACEHOLDER : aucune charge Stripe ici (à brancher).
      router.push(`/reserver/${encodeURIComponent(bookingNumber)}/confirmation`);
      return;
    }
    const next = (step + 1) as StepNumber;
    setStep(next);
    setMaxStep((m) => (next > m ? next : m));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setErrors({});
    if (step === 1) {
      router.push(`/experiences/${experience.slug}`);
      return;
    }
    setStep((s) => (s - 1) as StepNumber);
  };

  // Navigation via le stepper : retour autorisé vers une étape déjà franchie.
  const goToStep = (index: number) => {
    const target = (index + 1) as StepNumber;
    if (target > maxStep) return;
    setErrors({});
    setStep(target);
  };

  const meta =
    locked && step === 1
      ? {
          title: "Récapitulatif de votre devis",
          desc: "Ces détails proviennent du devis que vous avez accepté. Vérifiez-les, puis réglez l'acompte.",
        }
      : STEP_META[step];

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Barre supérieure fine : logo · stepper interactif · paiement sécurisé */}
      <div
        style={{
          padding: "16px var(--page-pad)", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 24, background: "var(--surface)", flexWrap: "wrap",
        }}
      >
        <Link href={`/experiences/${experience.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
          <Logo />
        </Link>
        <BookingStepper active={step - 1} reachable={maxStep - 1} onStepClick={goToStep} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="lock" size={14} color="var(--ink-3)" />
          <span className="sy-mono">paiement sécurisé Stripe</span>
        </div>
      </div>

      <div className="booking-grid">
        <div>
          <div className="sy-mono" style={{ color: "var(--primary)", marginBottom: 6 }}>
            Étape {step} sur 4
          </div>
          <h1 className="sy-h1" style={{ marginBottom: 6 }}>{meta.title}</h1>
          <p className="sy-small sy-muted" style={{ marginBottom: 22 }}>{meta.desc}</p>

          {locked && quoteNumber && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
                padding: "12px 14px", borderRadius: "var(--radius-md)",
                background: "var(--primary-soft)", color: "var(--primary-deep)",
              }}
            >
              <Icon name="check" size={15} color="var(--primary-deep)" />
              <span className="sy-small">
                Devis <strong>{quoteNumber}</strong> accepté — il ne vous reste qu'à régler l'acompte.
              </span>
            </div>
          )}

          <Card style={{ padding: "22px 24px" }}>
            {step === 1 && (
              <StepDetails
                experience={experience}
                form={form}
                errors={errors}
                addressRequired={addressRequired}
                set={set}
                locked={locked}
                lockedPlace={lockedPlace}
                lockedSlotText={lockedSlotText}
              />
            )}
            {step === 2 && <StepCoordonnees form={form} errors={errors} set={set} />}
            {step === 3 && (
              <StepAcompte
                form={form}
                errors={errors}
                set={set}
                depositLabel={eurDecimal(deposit)}
                balanceLabel={eurDecimal(balance)}
              />
            )}

            {/* Navigation avant / arrière */}
            <div
              style={{
                display: "flex", justifyContent: "space-between", marginTop: 24,
                flexWrap: "wrap", gap: 8,
              }}
            >
              <Btn variant="ghost" onClick={goBack} icon={<Icon name="arrowLeft" size={14} />}>
                {step === 1 ? "Retour à l'expérience" : "Étape précédente"}
              </Btn>

              {step === LAST_TUNNEL_STEP ? (
                <Btn
                  variant="primary"
                  size="lg"
                  onClick={goNext}
                  icon={<Icon name="lock" size={15} color="#fff" />}
                >
                  Payer l&apos;acompte · {eurDecimal(deposit)}
                </Btn>
              ) : (
                <Btn
                  variant="dark"
                  onClick={goNext}
                  iconRight={<Icon name="arrow" size={14} color="#fff" />}
                >
                  Continuer
                </Btn>
              )}
            </div>
          </Card>
        </div>

        <aside>
          <div style={{ position: "sticky", top: 16 }}>
            <BookingSummary
              experience={experience}
              slotText={locked && lockedSlotText ? lockedSlotText : slot ? slotLabel(slot) : "—"}
              participants={form.participants}
              placeText={locked && lockedPlace ? lockedPlace : placeText(experience, form, addressRequired)}
              totalLabel={eurDecimal(totalCents)}
              depositLabel={eurDecimal(deposit)}
              balanceLabel={eurDecimal(balance)}
            />
          </div>
        </aside>
      </div>

      <style>{`
        .booking-grid {
          padding: 28px var(--page-pad);
          max-width: 1440px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 32px;
        }
        @media (max-width: 1024px) {
          .booking-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .booking-grid { padding-top: 20px; padding-bottom: 20px; }
        }
      `}</style>
    </main>
  );
}

// ─────── Libellé du lieu pour le récap ───────
function placeText(exp: BookingExperience, form: BookingForm, addressRequired: boolean): string {
  if (addressRequired) {
    const parts = [form.addressLine.trim(), `${form.addressPostal.trim()} ${form.addressCity.trim()}`.trim()]
      .filter(Boolean);
    return parts.length ? parts.join(", ") : "Chez vous (adresse à renseigner)";
  }
  return exp.venueLabel;
}

// ─────── Étape 1 — Détails ───────
function StepDetails({
  experience, form, errors, addressRequired, set, locked, lockedPlace, lockedSlotText,
}: {
  experience: BookingExperience;
  form: BookingForm;
  errors: FieldErrors;
  addressRequired: boolean;
  set: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  locked?: boolean;
  lockedPlace?: string;
  lockedSlotText?: string;
}) {
  const { capacityMin, capacityMax, slots } = experience;
  const clamp = (n: number) => Math.min(capacityMax, Math.max(capacityMin, n));

  // Mode verrouillé (post-acceptation) : récap en lecture seule, non modifiable.
  if (locked) {
    const slot = slots[form.slotIdx];
    return (
      <dl style={{ margin: 0, display: "flex", flexDirection: "column" }}>
        <LockedRow label="Date & créneau" value={lockedSlotText ?? (slot ? slotLabel(slot) : "—")} />
        <LockedRow label="Participants" value={`${form.participants} personnes`} />
        <LockedRow label="Lieu" value={lockedPlace ?? placeText(experience, form, addressRequired)} />
      </dl>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Date & créneau */}
      <Field label="Date & créneau" error={errors.slotIdx}>
        <Select
          value={String(form.slotIdx)}
          onChange={(v) => set("slotIdx", Number(v))}
          options={slots.map((s, i) => ({ value: String(i), label: slotLabel(s) }))}
          allowEmpty={false}
          ariaLabel="Date & créneau"
          leadingIcon={<Icon name="calendar" size={15} color="var(--ink-3)" />}
        />
      </Field>

      {/* Participants */}
      <Field
        label="Participants"
        hint={`Capacité : ${capacityMin}–${capacityMax} personnes`}
        error={errors.participants}
      >
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: "6px 10px",
            maxWidth: 220,
          }}
        >
          <button
            type="button"
            aria-label="Retirer un participant"
            disabled={form.participants <= capacityMin}
            onClick={() => set("participants", clamp(form.participants - 1))}
            className="sy-btn sy-btn-soft sy-btn-icon-sm"
            style={{ opacity: form.participants <= capacityMin ? 0.4 : 1 }}
          >
            <Icon name="minus" size={15} />
          </button>
          <input
            type="number"
            min={capacityMin}
            max={capacityMax}
            value={form.participants}
            onChange={(e) => set("participants", clamp(Number(e.target.value) || capacityMin))}
            aria-label="Nombre de participants"
            style={{
              width: 64, textAlign: "center", border: "none", outline: "none", background: "transparent",
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 20, color: "var(--ink)",
            }}
          />
          <button
            type="button"
            aria-label="Ajouter un participant"
            disabled={form.participants >= capacityMax}
            onClick={() => set("participants", clamp(form.participants + 1))}
            className="sy-btn sy-btn-soft sy-btn-icon-sm"
            style={{ opacity: form.participants >= capacityMax ? 0.4 : 1 }}
          >
            <Icon name="plus" size={15} />
          </button>
        </div>
      </Field>

      {/* Lieu */}
      <LocationBlock experience={experience} form={form} errors={errors} addressRequired={addressRequired} set={set} />
    </div>
  );
}

// ─────── Bloc Lieu (conditionnel selon Experience.location) ───────
function LocationBlock({
  experience, form, errors, addressRequired, set,
}: {
  experience: BookingExperience;
  form: BookingForm;
  errors: FieldErrors;
  addressRequired: boolean;
  set: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
}) {
  const canChoose = allowsLocationChoice(experience);

  return (
    <div className="sy-field">
      <label className="sy-label">Lieu de l&apos;événement</label>

      {/* Choix du lieu pour les expériences flexibles */}
      {canChoose && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {([
            { mode: "at_venue", label: `Au club · ${experience.venueLabel}` },
            { mode: "at_client", label: "À votre adresse" },
          ] as const).map((opt) => {
            const on = form.locationMode === opt.mode;
            return (
              <button
                key={opt.mode}
                type="button"
                onClick={() => set("locationMode", opt.mode)}
                className="sy-chip"
                aria-pressed={on}
                style={{
                  cursor: "pointer",
                  background: on ? "var(--ink)" : "var(--surface)",
                  color: on ? "var(--surface)" : "var(--ink)",
                  border: `1px solid ${on ? "var(--ink)" : "var(--line-2)"}`,
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      {addressRequired ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Field label="Adresse" error={errors.addressLine}>
            <Input
              value={form.addressLine}
              onChange={(e) => set("addressLine", e.target.value)}
              placeholder="12 rue des Tanneurs"
              autoComplete="street-address"
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: 12 }}>
            <Field label="Code postal" error={errors.addressPostal}>
              <Input
                inputMode="numeric"
                value={form.addressPostal}
                onChange={(e) => set("addressPostal", e.target.value.replace(/\D/g, "").slice(0, 5))}
                placeholder="67000"
                maxLength={5}
              />
            </Field>
            <Field label="Ville" error={errors.addressCity}>
              <Input
                value={form.addressCity}
                onChange={(e) => set("addressCity", e.target.value)}
                placeholder="Strasbourg"
                autoComplete="address-level2"
              />
            </Field>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px", borderRadius: "var(--radius-md)", background: "var(--surface-2)",
          }}
        >
          <Icon name="pin" size={16} color="var(--ink-3)" />
          <div>
            <div style={{ fontWeight: 500 }}>{experience.venueLabel}</div>
            <div className="sy-small sy-muted">Cette expérience se déroule dans les installations du club.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────── Étape 2 — Coordonnées entreprise ───────
function StepCoordonnees({
  form, errors, set,
}: {
  form: BookingForm;
  errors: FieldErrors;
  set: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Field label="Entreprise" error={errors.companyName}>
        <Input
          value={form.companyName}
          onChange={(e) => set("companyName", e.target.value)}
          placeholder="Ex : Klaxoon SAS"
          autoComplete="organization"
        />
      </Field>
      <Field label="Contact référent" error={errors.contactName}>
        <Input
          value={form.contactName}
          onChange={(e) => set("contactName", e.target.value)}
          placeholder="Camille Léger · Office Manager"
          autoComplete="name"
        />
      </Field>
      <Field label="Email" error={errors.contactEmail} hint="La confirmation et le devis y seront envoyés">
        <Input
          type="email"
          value={form.contactEmail}
          onChange={(e) => set("contactEmail", e.target.value)}
          placeholder="camille@entreprise.fr"
          autoComplete="email"
        />
      </Field>
      <Field label="Téléphone (optionnel)" hint="Pour faciliter la coordination le jour J">
        <Input
          type="tel"
          value={form.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="06 12 34 56 78"
          autoComplete="tel"
        />
      </Field>
      <Field
        label="Message au club (optionnel)"
        hint="Précisez vos attentes : effectif définitif, contraintes d'accès, besoins logistiques…"
      >
        <Textarea
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          placeholder="Bonjour, c'est pour notre séminaire annuel…"
        />
      </Field>
    </div>
  );
}

// ─────── Étape 3 — Acompte (placeholder paiement) ───────
function StepAcompte({
  form, errors, set, depositLabel, balanceLabel,
}: {
  form: BookingForm;
  errors: FieldErrors;
  set: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
  depositLabel: string;
  balanceLabel: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Échéancier */}
      <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--surface-2)" }}>
        <SummaryRow label="Acompte à régler aujourd'hui (30%)" value={depositLabel} strong />
        <SummaryRow label="Solde dû avant l'événement" value={balanceLabel} />
      </div>

      {/* Placeholder du module de paiement Stripe */}
      <div
        style={{
          padding: 20, borderRadius: "var(--radius-md)",
          border: "1.5px dashed var(--line-2)", background: "var(--surface)",
          display: "flex", flexDirection: "column", gap: 8, alignItems: "center", textAlign: "center",
        }}
      >
        <Icon name="lock" size={20} color="var(--ink-3)" />
        <div style={{ fontWeight: 600 }}>Paiement sécurisé par carte</div>
        <div className="sy-small sy-muted">
          Le module de paiement Stripe sera intégré ici. Aucune carte n&apos;est débitée à ce stade.
        </div>
      </div>

      {/* Acceptation CGV — bloque le paiement tant que non cochée */}
      <div>
        <label
          style={{
            display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={form.cgvAccepted}
            onChange={(e) => set("cgvAccepted", e.target.checked)}
            style={{ marginTop: 3, width: 18, height: 18, accentColor: "var(--primary)", flexShrink: 0 }}
          />
          <span className="sy-small">
            J&apos;accepte les conditions générales de vente et la politique d&apos;annulation.
            L&apos;acompte est non remboursable une fois le devis accepté.
          </span>
        </label>
        {errors.cgvAccepted && (
          <div className="sy-small" role="alert" style={{ marginTop: 6, color: "var(--danger)" }}>
            {errors.cgvAccepted}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────── Récapitulatif (rail droit) ───────
//
// SPEC §5 : le prix TTC affiché = montant payé par l'entreprise. La commission
// Sociuly (6% du TTC) n'est jamais surfacée à l'acheteur (calcul serveur).
// TODO(§11) : décomposition HT / TVA / TTC pour la facture — base TVA selon
// Club.vatLiable, décision comptable OUVERTE. Ne pas figer de taux ici.
function BookingSummary({
  experience, slotText, participants, placeText, totalLabel, depositLabel, balanceLabel,
}: {
  experience: BookingExperience;
  slotText: string;
  participants: number;
  placeText: string;
  totalLabel: string;
  depositLabel: string;
  balanceLabel: string;
}) {
  return (
    <Card variant="elevated" style={{ padding: 0, overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
      <div style={{ display: "flex", gap: 12, padding: 18, borderBottom: "1px solid var(--line)" }}>
        <div
          className="sy-img"
          style={{
            width: 80, height: 80, flex: "0 0 auto", borderRadius: 12,
            background: "linear-gradient(135deg, #1f4b3f 0%, #14332b 100%)",
          }}
        />
        <div style={{ flex: 1 }}>
          <div className="sy-mono">{experience.clubName}</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>{experience.title}</div>
          <div className="sy-small sy-muted" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
            <Stars value={experience.rating} size={11} /> {experience.rating.toFixed(1)} ({experience.reviewCount})
          </div>
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <SummaryRow label="Date" value={slotText} />
        <SummaryRow label="Participants" value={`${participants} personnes`} />
        <SummaryRow label="Lieu" value={placeText} />
        <hr className="sy-divider" style={{ margin: "14px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="sy-h3">Total TTC</div>
          <div
            className="sy-num"
            style={{
              fontFamily: "var(--display)", fontWeight: 700, fontSize: 28,
              fontVariationSettings: "var(--display-var)",
            }}
          >
            {totalLabel}
          </div>
        </div>
        <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "var(--surface-2)" }}>
          <SummaryRow label="Acompte aujourd'hui (30%)" value={depositLabel} />
          <SummaryRow label="Solde avant l'événement" value={balanceLabel} />
        </div>
        <div className="sy-small sy-muted" style={{ marginTop: 10 }}>
          Estimation indicative — le montant ferme figure dans votre devis.
        </div>
      </div>
      <div style={{ padding: 18, background: "var(--accent-soft)" }}>
        <ImpactMini />
      </div>
    </Card>
  );
}

// Ligne de récap en lecture seule (mode verrouillé, post-acceptation du devis).
function LockedRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        gap: 16, padding: "12px 0", borderTop: "1px solid var(--line)",
      }}
    >
      <dt className="sy-mono">{label}</dt>
      <dd style={{ margin: 0, textAlign: "right", color: "var(--ink)", fontWeight: 500, fontSize: 14 }}>{value}</dd>
    </div>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className="sy-small"
      style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
    >
      <span className="sy-muted">{label}</span>
      <span style={{ fontWeight: strong ? 700 : 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}
