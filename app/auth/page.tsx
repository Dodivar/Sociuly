"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, signUp } from "./actions";
import type { AuthState } from "./actions";
import { Logo } from "@/components/ds/patterns";
import { Btn, Field, Input, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";

type Tab = "login" | "signup";

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);

  const [loginState, loginAction, loginPending] = useActionState<
    AuthState | null,
    FormData
  >(signIn, null);

  const [signupState, signupAction, signupPending] = useActionState<
    AuthState | null,
    FormData
  >(signUp, null);

  const state = tab === "login" ? loginState : signupState;
  const isPending = tab === "login" ? loginPending : signupPending;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "var(--screen-pad)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-block" }}>
            <Logo size={28} />
          </Link>
          <p className="sy-body" style={{ marginTop: 8 }}>
            Espace clubs &amp; associations
          </p>
        </div>

        {/* Auth card */}
        <div className="sy-card sy-card-elevated" style={{ padding: 32 }}>
          <Tabs
            items={[
              { id: "login", label: "Connexion" },
              { id: "signup", label: "Inscription" },
            ]}
            active={tab}
            onChange={(id) => setTab(id as Tab)}
          />

          <div style={{ marginTop: 24 }}>
            {/* Feedback banner */}
            {state?.error && (
              <div
                role="alert"
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "color-mix(in srgb, var(--danger) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--danger) 22%, transparent)",
                  color: "var(--danger)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                {state.error}
              </div>
            )}
            {state?.success && (
              <div
                role="status"
                style={{
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "color-mix(in srgb, var(--success) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--success) 22%, transparent)",
                  color: "var(--success)",
                  fontSize: 14,
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                {state.success}
              </div>
            )}

            {/* ── Login form ── */}
            {tab === "login" && (
              <form action={loginAction} noValidate>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Adresse email">
                    <Input
                      type="email"
                      name="email"
                      placeholder="contact@monclub.fr"
                      icon={<Icon name="user" size={16} />}
                      required
                      autoComplete="email"
                      disabled={loginPending}
                    />
                  </Field>

                  <Field label="Mot de passe">
                    <PasswordField
                      name="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      disabled={loginPending}
                    />
                  </Field>
                </div>

                <div style={{ marginTop: 24 }}>
                  <Btn
                    type="submit"
                    variant="primary"
                    block
                    size="lg"
                    disabled={loginPending}
                  >
                    {loginPending ? "Connexion…" : "Se connecter"}
                  </Btn>
                </div>
              </form>
            )}

            {/* ── Signup form ── */}
            {tab === "signup" && (
              <form action={signupAction} noValidate>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Field label="Nom du club ou association">
                    <Input
                      type="text"
                      name="club_name"
                      placeholder="Club Sportif de Paris"
                      required
                      autoComplete="organization"
                      disabled={signupPending}
                    />
                  </Field>

                  <Field label="Adresse email">
                    <Input
                      type="email"
                      name="email"
                      placeholder="contact@monclub.fr"
                      icon={<Icon name="user" size={16} />}
                      required
                      autoComplete="email"
                      disabled={signupPending}
                    />
                  </Field>

                  <Field label="Mot de passe" hint="8 caractères minimum">
                    <PasswordField
                      name="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      show={showPassword}
                      onToggle={() => setShowPassword((v) => !v)}
                      disabled={signupPending}
                    />
                  </Field>

                  <Field label="Confirmer le mot de passe">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="confirm_password"
                      placeholder="••••••••"
                      required
                      autoComplete="new-password"
                      disabled={signupPending}
                    />
                  </Field>
                </div>

                <div style={{ marginTop: 24 }}>
                  <Btn
                    type="submit"
                    variant="primary"
                    block
                    size="lg"
                    disabled={signupPending}
                  >
                    {signupPending ? "Création…" : "Créer mon espace club"}
                  </Btn>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/" className="sy-small sy-link">
            ← Retour au site
          </Link>
        </div>
      </div>
    </main>
  );
}

// ── Password input with show/hide toggle ──
type PasswordFieldProps = {
  name: string;
  placeholder?: string;
  autoComplete?: string;
  show: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

function PasswordField({
  name,
  placeholder,
  autoComplete,
  show,
  onToggle,
  disabled,
}: PasswordFieldProps) {
  return (
    <div style={{ position: "relative" }}>
      <Input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        icon={<Icon name="lock" size={16} />}
        required
        autoComplete={autoComplete}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--ink-3)",
          display: "flex",
          padding: 0,
          lineHeight: 1,
        }}
      >
        <Icon name="eye" size={16} />
      </button>
    </div>
  );
}
