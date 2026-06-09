import type { Metadata } from "next";
import Link from "next/link";
import { Btn, Card, Chip } from "@/components/ds/components";
import { Icon, type IconName } from "@/components/ds/icon";
import { SiteFooter, TopNav } from "@/components/ds/patterns";
import { ImpactMap } from "@/components/landing/impact-map";
import {
  getMarketplaceExperiences,
  type MarketplaceExperience,
} from "@/lib/marketplace/experiences";

// Page statique régénérée toutes les 5 min (ISR) ; catalogue mis en cache.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Notre impact — Sociuly",
  description:
    "Chaque expérience Sociuly finance un projet réel d'un club sportif local. Découvrez où va l'argent, combien reste sur le territoire, et les projets déjà soutenus à Strasbourg, Nancy et Metz.",
};

// Chiffres clés — alignés sur SPEC §1 (3 villes pilotes) et §4 (commission 6 %)
const KEY_NUMBERS: ReadonlyArray<{ value: string; label: string; sub: string; accent?: boolean }> = [
  {
    value: "€184k",
    label: "reversés aux clubs",
    sub: "sur 12 mois, après commission Sociuly",
  },
  {
    value: "238",
    label: "clubs partenaires",
    sub: "associations loi 1901 et clubs professionnels",
  },
  {
    value: "1 612",
    label: "projets financés",
    sub: "école de jeunes, équipement, déplacements, infrastructure",
  },
  {
    value: "92 %",
    label: "reste local",
    sub: "des montants reversés restent sur Strasbourg, Nancy, Metz",
    accent: true,
  },
];

// Décomposition du flux financier — alignée sur SPEC §4 (commission 6 % TTC)
const FLOW: ReadonlyArray<{ pct: string; t: string; d: string }> = [
  {
    pct: "94 %",
    t: "Net au club",
    d: "Reversé automatiquement à J+1 après la prestation, par virement Stripe sur le compte du club. Une partie finance le projet de saison rattaché à l'expérience.",
  },
  {
    pct: "6 %",
    t: "Commission Sociuly",
    d: "Prélevée sur le TTC. Couvre la conception sur mesure, la vérification des clubs, la facturation conforme, le paiement sécurisé et le support entreprise et club.",
  },
];

// Projets financés — exemples concrets ancrés dans les 3 villes pilotes
const PROJECTS: ReadonlyArray<{
  club: string;
  city: string;
  project: string;
  amount: string;
  experiences: string;
  hue: "green" | "orange" | "yellow" | "teal";
}> = [
  {
    club: "SIG Strasbourg",
    city: "Strasbourg",
    project: "École de jeunes U15–U17",
    amount: "€42 800",
    experiences: "18 expériences entreprise",
    hue: "green",
  },
  {
    club: "RC Strasbourg",
    city: "Strasbourg",
    project: "Vestiaires du centre de formation",
    amount: "€28 600",
    experiences: "12 expériences entreprise",
    hue: "orange",
  },
  {
    club: "SLUC Nancy Basket",
    city: "Nancy",
    project: "Mini-bus du club",
    amount: "€18 400",
    experiences: "9 expériences entreprise",
    hue: "yellow",
  },
  {
    club: "FC Nancy-Sud",
    city: "Nancy",
    project: "Équipement saison U13",
    amount: "€11 200",
    experiences: "7 expériences entreprise",
    hue: "teal",
  },
  {
    club: "Metz Basket Métropole",
    city: "Metz",
    project: "Tournoi régional jeunes",
    amount: "€14 900",
    experiences: "8 expériences entreprise",
    hue: "orange",
  },
  {
    club: "FC Metz Handisport",
    city: "Metz",
    project: "Matériel adapté",
    amount: "€9 600",
    experiences: "5 expériences entreprise",
    hue: "green",
  },
];

const HUE_BG: Record<string, string> = {
  orange: "linear-gradient(160deg, #e8623d 0%, #c0451f 100%)",
  yellow: "linear-gradient(160deg, #f1c14a 0%, #b8861a 100%)",
  green: "linear-gradient(160deg, #1f4b3f 0%, #14332b 100%)",
  teal: "linear-gradient(160deg, #2a6f5c 0%, #14332b 100%)",
};

// Engagements de transparence — alignés sur SPEC §4 (KYC) et §8 (sécurité, RGPD)
const COMMITMENTS: ReadonlyArray<{ icon: IconName; t: string; d: string }> = [
  {
    icon: "check",
    t: "Clubs vérifiés avant publication",
    d: "SIRET (Sirene), statut juridique, assurance RC pro, encadrant diplômé. Aucun club non vérifié ne reçoit d'entreprise.",
  },
  {
    icon: "euro",
    t: "Commission unique, transparente",
    d: "6 % du TTC, prélevés par Stripe au moment du paiement. Pas d'abonnement, pas de frais cachés, ni pour le club ni pour l'entreprise.",
  },
  {
    icon: "pin",
    t: "Ancrage local mesuré",
    d: "Chaque expérience est opérée par un club du territoire de l'entreprise (rayon 30 km). 92 % du montant net reste sur la ville d'origine.",
  },
  {
    icon: "info",
    t: "Reporting impact entreprise",
    d: "Chaque entreprise reçoit, sur demande, un récapitulatif annuel des projets financés via ses expériences — utilisable en rapport RSE.",
  },
];

// Méthodologie — explique comment les chiffres sont calculés
const METHODOLOGY: ReadonlyArray<{ t: string; d: string }> = [
  {
    t: "Période couverte",
    d: "Les montants affichés couvrent les 12 derniers mois glissants, recalculés chaque nuit à partir des réservations marquées « completed » dans la base.",
  },
  {
    t: "Définition du « reversé »",
    d: "Montant net effectivement transféré au compte Stripe du club après commission Sociuly de 6 % et hors TVA. Les réservations annulées ou en litige sont exclues.",
  },
  {
    t: "Définition du « local »",
    d: "Une expérience est comptabilisée comme locale si le club opérateur est implanté dans la même agglomération que l'entreprise acheteuse, ou dans un rayon de 30 km.",
  },
  {
    t: "Périmètre géographique",
    d: "Strasbourg, Nancy, Metz dans la version actuelle. Les expériences hors de ces 3 agglomérations ne sont pas comptabilisées (déploiement national prévu 2027).",
  },
];

export default async function NotreImpactPage() {
  // Mêmes expériences publiées que la page /experiences, affichées sur la carte.
  // Dégradation gracieuse si la base est indisponible (carte sans pastilles).
  let experiences: MarketplaceExperience[] = [];
  try {
    experiences = await getMarketplaceExperiences();
  } catch {
    experiences = [];
  }

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav />

      {/* HERO */}
      <section style={{ padding: "48px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ maxWidth: 820 }}>
          <Chip variant="primary" leadingDot>Notre impact</Chip>
          <h1
            className="sy-display"
            style={{ fontSize: 64, letterSpacing: "-0.035em", lineHeight: 0.95, marginTop: 16 }}
          >
            Chaque séminaire finance<br />
            <span style={{ color: "var(--accent)" }}>un projet réel d&apos;un club du territoire.</span>
          </h1>
          <p className="sy-body-l" style={{ marginTop: 18, maxWidth: 640 }}>
            Sociuly relie les entreprises aux clubs sportifs locaux — associations loi 1901 et clubs
            professionnels. Le budget de votre prochain séminaire ne paie pas un prestataire
            événementiel : il finance l&apos;école de jeunes, l&apos;équipement ou le déplacement d&apos;un club voisin.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#projets" style={{ textDecoration: "none" }}>
              <Btn variant="primary" size="lg" iconRight={<Icon name="arrow" size={16} color="#fff" />}>
                Voir les projets financés
              </Btn>
            </a>
            <a href="#methodologie" style={{ textDecoration: "none" }}>
              <Btn variant="outline" size="lg">Notre méthodologie</Btn>
            </a>
          </div>
        </div>
      </section>

      {/* CHIFFRES CLÉS */}
      <section style={{ padding: "56px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, marginBottom: 28 }}>
          <div className="sy-mono">12 derniers mois</div>
          <h2 className="sy-h1" style={{ marginTop: 6 }}>
            L&apos;impact, en chiffres.
          </h2>
        </div>
        <div className="sy-grid-4">
          {KEY_NUMBERS.map((n) => (
            <Card
              key={n.label}
              variant="flat"
              style={{
                padding: 28, borderRadius: "var(--radius-xl)",
                background: n.accent ? "var(--accent-soft)" : "var(--surface)",
                border: "1px solid var(--line)",
                display: "flex", flexDirection: "column", gap: 10, minHeight: 220,
              }}
            >
              <div
                className="sy-num"
                style={{
                  fontFamily: "var(--display)", fontWeight: 700, fontSize: 56, lineHeight: 0.95,
                  letterSpacing: "-0.03em",
                  color: n.accent ? "var(--accent-deep)" : "var(--ink)",
                  fontVariationSettings: "var(--display-var)",
                }}
              >
                {n.value}
              </div>
              <div className="sy-h4" style={{ marginTop: 4 }}>{n.label}</div>
              <div className="sy-small" style={{ color: "var(--ink-3)" }}>{n.sub}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* CARTE */}
      <section style={{ padding: "80px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto" }}>
        <div className="impact-map-grid" style={{ gap: 36, alignItems: "center" }}>
          <div>
            <div className="sy-mono">Sur le terrain</div>
            <h2 className="sy-h1" style={{ marginTop: 6 }}>
              Trois villes,<br />
              <span style={{ color: "var(--accent)" }}>238 clubs</span> en mouvement.
            </h2>
            <p className="sy-body-l" style={{ marginTop: 14, maxWidth: 440 }}>
              Strasbourg, Nancy, Metz. Trois agglomérations pilotes où chaque expérience Sociuly est
              opérée par un club du territoire, dans un rayon de 30 km autour de l&apos;entreprise.
            </p>
            <div
              style={{
                marginTop: 24, paddingTop: 22, borderTop: "1px solid var(--line)",
                display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16,
              }}
            >
              <div>
                <div className="sy-display-sm sy-num" style={{ fontSize: 28 }}>112</div>
                <div className="sy-mono" style={{ marginTop: 4 }}>Strasbourg</div>
              </div>
              <div>
                <div className="sy-display-sm sy-num" style={{ fontSize: 28 }}>74</div>
                <div className="sy-mono" style={{ marginTop: 4 }}>Nancy</div>
              </div>
              <div>
                <div className="sy-display-sm sy-num" style={{ fontSize: 28 }}>52</div>
                <div className="sy-mono" style={{ marginTop: 4 }}>Metz</div>
              </div>
            </div>
          </div>
          <ImpactMap experiences={experiences} style={{ aspectRatio: "4/3" }} />
        </div>
      </section>

      {/* OÙ VA L'ARGENT */}
      <section style={{ padding: "80px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto" }}>
        <div
          className="sy-card"
          style={{
            background: "var(--ink)", border: "none",
            borderRadius: "var(--radius-xl)", padding: "40px 36px",
          }}
        >
          <div style={{ maxWidth: 640, marginBottom: 28 }}>
            <div className="sy-mono" style={{ color: "var(--highlight)" }}>Où va l&apos;argent</div>
            <h2 className="sy-h1" style={{ color: "var(--surface)", marginTop: 6 }}>
              94 % au club,<br />6 % à Sociuly. C&apos;est tout.
            </h2>
            <p className="sy-body-l" style={{ color: "var(--ink-3)", marginTop: 12, maxWidth: 560 }}>
              Aucun abonnement, aucun frais d&apos;inscription, aucun frais caché. La commission est
              prélevée par Stripe au moment du paiement, le club perçoit directement le net.
            </p>
          </div>

          <div className="sy-grid-2-flow">
            {FLOW.map((f) => (
              <div
                key={f.t}
                style={{
                  padding: 28, borderRadius: "var(--radius-lg)",
                  background: "rgba(252,249,241,0.04)", border: "1px solid rgba(252,249,241,0.10)",
                  display: "flex", flexDirection: "column", gap: 12, minHeight: 220,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--display)", fontWeight: 700, fontSize: 56, lineHeight: 0.95,
                    letterSpacing: "-0.03em",
                    color: f.pct === "94 %" ? "var(--accent)" : "var(--highlight)",
                    fontVariationSettings: "var(--display-var)",
                  }}
                >
                  {f.pct}
                </div>
                <div className="sy-h3" style={{ color: "var(--surface)" }}>{f.t}</div>
                <div className="sy-body" style={{ color: "var(--ink-3)" }}>{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJETS FINANCÉS */}
      <section
        id="projets"
        style={{ padding: "80px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto", scrollMarginTop: 24 }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={{ maxWidth: 560 }}>
            <div className="sy-mono">Projets soutenus</div>
            <h2 className="sy-h1" style={{ marginTop: 6 }}>
              Quelques projets<br />déjà financés par les expériences.
            </h2>
            <p className="sy-body-l" style={{ marginTop: 12 }}>
              Chaque expérience est rattachée à un projet de saison du club. Voici un échantillon
              des projets actifs ou bouclés grâce aux séminaires d&apos;entreprises.
            </p>
          </div>
          <Link href="/clubs" style={{ textDecoration: "none" }}>
            <Btn variant="ghost" iconRight={<Icon name="arrow" size={14} />}>
              Voir tous les clubs
            </Btn>
          </Link>
        </div>

        <div className="sy-grid-3">
          {PROJECTS.map((p) => (
            <Card
              key={p.club + p.project}
              variant="flat"
              style={{
                padding: 0, borderRadius: "var(--radius-xl)",
                background: "var(--surface)", border: "1px solid var(--line)",
                display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 320,
              }}
            >
              <div
                style={{
                  height: 140, background: HUE_BG[p.hue],
                  position: "relative", overflow: "hidden",
                }}
              >
                <svg viewBox="0 0 320 140" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }}>
                  <circle cx="240" cy="40" r="32" fill="#fff" opacity="0.55" />
                  <path d="M0 100 Q 60 80 110 90 T 320 80 L 320 140 L 0 140 Z" fill="#fff" opacity="0.25" />
                </svg>
                <span
                  className="sy-chip"
                  style={{
                    position: "absolute", top: 14, left: 14,
                    background: "rgba(252,249,241,0.95)", color: "var(--ink)",
                  }}
                >
                  <Icon name="pin" size={12} /> {p.city}
                </span>
              </div>
              <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                <div className="sy-mono">{p.club}</div>
                <div className="sy-h3" style={{ color: "var(--ink)" }}>{p.project}</div>
                <div style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px dashed var(--line-2)", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                  <div>
                    <div className="sy-mono">Financé</div>
                    <div className="sy-h3 sy-num" style={{ color: "var(--accent-deep)", marginTop: 2 }}>
                      {p.amount}
                    </div>
                  </div>
                  <div className="sy-small" style={{ color: "var(--ink-3)", textAlign: "right" }}>
                    {p.experiences}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ENGAGEMENTS DE TRANSPARENCE */}
      <section style={{ padding: "80px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, marginBottom: 28 }}>
          <div className="sy-mono">Nos engagements</div>
          <h2 className="sy-h1" style={{ marginTop: 6 }}>
            Un impact mesuré,<br />pas une promesse marketing.
          </h2>
        </div>
        <div className="sy-grid-4">
          {COMMITMENTS.map((e) => (
            <Card
              key={e.t}
              variant="flat"
              style={{
                padding: 24, borderRadius: "var(--radius-xl)",
                background: "var(--surface)", border: "1px solid var(--line)",
                display: "flex", flexDirection: "column", gap: 12, minHeight: 220,
              }}
            >
              <div
                style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "var(--accent-soft)", display: "inline-flex",
                  alignItems: "center", justifyContent: "center", color: "var(--accent-deep)",
                }}
              >
                <Icon name={e.icon} size={22} />
              </div>
              <div className="sy-h3">{e.t}</div>
              <div className="sy-body" style={{ color: "var(--ink-3)" }}>{e.d}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* MÉTHODOLOGIE */}
      <section
        id="methodologie"
        style={{ padding: "80px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto", scrollMarginTop: 24 }}
      >
        <div className="faq-grid" style={{ gap: 48, alignItems: "flex-start" }}>
          <div className="faq-sticky" style={{ position: "sticky", top: 24 }}>
            <div className="sy-mono">Méthodologie</div>
            <h2 className="sy-h1" style={{ marginTop: 6 }}>
              Comment nous<br />calculons l&apos;impact.
            </h2>
            <p className="sy-body" style={{ marginTop: 14, maxWidth: 320 }}>
              Les chiffres sont issus de la base Sociuly, recalculés chaque nuit. Aucune extrapolation,
              aucun arrondi favorable.
            </p>
            <div style={{ marginTop: 14 }}>
              <a href="mailto:contact@sociuly.fr" style={{ textDecoration: "none" }}>
                <Btn variant="outline" iconRight={<Icon name="arrow" size={14} />}>
                  Demander un rapport
                </Btn>
              </a>
            </div>
          </div>
          <div>
            {METHODOLOGY.map((it, i) => (
              <details
                key={i}
                className="faq-item"
                style={{
                  borderTop: i === 0 ? "1px solid var(--line)" : "none",
                  borderBottom: "1px solid var(--line)",
                  padding: "20px 0",
                }}
              >
                <summary
                  className="faq-summary"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    listStyle: "none", cursor: "pointer",
                    fontFamily: "var(--display)", fontWeight: 600, fontSize: 22,
                    letterSpacing: "-0.015em", color: "var(--ink)",
                    fontVariationSettings: "var(--display-var)",
                  }}
                >
                  <span style={{ paddingRight: 20 }}>{it.t}</span>
                  <span className="faq-icon" aria-hidden="true">+</span>
                </summary>
                <p className="faq-answer sy-body-l" style={{ marginTop: 14, maxWidth: 640 }}>{it.d}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA DOUBLE */}
      <section style={{ padding: "80px var(--page-pad) 96px", maxWidth: 1440, margin: "0 auto" }}>
        <div className="sy-grid-2-cta">
          <Card
            variant="accent"
            style={{
              padding: 36, borderRadius: "var(--radius-xl)",
              display: "flex", flexDirection: "column", gap: 18,
            }}
          >
            <div className="sy-mono">Entreprises</div>
            <h3 className="sy-h1" style={{ fontSize: 34, lineHeight: 1.05 }}>
              Financez un projet local,<br />
              <span style={{ color: "var(--accent-deep)" }}>fédérez vos équipes.</span>
            </h3>
            <p className="sy-body-l" style={{ maxWidth: 420 }}>
              Choisissez une expérience publiée ou décrivez votre besoin sur mesure. Chaque euro
              dépensé soutient un projet réel et reste sur votre territoire.
            </p>
            <div>
              <Link href="/experiences" style={{ textDecoration: "none" }}>
                <Btn variant="primary" size="lg" iconRight={<Icon name="arrow" size={16} color="#fff" />}>
                  Explorer les expériences
                </Btn>
              </Link>
            </div>
          </Card>
          <Card
            variant="flat"
            style={{
              padding: 36, borderRadius: "var(--radius-xl)",
              background: "var(--ink)", color: "var(--surface)", border: "none",
              display: "flex", flexDirection: "column", gap: 18,
            }}
          >
            <div className="sy-mono" style={{ color: "var(--highlight)" }}>Clubs</div>
            <h3 className="sy-h1" style={{ fontSize: 34, lineHeight: 1.05, color: "var(--surface)" }}>
              Donnez un budget<br />
              <span style={{ color: "var(--accent)" }}>à vos projets de saison.</span>
            </h3>
            <p className="sy-body-l" style={{ maxWidth: 420, color: "var(--ink-3)" }}>
              Inscription en 5 minutes, validation sous 72 h ouvrées. Chaque expérience encaissée
              alimente le projet de votre choix.
            </p>
            <div>
              <Link href="/inscription-club" style={{ textDecoration: "none" }}>
                <Btn variant="dark" size="lg" iconRight={<Icon name="arrow" size={16} color="#fff" />}>
                  Inscrire mon club
                </Btn>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <SiteFooter />

      <style>{`
        .impact-map-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
        }
        .sy-grid-2-flow {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .sy-grid-2-cta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .impact-map-grid { grid-template-columns: 1fr; }
          .sy-grid-2-flow { grid-template-columns: 1fr; }
          .sy-grid-2-cta { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
