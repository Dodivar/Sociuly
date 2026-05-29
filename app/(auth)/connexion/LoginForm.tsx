"use client";

import { useActionState, useId, useState } from "react";
import Link from "next/link";
import { Btn } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { loginAction, type LoginActionState } from "./actions";

const INITIAL: LoginActionState = { ok: false };

export function LoginForm({ defaultRedirect }: { defaultRedirect?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);
  const [showPassword, setShowPassword] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();
  const formErrorId = useId();
  const emailErrId = `${emailId}-err`;
  const passwordErrId = `${passwordId}-err`;

  const fe = state.fieldErrors;

  return (
    <form action={formAction} noValidate aria-describedby={state.formError ? formErrorId : undefined}>
      {/* Erreur globale — live region pour les lecteurs d'écran */}
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

      {/* Email */}
      <div className="sy-field" style={{ marginBottom: 16 }}>
        <label htmlFor={emailId} className="sy-label">Adresse e-mail</label>
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
          placeholder="prenom@club.fr"
          className="sy-input"
          style={fe?.email ? { borderColor: "var(--danger)" } : undefined}
        />
        {fe?.email && (
          <p id={emailErrId} className="sy-small" style={{ color: "var(--danger)", marginTop: 6 }}>
            {fe.email}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="sy-field" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <label htmlFor={passwordId} className="sy-label">Mot de passe</label>
          <Link
            href="/mot-de-passe-oublie"
            className="sy-small sy-link"
            style={{ marginBottom: 6 }}
          >
            Oublié ?
          </Link>
        </div>
        <div
          className="sy-input"
          style={{
            padding: 0,
            ...(fe?.password ? { borderColor: "var(--danger)" } : null),
          }}
        >
          <input
            id={passwordId}
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            minLength={8}
            aria-invalid={!!fe?.password || undefined}
            aria-describedby={fe?.password ? passwordErrId : undefined}
            placeholder="••••••••"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "var(--sans)",
              fontSize: 14,
              color: "var(--ink)",
              height: "100%",
              padding: "0 14px",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-pressed={showPassword}
            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              height: "100%",
              padding: "0 12px",
              display: "inline-flex",
              alignItems: "center",
              color: "var(--ink-3)",
            }}
          >
            <Icon name={showPassword ? "eye" : "lock"} size={16} color="currentColor" />
          </button>
        </div>
        {fe?.password && (
          <p id={passwordErrId} className="sy-small" style={{ color: "var(--danger)", marginTop: 6 }}>
            {fe.password}
          </p>
        )}
      </div>

      {/* Remember me */}
      <label
        htmlFor={rememberId}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          marginBottom: 22,
          fontSize: 13.5,
          color: "var(--ink-2)",
        }}
      >
        <input
          id={rememberId}
          name="remember"
          type="checkbox"
          defaultChecked={state.values?.remember ?? true}
          style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
        />
        Se souvenir de moi sur ce navigateur
      </label>

      {/* Honeypot redirect target — passé en hidden pour pouvoir post-rediriger */}
      {defaultRedirect && (
        <input type="hidden" name="redirect" value={defaultRedirect} />
      )}

      <Btn
        type="submit"
        variant="primary"
        size="lg"
        block
        disabled={pending}
        aria-busy={pending || undefined}
        iconRight={!pending ? <Icon name="arrow" size={16} color="#fff" /> : undefined}
      >
        {pending ? "Connexion…" : "Se connecter à la console"}
      </Btn>

      <p
        className="sy-small"
        style={{ marginTop: 22, textAlign: "center", color: "var(--ink-2)" }}
      >
        Pas encore de compte gérant ?{" "}
        <Link href="/inscription" className="sy-link" style={{ color: "var(--ink)", fontWeight: 600 }}>
          Inscrire mon association
        </Link>
      </p>
    </form>
  );
}
