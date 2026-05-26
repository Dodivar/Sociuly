import Link from "next/link";
import { Btn, Card, Chip, Avatar, SearchBar } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { Logo, PrestationCard, SectionHeader, SiteFooter, TopNav } from "@/components/ds/patterns";
import { ImpactMap } from "@/components/ds/impact";

const CATEGORIES = [
  { id: "bbq",     label: "BBQ & buvettes",        count: 84,  hue: "orange" },
  { id: "anim",    label: "Animation enfants",     count: 121, hue: "yellow" },
  { id: "olym",    label: "Olympiades entreprise", count: 47,  hue: "green" },
  { id: "event",   label: "Événements & soirées",  count: 62,  hue: "teal" },
  { id: "coach",   label: "Coaching sportif",      count: 38,  hue: "green" },
  { id: "tournoi", label: "Tournois & cup",        count: 19,  hue: "orange" },
] as const;

const HUE_BG: Record<string, string> = {
  orange: "linear-gradient(160deg, #e8623d 0%, #c0451f 100%)",
  yellow: "linear-gradient(160deg, #f1c14a 0%, #b8861a 100%)",
  green:  "linear-gradient(160deg, #1f4b3f 0%, #14332b 100%)",
  teal:   "linear-gradient(160deg, #2a6f5c 0%, #14332b 100%)",
};

const REVIEWS = [
  {
    who: "Camille R.",
    role: "Présidente · US Cesson Handball",
    quote:
      "En six mois on a financé les maillots U13 + un tournoi régional. Le tunnel de réservation est tellement clair que mes bénévoles n'ont rien à gérer.",
  },
  {
    who: "Thomas M.",
    role: "Office Manager · Klaxoon",
    quote:
      "On a remplacé notre traiteur séminaire par un BBQ d'un club du quartier. Coût identique, impact local visible, équipe ravie.",
  },
  {
    who: "Sophie L.",
    role: "Trésorière · RC Strasbourg XV",
    quote:
      "Le suivi des projets par prestation change tout : on voit exactement combien il reste à financer pour le mini-bus.",
  },
];

const FAQ = [
  {
    q: "Comment Sociuly se rémunère ?",
    a: "Une commission de 6% sur chaque réservation, prélevée sur les frais Stripe. Le club reçoit 94% du montant. Aucun coût d'inscription.",
  },
  {
    q: "Qui propose les prestations ?",
    a: "Uniquement des associations sportives loi 1901 vérifiées. Nous validons leur SIRET, leur affiliation fédérale et leur identité bancaire avant publication.",
  },
  {
    q: "Et si la prestation est annulée ?",
    a: "Annulation gratuite jusqu'à 7 jours avant. Au-delà, le montant reste acquis au club pour le projet financé. Vous recevez un avoir d'un an.",
  },
  {
    q: "Comment le club lie une prestation à un projet ?",
    a: "Depuis la console club, chaque prestation est rattachée à un projet de saison (équipement, déplacement, formation). Le compteur se met à jour à chaque réservation encaissée.",
  },
  {
    q: "Couvrez-vous toute la France ?",
    a: "Aujourd'hui Strasbourg, Nancy, Metz. Déploiement national prévu printemps 2027.",
  },
];

export default function LandingPage() {
  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav active="prestations" />

      {/* HERO */}
      <section style={{ padding: "36px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <div className="hero-grid">
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
              <Chip variant="primary" leadingDot>en direct</Chip>
              <span className="sy-mono sy-num">€184 230 reversés · 238 clubs · 1 612 projets</span>
            </div>
            <h1 className="sy-display" style={{ fontSize: 84, letterSpacing: "-0.038em", lineHeight: 0.93 }}>
              Réservez<br />près de chez vous.<br />
              <span style={{ color: "var(--accent)" }}>Financez le club d&apos;à côté.</span>
            </h1>
            <p className="sy-body-l" style={{ maxWidth: 480, marginTop: 18 }}>
              Barbecues, animations, événements proposés par les associations sportives locales.
              Chaque réservation finance un projet réel d&apos;un club près de chez vous.
            </p>
            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/prestations" style={{ textDecoration: "none" }}>
                <Btn variant="primary" size="lg" iconRight={<Icon name="arrow" size={16} color="#fff" />}>
                  Découvrir les prestations
                </Btn>
              </Link>
              <Link href="/inscription-club" style={{ textDecoration: "none" }}>
                <Btn variant="outline" size="lg">Inscrire mon association</Btn>
              </Link>
            </div>
          </div>

          {/* hero collage */}
          <div className="hero-collage">
            <div
              className="sy-img collage-tall"
              style={{
                borderRadius: "var(--radius-xl)",
                background: "linear-gradient(165deg, #1f4b3f 0%, #14332b 100%)",
                position: "relative", overflow: "hidden",
              }}
            >
              <svg viewBox="0 0 220 320" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }}>
                <circle cx="160" cy="80" r="50" fill="#f1c14a" opacity="0.7" />
                <path d="M0 240 Q 60 200 110 220 T 220 200 L 220 320 L 0 320 Z" fill="#e8623d" opacity="0.55" />
                <path d="M0 280 Q 80 250 130 270 T 220 260 L 220 320 L 0 320 Z" fill="#14332b" />
              </svg>
              <span
                className="sy-img-label"
                style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(252,249,241,.95)" }}
              >
                Scène lifestyle · BBQ équipe sportive
              </span>
            </div>
            <div
              className="sy-img"
              style={{
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(165deg, #e8623d 0%, #c0451f 100%)",
                position: "relative", overflow: "hidden",
              }}
            >
              <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
                <circle cx="50" cy="50" r="22" fill="#fff" />
                <path d="M30 80 L 70 80 M40 60 L 60 60" stroke="#fff" strokeWidth="3" />
              </svg>
              <span
                className="sy-img-label"
                style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(252,249,241,.95)" }}
              >
                Animation sportive
              </span>
            </div>
            <div
              className="sy-img"
              style={{
                borderRadius: "var(--radius-lg)",
                background: "linear-gradient(165deg, #b8861a 0%, #8a6b3e 100%)",
                position: "relative", overflow: "hidden",
              }}
            >
              <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
                <path d="M0 70 L 30 50 L 60 65 L 100 40 L 100 100 L 0 100 Z" fill="#fff" />
              </svg>
              <span
                className="sy-img-label"
                style={{ position: "absolute", bottom: 12, left: 12, background: "rgba(252,249,241,.95)" }}
              >
                Événement
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <SearchBar />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "40px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <div
          className="sy-card howitworks-grid"
          style={{
            background: "var(--ink)", border: "none",
            borderRadius: "var(--radius-xl)", padding: "28px 32px", gap: 32, alignItems: "center",
          }}
        >
          <div>
            <div className="sy-mono" style={{ color: "var(--highlight)" }}>Comment ça marche</div>
            <h2 className="sy-h1" style={{ color: "var(--surface)", marginTop: 6, fontSize: 32 }}>
              Réserver, c&apos;est<br />financer un projet local.
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, alignItems: "flex-start" }}>
            {[
              ["01", "Choisissez une prestation", "BBQ, animation, événement — proposés par les clubs proches."],
              ["02", "Réservez en ligne", "Paiement sécurisé Stripe. Annulation J-7 gratuite."],
              ["03", "Le club encaisse", "Un projet réel avance — vous voyez l'impact concret."],
            ].map(([n, t, d]) => (
              <div key={n}>
                <div
                  style={{
                    fontFamily: "var(--display)", fontWeight: 700, fontSize: 32, lineHeight: 1,
                    color: "var(--accent)", fontVariationSettings: "var(--display-var)",
                  }}
                >
                  {n}
                </div>
                <div className="sy-h3" style={{ color: "var(--surface)", marginTop: 6 }}>{t}</div>
                <div className="sy-small" style={{ color: "var(--ink-3)", marginTop: 4 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRESTATIONS */}
      <section style={{ padding: "56px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="sy-mono">Prestations populaires · Strasbourg</div>
            <h2 className="sy-h1" style={{ marginTop: 6 }}>Près de chez vous, cette semaine.</h2>
          </div>
          <Link href="/prestations" style={{ textDecoration: "none" }}>
            <Btn variant="ghost" iconRight={<Icon name="arrow" size={14} />}>Voir tout</Btn>
          </Link>
        </div>
        <div className="sy-grid-4">
          <PrestationCard hue="green" />
          <PrestationCard title="Olympiades en entreprise" price={720} hue="orange" goal={0.78} funds="Mini-bus du club" />
          <PrestationCard title="Anniversaire sportif" price={180} hue="yellow" goal={0.25} funds="Maillots saison" rating={4.6} />
          <PrestationCard title="Buvette événement" price={350} hue="teal" goal={0.55} funds="Vestiaires neufs" />
        </div>
      </section>

      {/* IMPACT */}
      <section style={{ padding: "56px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <div className="impact-grid" style={{ gap: 36, alignItems: "center" }}>
          <div>
            <div className="sy-mono">Notre impact</div>
            <h2 className="sy-display-sm" style={{ marginTop: 8, fontSize: 56, lineHeight: 1 }}>
              €184k<br />pour <span style={{ color: "var(--accent)" }}>238 clubs</span> en 12 mois.
            </h2>
            <p className="sy-body-l" style={{ marginTop: 14, maxWidth: 400 }}>
              Sociuly relie particuliers et entreprises aux associations sportives qui proposent des services
              locaux. Chaque euro reversé reste sur le territoire.
            </p>
            <div
              style={{
                marginTop: 24, paddingTop: 22, borderTop: "1px solid var(--line)",
                display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16,
              }}
            >
              <div>
                <div className="sy-display-sm sy-num" style={{ fontSize: 32 }}>238</div>
                <div className="sy-mono" style={{ marginTop: 4 }}>clubs actifs</div>
              </div>
              <div>
                <div className="sy-display-sm sy-num" style={{ fontSize: 32 }}>1 612</div>
                <div className="sy-mono" style={{ marginTop: 4 }}>projets financés</div>
              </div>
              <div>
                <div className="sy-display-sm sy-num" style={{ fontSize: 32, color: "var(--accent)" }}>92%</div>
                <div className="sy-mono" style={{ marginTop: 4 }}>reste local</div>
              </div>
            </div>
          </div>
          <ImpactMap style={{ aspectRatio: "4/3" }} />
        </div>
      </section>

      {/* CTA BLOCK */}
      <section style={{ padding: "56px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <Card
          variant="accent"
          style={{
            padding: 36, borderRadius: "var(--radius-xl)",
            display: "flex", alignItems: "center", gap: 36, justifyContent: "space-between", flexWrap: "wrap",
          }}
        >
          <div>
            <h2 className="sy-h1" style={{ fontSize: 40, lineHeight: 1.05 }}>
              Vous êtes un club ?<br />
              <span style={{ color: "var(--accent-deep)" }}>Inscrivez-le en 5 minutes.</span>
            </h2>
            <p className="sy-body-l" style={{ marginTop: 10, maxWidth: 480 }}>
              Proposez vos prestations, liez-les à vos projets de saison. Sociuly s&apos;occupe de tout le reste.
            </p>
          </div>
          <Link href="/inscription-club" style={{ textDecoration: "none" }}>
            <Btn variant="primary" size="xl">Inscrire mon association →</Btn>
          </Link>
        </Card>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: "56px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <SectionHeader
          kicker="Par type d'expérience"
          title="Quel moment cherchez-vous ?"
          action={
            <Link href="/prestations" style={{ textDecoration: "none" }}>
              <Btn variant="ghost" iconRight={<Icon name="arrow" size={14} />}>Toutes les catégories</Btn>
            </Link>
          }
        />
        <div className="sy-grid-3">
          {CATEGORIES.map((c) => (
            <Link key={c.id} href="/prestations" style={{ textDecoration: "none" }}>
              <div
                className="sy-card category-tile"
                style={{
                  background: "var(--surface)", borderRadius: "var(--radius-xl)",
                  padding: 18, display: "flex", gap: 18, alignItems: "stretch", cursor: "pointer",
                }}
              >
                <div
                  className="sy-img"
                  style={{
                    width: 96, height: 96, borderRadius: "var(--radius-lg)",
                    background: HUE_BG[c.hue], flexShrink: 0, position: "relative", overflow: "hidden",
                  }}
                >
                  <svg viewBox="0 0 96 96" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.45 }}>
                    <circle cx="68" cy="32" r="18" fill="#fff" opacity="0.55" />
                    <path d="M0 70 Q 30 55 50 65 T 96 60 L 96 96 L 0 96 Z" fill="#fff" opacity="0.2" />
                  </svg>
                </div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, minWidth: 0 }}>
                  <div>
                    <div className="sy-h3" style={{ color: "var(--ink)" }}>{c.label}</div>
                    <div className="sy-mono" style={{ marginTop: 4 }}>
                      <span className="sy-num">{c.count}</span> prestations
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="sy-small" style={{ color: "var(--ink-3)" }}>Toute l&apos;année</span>
                    <Icon name="arrow" size={16} color="var(--ink)" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "64px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <SectionHeader
          kicker="Témoignages"
          title="Clubs et entreprises en parlent."
          action={<span className="sy-mono">+ 2 100 avis · 4,8 ★</span>}
        />
        <div className="sy-grid-3">
          {REVIEWS.map((r, i) => (
            <Card
              key={i}
              variant="flat"
              style={{
                padding: 24, borderRadius: "var(--radius-xl)",
                display: "flex", flexDirection: "column", gap: 18,
                background: i === 1 ? "var(--ink)" : "var(--surface)",
                color: i === 1 ? "var(--surface)" : "var(--ink)",
                border: i === 1 ? "none" : "1px solid var(--line)",
              }}
            >
              <svg width="28" height="22" viewBox="0 0 28 22" style={{ flexShrink: 0 }}>
                <path
                  d="M0 22 L 0 12 Q 0 0 12 0 L 12 6 Q 6 6 6 12 L 12 12 L 12 22 Z M 16 22 L 16 12 Q 16 0 28 0 L 28 6 Q 22 6 22 12 L 28 12 L 28 22 Z"
                  fill={i === 1 ? "var(--highlight)" : "var(--accent)"}
                />
              </svg>
              <p
                className="sy-body-l"
                style={{ color: i === 1 ? "var(--surface)" : "var(--ink)", flex: 1 }}
              >
                &ldquo;{r.quote}&rdquo;
              </p>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 12, paddingTop: 14,
                  borderTop: `1px solid ${i === 1 ? "rgba(252,249,241,.14)" : "var(--line)"}`,
                }}
              >
                <Avatar
                  initials={r.who.split(" ").map((w) => w[0]).join("")}
                  size="md"
                  tone={i === 1 ? "yellow" : "green"}
                />
                <div style={{ minWidth: 0 }}>
                  <div className="sy-h4" style={{ color: i === 1 ? "var(--surface)" : "var(--ink)" }}>{r.who}</div>
                  <div className="sy-mono" style={{ marginTop: 2, color: "var(--ink-3)" }}>{r.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "64px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <div className="faq-grid" style={{ gap: 48, alignItems: "flex-start" }}>
          <div style={{ position: "sticky", top: 24 }}>
            <div className="sy-mono">Questions fréquentes</div>
            <h2 className="sy-h1" style={{ marginTop: 6 }}>
              Tout ce qu&apos;il faut<br />savoir avant de réserver.
            </h2>
            <p className="sy-body" style={{ marginTop: 14, maxWidth: 320 }}>
              Vous ne trouvez pas votre réponse ?
            </p>
            <div style={{ marginTop: 14 }}>
              <Btn variant="outline" iconRight={<Icon name="arrow" size={14} />}>Contacter l&apos;équipe</Btn>
            </div>
          </div>
          <div>
            {FAQ.map((it, i) => (
              <details
                key={i}
                style={{
                  borderTop: i === 0 ? "1px solid var(--line)" : "none",
                  borderBottom: "1px solid var(--line)",
                  padding: "20px 0",
                }}
              >
                <summary
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    listStyle: "none", cursor: "pointer",
                    fontFamily: "var(--display)", fontWeight: 600, fontSize: 22,
                    letterSpacing: "-0.015em", color: "var(--ink)",
                    fontVariationSettings: "var(--display-var)",
                  }}
                >
                  <span style={{ paddingRight: 20 }}>{it.q}</span>
                  <span
                    style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "var(--surface)", border: "1px solid var(--line)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--mono)", fontWeight: 600, fontSize: 18, lineHeight: 1,
                      color: "var(--ink)", flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </summary>
                <p className="sy-body-l" style={{ marginTop: 14, maxWidth: 640 }}>{it.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNERS / TRUST */}
      <section style={{ padding: "64px 48px 0", maxWidth: 1440, margin: "0 auto" }}>
        <div
          className="sy-card partners-grid"
          style={{
            background: "var(--surface)", border: "1px solid var(--line)",
            borderRadius: "var(--radius-xl)", padding: "32px 36px", gap: 32, alignItems: "center",
          }}
        >
          <div>
            <div className="sy-mono">Ils nous soutiennent</div>
            <div className="sy-h3" style={{ marginTop: 4 }}>
              Fédérations, collectivités, partenaires institutionnels.
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, alignItems: "center" }}>
            {["FFF", "FFR", "FFHB", "Strasbourg Eurométropole", "CROS Grand Est"].map((p) => (
              <div
                key={p}
                style={{
                  fontFamily: "var(--display)", fontWeight: 700, fontSize: 18,
                  letterSpacing: "-0.01em", color: "var(--ink-3)",
                  textAlign: "center", padding: "14px 8px",
                  border: "1px dashed var(--line-2)", borderRadius: "var(--radius-md)",
                  fontVariationSettings: "var(--display-var)",
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Page-local responsive tweaks. The component CSS in globals.css handles the rest. */}
      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 36px;
          align-items: center;
        }
        .hero-collage {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 12px;
          height: 480px;
        }
        .hero-collage > .collage-tall { grid-row: 1 / 3; }
        .howitworks-grid { display: grid; grid-template-columns: 1fr 2fr; }
        .impact-grid { display: grid; grid-template-columns: 1fr 1.2fr; }
        .faq-grid { display: grid; grid-template-columns: 1fr 1.6fr; }
        .partners-grid { display: grid; grid-template-columns: 1fr 2.2fr; }
        .category-tile { transition: transform .16s ease, box-shadow .16s ease; }
        .category-tile:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

        @media (max-width: 1024px) {
          .hero-grid, .impact-grid, .faq-grid, .partners-grid, .howitworks-grid {
            grid-template-columns: 1fr;
          }
          .hero-collage { height: 360px; }
        }
        @media (max-width: 768px) {
          .hero-collage {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 200px 120px;
            height: auto;
          }
          .hero-collage > .collage-tall { grid-row: 1 / 2; grid-column: 1 / 3; }
        }
      `}</style>
    </main>
  );
}
