import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion · Sociuly",
  description:
    "Connectez-vous à Sociuly avec un lien magique reçu par e-mail. Espaces dédiés aux entreprises clientes et aux clubs partenaires.",
};

// Next 15 : searchParams est un Promise dans les Server Components.
type SearchParams = { redirect?: string; error?: string };

const ERROR_MESSAGES: Record<string, string> = {
  expired: "Ce lien magique a expiré ou a déjà été utilisé. Demandez-en un nouveau ci-dessous.",
  missing_code: "Lien invalide. Demandez un nouveau lien ci-dessous.",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { redirect, error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="sy-auth-grid">
      {/* ─── Colonne gauche : promesse B2B + stats plateforme ──────────── */}
      <aside className="sy-auth-pitch" aria-hidden="true">
        <div
          className="sy-mono"
          style={{ color: "var(--highlight)", letterSpacing: "0.12em" }}
        >
          Expériences sportives sur-mesure · pour les entreprises
        </div>

        <h1
          className="sy-display-sm"
          style={{
            color: "var(--surface)",
            marginTop: 14,
            fontSize: 44,
            lineHeight: 1.04,
          }}
        >
          Connectez-vous.<br />
          <span style={{ color: "var(--highlight)" }}>
            Reprenez vos devis et vos événements.
          </span>
        </h1>

        <p
          className="sy-body-l"
          style={{
            color: "rgba(255,255,255,0.78)",
            marginTop: 18,
            maxWidth: 420,
          }}
        >
          Demandez un devis à un club partenaire, suivez vos réservations,
          téléchargez vos factures — ou gérez votre console club si vous
          accueillez nos entreprises clientes.
        </p>

        <div className="sy-auth-pitch__stats">
          {[
            ["238", "clubs partenaires"],
            ["3", "villes pilotes"],
            ["100%", "facturation TVA conforme"],
          ].map(([n, label], i) => (
            <div key={label}>
              <div
                className="sy-num"
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 700,
                  fontSize: 26,
                  color: i === 2 ? "var(--highlight)" : "var(--surface)",
                  lineHeight: 1,
                }}
              >
                {n}
              </div>
              <div className="sy-mono" style={{ marginTop: 6, color: "rgba(255,255,255,0.6)" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Forme déco — cohérent avec les collages du hero landing */}
        <svg
          className="sy-auth-pitch__deco"
          viewBox="0 0 320 200"
          aria-hidden="true"
        >
          <circle cx="260" cy="40" r="38" fill="var(--highlight)" opacity="0.7" />
          <path
            d="M0 170 Q 80 130 140 150 T 320 130 L 320 200 L 0 200 Z"
            fill="var(--primary)"
            opacity="0.45"
          />
        </svg>
      </aside>

      {/* ─── Colonne droite : formulaire magic link ─────────────────── */}
      <section className="sy-auth-card" aria-labelledby="auth-title">
        <header style={{ marginBottom: 22 }}>
          <h2 id="auth-title" className="sy-h1" style={{ fontSize: 28 }}>
            Bon retour.
          </h2>
          <p className="sy-body" style={{ marginTop: 6 }}>
            Recevez un lien magique par e-mail. Pas de mot de passe, jamais.
          </p>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="sy-small"
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              background: "rgba(211, 58, 31, 0.08)",
              border: "1px solid rgba(211, 58, 31, 0.25)",
              color: "var(--danger)",
            }}
          >
            {errorMessage}
          </div>
        )}

        <LoginForm defaultRedirect={redirect} />

        {/* Séparateur + double CTA d'inscription ─────────────────────── */}
        <div
          aria-hidden="true"
          style={{
            margin: "28px 0 18px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "var(--ink-3)",
          }}
        >
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span className="sy-mono" style={{ fontSize: 11, letterSpacing: "0.12em" }}>
            Pas encore de compte ?
          </span>
          <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        <div className="sy-auth-signup">
          <Link
            href="/inscription-entreprise"
            className="sy-auth-signup__card"
          >
            <div className="sy-auth-signup__title">Inscrire mon entreprise</div>
            <div className="sy-auth-signup__sub">
              Demander des devis, organiser un événement
            </div>
          </Link>
          <Link
            href="/inscription-club"
            className="sy-auth-signup__card"
          >
            <div className="sy-auth-signup__title">Inscrire mon club</div>
            <div className="sy-auth-signup__sub">
              Vendre vos expériences aux entreprises
            </div>
          </Link>
        </div>
      </section>

      <style>{`
        .sy-auth-grid {
          width: 100%;
          max-width: 1080px;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 28px;
          align-items: stretch;
        }
        .sy-auth-pitch {
          position: relative;
          overflow: hidden;
          border-radius: var(--radius-xl);
          padding: 36px 36px 0;
          background: linear-gradient(160deg, var(--accent) 0%, var(--accent-deep) 100%);
          color: var(--surface);
          min-height: 560px;
          display: flex;
          flex-direction: column;
        }
        .sy-auth-pitch__stats {
          margin-top: auto;
          padding: 24px 0 28px;
          border-top: 1px solid rgba(255,255,255,0.14);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          position: relative;
          z-index: 1;
        }
        .sy-auth-pitch__deco {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          width: 100%; height: 200px;
          pointer-events: none;
        }
        .sy-auth-card {
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-xl);
          padding: 36px;
          box-shadow: var(--shadow-md);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .sy-auth-signup {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .sy-auth-signup__card {
          display: block;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          border: 1px solid var(--line);
          background: var(--surface);
          text-decoration: none;
          color: var(--ink);
          transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
        }
        .sy-auth-signup__card:hover,
        .sy-auth-signup__card:focus-visible {
          border-color: var(--ink);
          background: var(--surface-2);
        }
        .sy-auth-signup__title {
          font-family: var(--display);
          font-weight: 700;
          font-size: 14.5px;
          margin-bottom: 4px;
        }
        .sy-auth-signup__sub {
          font-size: 12.5px;
          color: var(--ink-2);
          line-height: 1.4;
        }
        @media (max-width: 900px) {
          .sy-auth-grid { grid-template-columns: 1fr; max-width: 460px; }
          .sy-auth-pitch { min-height: 240px; padding: 28px 28px 0; }
          .sy-auth-pitch h1 { font-size: 32px; }
          .sy-auth-pitch__deco { height: 120px; }
          .sy-auth-pitch__stats { padding: 18px 0 24px; gap: 12px; }
          .sy-auth-card { padding: 28px; }
          .sy-auth-signup { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
