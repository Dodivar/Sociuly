"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { requestMagicLinkAction, type LoginActionState } from "./actions";

const INITIAL: LoginActionState = { ok: false };

// Délai anti-spam entre deux demandes de lien (secondes).
const RESEND_COOLDOWN_S = 60;

export function LoginForm({ defaultRedirect }: { defaultRedirect?: string }) {
  const [state, formAction, pending] = useActionState(requestMagicLinkAction, INITIAL);

  if (state.ok && state.sentTo) {
    return (
      <LinkSentView
        email={state.sentTo}
        formAction={formAction}
        defaultRedirect={defaultRedirect}
      />
    );
  }

  return (
    <RequestLinkForm
      state={state}
      formAction={formAction}
      pending={pending}
      defaultRedirect={defaultRedirect}
    />
  );
}

/* ─── Écran 1 : demande du lien magique ─────────────────────────────── */

function RequestLinkForm({
  state,
  formAction,
  pending,
  defaultRedirect,
}: {
  state: LoginActionState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  defaultRedirect?: string;
}) {
  const emailId = useId();
  const formErrorId = useId();
  const emailErrId = `${emailId}-err`;

  const fe = state.fieldErrors;

  return (
    <form action={formAction} noValidate aria-describedby={state.formError ? formErrorId : undefined}>
      <div
        id={formErrorId}
        role="alert"
        aria-live="polite"
        style={{ minHeight: state.formError ? undefined : 0 }}
      >
        {state.formError && (
          <div
            className="sy-small"
            style={{
              marginBottom: 18,
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(211, 58, 31, 0.08)",
              border: "1px solid rgba(211, 58, 31, 0.25)",
              color: "var(--danger)",
            }}
          >
            {state.formError}
          </div>
        )}
      </div>

      <div className="sy-field" style={{ marginBottom: 16 }}>
        <label htmlFor={emailId} className="sy-label">Adresse e-mail professionnelle</label>
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email ?? ""}
          aria-invalid={!!fe?.email || undefined}
          aria-describedby={fe?.email ? emailErrId : undefined}
          placeholder="prenom.nom@entreprise.fr"
          className="sy-input"
          style={fe?.email ? { borderColor: "var(--danger)" } : undefined}
        />
        {fe?.email && (
          <p id={emailErrId} className="sy-small" style={{ color: "var(--danger)", marginTop: 6 }}>
            {fe.email}
          </p>
        )}
      </div>

      {defaultRedirect && <input type="hidden" name="redirect" value={defaultRedirect} />}

      <Btn
        type="submit"
        variant="primary"
        size="lg"
        block
        disabled={pending}
        aria-busy={pending || undefined}
        iconRight={!pending ? <Icon name="arrow" size={16} color="#fff" /> : undefined}
      >
        {pending ? "Envoi en cours…" : "Envoyer le lien magique"}
      </Btn>

      <ReassuranceBadges />
    </form>
  );
}

/* ─── Écran 2 : confirmation d'envoi ─────────────────────────────────── */

function LinkSentView({
  email,
  formAction,
  defaultRedirect,
}: {
  email: string;
  formAction: (formData: FormData) => void;
  defaultRedirect?: string;
}) {
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_S);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    const fd = new FormData();
    fd.set("email", email);
    if (defaultRedirect) fd.set("redirect", defaultRedirect);
    formAction(fd);
    setTimeout(() => {
      setResending(false);
      setCooldown(RESEND_COOLDOWN_S);
    }, 400);
  };

  return (
    <div role="status" aria-live="polite">
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--highlight-soft, rgba(255, 200, 60, 0.18))",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <Icon name="check" size={24} color="var(--accent-deep)" />
      </div>

      <h3 className="sy-h2" style={{ fontSize: 22, marginBottom: 8 }}>
        Vérifiez votre boîte e-mail
      </h3>
      <p className="sy-body" style={{ marginBottom: 20 }}>
        Nous avons envoyé un lien de connexion à{" "}
        <strong style={{ color: "var(--ink)" }}>{email}</strong>. Cliquez sur le lien pour
        accéder à votre espace. Le lien expire dans 1 heure.
      </p>

      <div
        className="sy-small"
        style={{
          padding: "12px 14px",
          borderRadius: "var(--radius-md)",
          background: "var(--surface-2)",
          border: "1px solid var(--line)",
          color: "var(--ink-2)",
          marginBottom: 22,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "var(--ink)" }}>Pas d'e-mail ?</strong> Vérifiez vos spams,
        puis renvoyez un lien ci-dessous. Si l'adresse n'est pas reconnue, créez d'abord
        votre compte (club ou entreprise).
      </div>

      <Btn
        type="button"
        variant="outline"
        size="md"
        block
        disabled={cooldown > 0 || resending}
        onClick={handleResend}
        aria-busy={resending || undefined}
      >
        {resending
          ? "Renvoi…"
          : cooldown > 0
            ? `Renvoyer le lien (${cooldown}s)`
            : "Renvoyer le lien"}
      </Btn>

      <p className="sy-small" style={{ marginTop: 14, textAlign: "center" }}>
        <Link href="/connexion" className="sy-link" style={{ color: "var(--ink-2)" }}>
          ← Utiliser une autre adresse e-mail
        </Link>
      </p>
    </div>
  );
}

/* ─── Pied de formulaire : badges « sans mot de passe » ─────────────── */

function ReassuranceBadges() {
  return (
    <div
      className="sy-small"
      style={{
        marginTop: 22,
        display: "flex",
        justifyContent: "center",
        gap: 22,
        color: "var(--ink-3)",
        flexWrap: "wrap",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Icon name="bolt" size={14} color="currentColor" />
        Sans mot de passe
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Icon name="lock" size={14} color="currentColor" />
        Lien sécurisé par e-mail
      </span>
    </div>
  );
}
