import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ds/patterns";

export const metadata: Metadata = {
  title: "Inscrire mon association · Sociuly",
  description:
    "Rejoignez Sociuly : inscrivez votre association sportive loi 1901 et commencez à financer vos projets de saison.",
};

export default function InscriptionClubLayout({ children }: { children: ReactNode }) {
  return (
    <div className="inscr-shell">
      <header className="inscr-nav">
        <Link href="/" aria-label="Accueil Sociuly" style={{ textDecoration: "none", color: "inherit" }}>
          <Logo />
        </Link>
        <Link href="/prestations" className="sy-small sy-link" style={{ color: "var(--ink-3)" }}>
          ← Retour au site
        </Link>
      </header>

      <main className="inscr-body">{children}</main>

      <footer className="inscr-footer">
        <span className="sy-mono" style={{ color: "var(--ink-3)" }}>© Sociuly · Inscription association</span>
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
        .inscr-shell {
          min-height: 100vh;
          background: var(--bg);
          display: grid;
          grid-template-rows: auto 1fr auto;
        }
        .inscr-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 32px;
          border-bottom: 1px solid var(--line);
          background: var(--surface);
        }
        .inscr-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 36px 16px 64px;
        }
        .inscr-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 32px; gap: 12px; flex-wrap: wrap;
          border-top: 1px solid var(--line);
          background: var(--surface);
        }
        @media (max-width: 768px) {
          .inscr-nav, .inscr-footer { padding: 16px 20px; }
          .inscr-body { padding: 24px 16px 48px; }
        }
      `}</style>
    </div>
  );
}
