"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import {
  submitInscription,
  createStripeConnectLink,
  type InscriptionDraft,
} from "@/lib/actions/inscription-club";

const DRAFT_KEY = "sociuly_inscription_draft";

function readDraft(): InscriptionDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const BENEFITS: { icon: "bolt" | "euro" | "flag" | "lock"; text: string }[] = [
  { icon: "bolt",  text: "Paiements sécurisés directement sur votre compte bancaire" },
  { icon: "euro",  text: "94 % de chaque réservation vous est reversé (6 % de commission Sociuly)" },
  { icon: "flag",  text: "Virements automatiques le lendemain de chaque expérience réalisée" },
  { icon: "lock",  text: "Conformité PCI-DSS — Sociuly ne stocke aucune donnée bancaire" },
];

export default function Step4Form() {
  const router = useRouter();
  const [submitting, startSubmit] = useTransition();
  const [skipping, startSkip] = useTransition();
  const [error, setError] = useState("");

  const handleStripe = () => {
    setError("");
    startSubmit(async () => {
      const draft = readDraft();
      const submitRes = await submitInscription(draft);
      if (!submitRes.success) { setError(submitRes.error ?? "Erreur inattendue"); return; }

      const email = draft.step2?.emailPresident ?? "";
      const linkRes = await createStripeConnectLink(email);
      if (!linkRes.success || !linkRes.url) {
        setError(linkRes.error ?? "Impossible de créer le lien Stripe"); return;
      }
      const nom = encodeURIComponent(draft.step1?.nomAssociation ?? "");
      router.push(`${linkRes.url}&nom=${nom}`);
    });
  };

  const handleSkip = () => {
    setError("");
    startSkip(async () => {
      const draft = readDraft();
      const submitRes = await submitInscription(draft);
      if (!submitRes.success) { setError(submitRes.error ?? "Erreur inattendue"); return; }
      const nom = encodeURIComponent(draft.step1?.nomAssociation ?? "");
      router.push(`/inscription-club/confirmation?stripe=pending&nom=${nom}`);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Hero card */}
      <div style={{ borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--line)" }}>
        <div style={{ background: "var(--accent)", padding: "20px 24px" }}>
          <div className="sy-mono" style={{ color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
            Stripe Connect Express
          </div>
          <h3 className="sy-h2" style={{ color: "#fff", margin: 0 }}>
            Configurez votre compte bancaire
          </h3>
          <p className="sy-small" style={{ color: "rgba(255,255,255,0.8)", marginTop: 8 }}>
            Nous utilisons Stripe, la référence mondiale des paiements en ligne,
            pour vous reverser vos encaissements de façon sécurisée.
          </p>
        </div>

        <div style={{ background: "var(--surface)", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {BENEFITS.map(({ icon, text }) => (
            <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "var(--primary-soft)", display: "flex",
                alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon name={icon} size={16} color="var(--primary-deep)" />
              </div>
              <span className="sy-body" style={{ paddingTop: 5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={{ display: "flex", gap: 10, padding: "12px 14px",
        background: "var(--highlight-soft)", borderRadius: 10 }}>
        <Icon name="info" size={16} color="#6e5111" style={{ flexShrink: 0, marginTop: 1 }} />
        <p className="sy-small" style={{ color: "#6e5111", margin: 0 }}>
          Préparez votre <strong>RIB au nom de l'association</strong> et une pièce d'identité
          du représentant légal. Le processus Stripe prend environ 5 minutes.
        </p>
      </div>

      {error && (
        <p className="sy-small" style={{ color: "var(--danger)", margin: 0 }}>{error}</p>
      )}

      {/* Actions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Btn
          type="button"
          variant="primary"
          size="lg"
          block
          onClick={handleStripe}
          disabled={submitting || skipping}
          iconRight={<Icon name="arrow" size={18} color="#fff" />}
        >
          {submitting ? "Connexion à Stripe…" : "Configurer mon compte bancaire"}
        </Btn>

        <button
          type="button"
          onClick={handleSkip}
          disabled={submitting || skipping}
          className="sy-small"
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "var(--ink-3)", textAlign: "center", padding: "8px 0",
            textDecoration: "underline", textDecorationColor: "var(--line-2)",
            textUnderlineOffset: "3px" }}
        >
          {skipping ? "En cours…" : "Je finaliserai ça plus tard (rappel par email)"}
        </button>
      </div>

      {/* Navigation */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
        <Btn type="button" variant="ghost"
          onClick={() => router.push("/inscription-club/etape/3")}
          disabled={submitting || skipping}
          icon={<Icon name="arrowLeft" size={18} />}>
          Précédent
        </Btn>
      </div>
    </div>
  );
}
