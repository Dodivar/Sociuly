import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ds/patterns";

export const metadata: Metadata = {
  title: "Inscrire mon entreprise · Sociuly",
  description:
    "Créez un compte entreprise Sociuly pour demander des devis aux clubs partenaires et organiser des expériences sportives sur-mesure pour vos équipes.",
};

export default function InscriptionEntrepriseLayout({ children }: { children: ReactNode }) {
  return (
    <div className="inscre-shell">
      <header className="inscre-nav">
        <Link href="/" aria-label="Accueil Sociuly" style={{ textDecoration: "none", color: "inherit" }}>
          <Logo />
        </Link>
        <Link href="/experiences" className="sy-small sy-link" style={{ color: "var(--ink-3)" }}>
          ← Retour au site
        </Link>
      </header>

      <main className="inscre-body">{children}</main>

      <footer className="inscre-footer">
        <span className="sy-mono" style={{ color: "var(--ink-3)" }}>
          © Sociuly · Inscription entreprise
        </span>
        <span style={{ display: "inline-flex", gap: 16, flexWrap: "wrap" }}>
          {[
            ["Mentions légales", "/mentions-legales"],
            ["Confidentialité", "/confidentialite"],
            ["CGU", "/cgu"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="sy-small sy-link" style={{ color: "var(--ink-3)" }}>
              {label}
            </Link>
          ))}
        </span>
      </footer>

      <style>{`
        .inscre-shell {
          min-height: 100vh;
          background: var(--bg);
          display: grid;
          grid-template-rows: auto 1fr auto;
        }
        .inscre-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 32px;
          border-bottom: 1px solid var(--line);
          background: var(--surface);
        }
        .inscre-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 16px 64px;
        }
        .inscre-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 32px; gap: 12px; flex-wrap: wrap;
          border-top: 1px solid var(--line);
          background: var(--surface);
        }
        @media (max-width: 768px) {
          .inscre-nav, .inscre-footer { padding: 16px 20px; }
          .inscre-body { padding: 32px 16px 48px; }
        }
        .inscre-body .sy-auth-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          padding: 36px;
          box-shadow: var(--shadow-md);
          width: 100%;
        }
        @media (max-width: 768px) {
          .inscre-body .sy-auth-card { padding: 28px; }
        }
      `}</style>
    </div>
  );
}
