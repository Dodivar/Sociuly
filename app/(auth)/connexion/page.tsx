import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Connexion gérant · Sociuly",
  description:
    "Connectez-vous à votre console Sociuly pour gérer les expériences, devis, projets et réservations de votre club.",
};

// Next.js 15 : searchParams est un Promise dans les Server Components.
type SearchParams = { redirect?: string };

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="sy-auth-grid">
      {/* ─── Colonne gauche : promesse + signature visuelle ──────────── */}
      <aside className="sy-auth-pitch" aria-hidden="true">
        <div className="sy-mono" style={{ color: "var(--highlight)" }}>
          Console club · accès gérant
        </div>
        <h1
          className="sy-display-sm"
          style={{ color: "var(--surface)", marginTop: 10, fontSize: 44, lineHeight: 1.02 }}
        >
          Gérez votre club.<br />
          <span style={{ color: "var(--highlight)" }}>Financez vos projets.</span>
        </h1>
        <p
          className="sy-body-l"
          style={{ color: "rgba(255,255,255,0.78)", marginTop: 16, maxWidth: 380 }}
        >
          Publication des expériences, devis aux entreprises, suivi des réservations, projets de
          saison, encaissements Stripe — tout au même endroit.
        </p>

        <div
          style={{
            marginTop: 32,
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.14)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {[
            ["238", "clubs actifs"],
            ["1 612", "projets financés"],
            ["92%", "reste local"],
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

      {/* ─── Colonne droite : formulaire de connexion ───────────────── */}
      <section className="sy-auth-card" aria-labelledby="auth-title">
        <header style={{ marginBottom: 24 }}>
          <h2 id="auth-title" className="sy-h1" style={{ fontSize: 28 }}>
            Bon retour
          </h2>
          <p className="sy-body" style={{ marginTop: 6 }}>
            Connectez-vous pour accéder à la console de votre association.
          </p>
        </header>

        <LoginForm defaultRedirect={redirect} />
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
          min-height: 520px;
          display: flex;
          flex-direction: column;
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
        @media (max-width: 900px) {
          .sy-auth-grid { grid-template-columns: 1fr; max-width: 460px; }
          .sy-auth-pitch { min-height: 220px; padding: 28px 28px 0; }
          .sy-auth-pitch h1 { font-size: 32px; }
          .sy-auth-pitch__deco { height: 120px; }
          .sy-auth-card { padding: 28px; }
        }
      `}</style>
    </div>
  );
}
