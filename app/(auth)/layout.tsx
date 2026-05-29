import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/ds/patterns";

// Layout dédié aux écrans d'auth (login, mot de passe oublié, inscription).
// Pas de TopNav marketplace ni de SiteFooter complet — on garde une coquille
// sobre, signée "espace gérant".
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="sy-auth">
      <header className="sy-auth__nav">
        <Link href="/" aria-label="Accueil Sociuly" style={{ textDecoration: "none", color: "inherit" }}>
          <Logo />
        </Link>
        <Link href="/prestations" className="sy-small sy-link" style={{ color: "var(--ink-2)" }}>
          ← Retour au site public
        </Link>
      </header>

      <div className="sy-auth__body">{children}</div>

      <footer className="sy-auth__footer">
        <span className="sy-mono">© Sociuly · Espace gérant</span>
        <span className="sy-mono" style={{ display: "inline-flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="sy-link" href="/mentions-legales">Mentions légales</Link>
          <Link className="sy-link" href="/confidentialite">Confidentialité</Link>
          <Link className="sy-link" href="/cgu">CGU</Link>
        </span>
      </footer>

      <style>{`
        .sy-auth {
          min-height: 100vh;
          background: var(--bg);
          display: grid;
          grid-template-rows: auto 1fr auto;
        }
        .sy-auth__nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 32px;
        }
        .sy-auth__body {
          display: flex; align-items: stretch; justify-content: center;
          padding: 24px 32px 48px;
        }
        .sy-auth__footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 32px; gap: 12px; flex-wrap: wrap;
          border-top: 1px solid var(--line);
          background: var(--surface);
        }
        @media (max-width: 768px) {
          .sy-auth__nav,
          .sy-auth__body,
          .sy-auth__footer { padding-left: 20px; padding-right: 20px; }
          .sy-auth__body { padding-top: 16px; padding-bottom: 32px; }
        }
      `}</style>
    </main>
  );
}
