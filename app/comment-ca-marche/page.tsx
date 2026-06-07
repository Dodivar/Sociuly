import type { Metadata } from "next";
import Link from "next/link";
import { Btn, Card, Chip } from "@/components/ds/components";
import { Icon, type IconName } from "@/components/ds/icon";
import { SiteFooter, TopNav } from "@/components/ds/patterns";

export const metadata: Metadata = {
  title: "Comment ça marche — Sociuly",
  description:
    "Sociuly conçoit des expériences sportives premium pour vos équipes, opérées par des clubs locaux. Découvrez le parcours côté entreprise et côté club : devis, paiement sécurisé, facturation, reversement.",
};

// Parcours entreprise (org_buyer) — aligné sur SPEC §4 (état Booking)
const ENTREPRISE_STEPS: ReadonlyArray<{ n: string; t: string; d: string }> = [
  {
    n: "01",
    t: "Vous choisissez une expérience",
    d: "Catalogue filtrable par ville, format (demi-journée, journée, soirée) et type de moment : cohésion, initiation, match VIP, masterclass. Toutes les expériences sont opérées par un club vérifié.",
  },
  {
    n: "02",
    t: "Vous demandez un devis",
    d: "Vous précisez la date, le nombre de participants et vos contraintes. Le club ajuste l'expérience et vous renvoie un devis nominatif (référence DEV-AAAA-NNNNN) sous 48 h, avec une date de validité.",
  },
  {
    n: "03",
    t: "Vous acceptez et versez l'acompte",
    d: "Acompte de 30 % du montant TTC pour sécuriser la date, paiement par carte via Stripe. La réservation passe en confirmée (référence SOC-AAAA-NNNNN). Le solde est réglé avant l'événement.",
  },
  {
    n: "04",
    t: "Le jour J, vos équipes vivent l'expérience",
    d: "L'expérience est animée par les encadrants du club. À l'issue, vous recevez une facture conforme (HT / TVA / TTC) et pouvez publier un avis pendant 30 jours.",
  },
];

// Parcours club (club_admin) — aligné sur SPEC §4 (KYC + corporate-ready)
const CLUB_STEPS: ReadonlyArray<{ n: string; t: string; d: string }> = [
  {
    n: "01",
    t: "Vous inscrivez votre club",
    d: "Association loi 1901 ou club professionnel : 5 minutes pour créer le compte, déclarer le SIRET, le statut et l'IBAN. Onboarding paiement via Stripe Connect Express, sans mot de passe.",
  },
  {
    n: "02",
    t: "Sociuly vérifie votre dossier",
    d: "SIRET (Sirene), affiliation fédérale ou statut pro, assurance RC pro, encadrant diplômé, capacité à émettre une facture conforme. Une fois actif et « prêt B2B », vous pouvez publier.",
  },
  {
    n: "03",
    t: "Vous composez vos expériences",
    d: "Assemblez des moments réutilisables (présentation coach, atelier cohésion, mini-tournoi, match VIP, cocktail…) en parcours sur mesure. Rattachez chaque expérience à un projet de saison.",
  },
  {
    n: "04",
    t: "Vous gérez devis et paiements",
    d: "Demandes entrantes côté console : vous ajustez, envoyez le devis, suivez l'acompte puis le solde. Le net vous est reversé automatiquement à J+1 après la prestation, commission 6 % TTC déduite.",
  },
];

// Engagements transverses — alignés sur SPEC §1 (stack) + §4 (règles)
const ENGAGEMENTS: ReadonlyArray<{ icon: IconName; t: string; d: string }> = [
  {
    icon: "check",
    t: "Clubs vérifiés",
    d: "SIRET, statut juridique, assurance RC pro et encadrant diplômé contrôlés avant la première publication. Aucun club non vérifié n'apparaît au catalogue.",
  },
  {
    icon: "lock",
    t: "Paiement sécurisé",
    d: "Carte bancaire via Stripe, aucune donnée bancaire conservée par Sociuly. Acompte et solde séparés, reçus envoyés à chaque étape.",
  },
  {
    icon: "download",
    t: "Facturation conforme",
    d: "Facture professionnelle au format PDF, avec détail HT / TVA / TTC selon le régime du club. Mise à disposition automatique dans votre espace.",
  },
  {
    icon: "euro",
    t: "Commission transparente",
    d: "6 % du montant TTC pour Sociuly, prélevés automatiquement sur le paiement. Pas de frais d'inscription, pas d'abonnement, ni pour le club ni pour l'entreprise.",
  },
];

// FAQ ciblée parcours — distincte de la FAQ landing (qui couvre l'offre)
const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "Quel délai pour recevoir un devis ?",
    a: "Sous 48 heures ouvrées après votre demande. Le devis précise le détail des moments, le nombre d'encadrants, le lieu, le prix HT, la TVA applicable et le TTC à régler.",
  },
  {
    q: "Quand le solde est-il dû ?",
    a: "Avant la date de réalisation de l'expérience. Vous recevez un rappel automatique et un lien de paiement sécurisé. Le règlement par carte ou virement déclenche la confirmation définitive.",
  },
  {
    q: "Que se passe-t-il en cas d'annulation ?",
    a: "L'acompte n'est pas remboursable une fois le devis accepté. Au-delà de 30 jours avant la date, vous perdez l'acompte ; entre 30 et 7 jours, 50 % du TTC reste dû ; à moins de 7 jours, 100 %. Si c'est le club qui annule, vous êtes intégralement remboursé.",
  },
  {
    q: "Quand le club est-il payé ?",
    a: "Reversement automatique à J+1 après la fin de la prestation, par virement Stripe sur le compte du club. Une fenêtre de 48 h post-réalisation permet à l'entreprise de signaler un éventuel litige.",
  },
  {
    q: "Sur quelles villes opérez-vous ?",
    a: "Strasbourg, Nancy et Metz dans la version actuelle. Déploiement national prévu au printemps 2027. Les recherches en dehors de ces zones sont mises en liste d'attente.",
  },
  {
    q: "Peut-on commander en tant que particulier ?",
    a: "Non. Sociuly est strictement professionnel (B2B) : l'acheteur est toujours une entreprise ou une organisation disposant d'un SIRET. Les commandes de particuliers ne sont pas acceptées.",
  },
];

export default function CommentCaMarchePage() {
  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav />

      {/* HERO */}
      <section style={{ padding: "48px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ maxWidth: 820 }}>
          <Chip variant="primary" leadingDot>Comment ça marche</Chip>
          <h1
            className="sy-display"
            style={{ fontSize: 64, letterSpacing: "-0.035em", lineHeight: 0.95, marginTop: 16 }}
          >
            Du brief au jour J,<br />
            <span style={{ color: "var(--accent)" }}>un parcours simple, encadré, traçable.</span>
          </h1>
          <p className="sy-body-l" style={{ marginTop: 18, maxWidth: 640 }}>
            Sociuly conçoit avec des clubs sportifs locaux — amateurs et professionnels — des
            expériences sur mesure pour vos équipes. Voici comment se déroule la collaboration,
            côté entreprise comme côté club.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#entreprises" style={{ textDecoration: "none" }}>
              <Btn variant="primary" size="lg" iconRight={<Icon name="arrow" size={16} color="#fff" />}>
                Parcours entreprise
              </Btn>
            </a>
            <a href="#clubs" style={{ textDecoration: "none" }}>
              <Btn variant="outline" size="lg">Parcours club</Btn>
            </a>
          </div>
        </div>
      </section>

      {/* PARCOURS ENTREPRISE */}
      <section
        id="entreprises"
        style={{ padding: "72px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto", scrollMarginTop: 24 }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
          <div style={{ maxWidth: 560 }}>
            <div className="sy-mono">Pour les entreprises</div>
            <h2 className="sy-h1" style={{ marginTop: 6 }}>
              Quatre étapes, zéro logistique<br />
              à votre charge.
            </h2>
            <p className="sy-body-l" style={{ marginTop: 12 }}>
              Vous gardez la main sur le brief et le budget. Sociuly et le club s&apos;occupent
              du reste — design d&apos;expérience, encadrement, facturation.
            </p>
          </div>
          <Link href="/experiences" style={{ textDecoration: "none" }}>
            <Btn variant="ghost" iconRight={<Icon name="arrow" size={14} />}>
              Voir le catalogue
            </Btn>
          </Link>
        </div>

        <div className="sy-grid-4">
          {ENTREPRISE_STEPS.map((s) => (
            <Card
              key={s.n}
              variant="flat"
              style={{
                padding: 24, borderRadius: "var(--radius-xl)",
                background: "var(--surface)", border: "1px solid var(--line)",
                display: "flex", flexDirection: "column", gap: 12, minHeight: 240,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--display)", fontWeight: 700, fontSize: 36, lineHeight: 1,
                  color: "var(--accent)", fontVariationSettings: "var(--display-var)",
                }}
              >
                {s.n}
              </div>
              <div className="sy-h3" style={{ color: "var(--ink)" }}>{s.t}</div>
              <div className="sy-body" style={{ color: "var(--ink-3)" }}>{s.d}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* PARCOURS CLUB */}
      <section
        id="clubs"
        style={{ padding: "80px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto", scrollMarginTop: 24 }}
      >
        <div
          className="sy-card"
          style={{
            background: "var(--ink)", border: "none",
            borderRadius: "var(--radius-xl)", padding: "40px 36px",
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 28 }}>
            <div style={{ maxWidth: 560 }}>
              <div className="sy-mono" style={{ color: "var(--highlight)" }}>Pour les clubs</div>
              <h2 className="sy-h1" style={{ color: "var(--surface)", marginTop: 6 }}>
                Une nouvelle source de revenus<br />pour vos projets de saison.
              </h2>
              <p className="sy-body-l" style={{ color: "var(--ink-3)", marginTop: 12 }}>
                Inscription gratuite, validation rapide, console de gestion intégrée. Vous
                concevez des expériences, Sociuly vous apporte des entreprises et gère la
                contractualisation.
              </p>
            </div>
            <Link href="/inscription-club" style={{ textDecoration: "none" }}>
              <Btn variant="primary" iconRight={<Icon name="arrow" size={14} color="#fff" />}>
                Inscrire mon club
              </Btn>
            </Link>
          </div>

          <div className="sy-grid-4">
            {CLUB_STEPS.map((s) => (
              <div
                key={s.n}
                style={{
                  padding: 24, borderRadius: "var(--radius-lg)",
                  background: "rgba(252,249,241,0.04)", border: "1px solid rgba(252,249,241,0.10)",
                  display: "flex", flexDirection: "column", gap: 10, minHeight: 240,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--display)", fontWeight: 700, fontSize: 36, lineHeight: 1,
                    color: "var(--highlight)", fontVariationSettings: "var(--display-var)",
                  }}
                >
                  {s.n}
                </div>
                <div className="sy-h3" style={{ color: "var(--surface)" }}>{s.t}</div>
                <div className="sy-body" style={{ color: "var(--ink-3)" }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGAGEMENTS */}
      <section style={{ padding: "80px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto" }}>
        <div style={{ maxWidth: 640, marginBottom: 28 }}>
          <div className="sy-mono">Nos engagements</div>
          <h2 className="sy-h1" style={{ marginTop: 6 }}>
            Cadre clair, paiements sécurisés,<br />factures conformes.
          </h2>
        </div>
        <div className="sy-grid-4">
          {ENGAGEMENTS.map((e) => (
            <Card
              key={e.t}
              variant="flat"
              style={{
                padding: 24, borderRadius: "var(--radius-xl)",
                background: "var(--surface)", border: "1px solid var(--line)",
                display: "flex", flexDirection: "column", gap: 12, minHeight: 200,
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

      {/* FAQ */}
      <section style={{ padding: "80px var(--page-pad) 0", maxWidth: 1440, margin: "0 auto" }}>
        <div className="faq-grid" style={{ gap: 48, alignItems: "flex-start" }}>
          <div className="faq-sticky" style={{ position: "sticky", top: 24 }}>
            <div className="sy-mono">Questions fréquentes</div>
            <h2 className="sy-h1" style={{ marginTop: 6 }}>
              Le parcours,<br />sans zone d&apos;ombre.
            </h2>
            <p className="sy-body" style={{ marginTop: 14, maxWidth: 320 }}>
              D&apos;autres questions sur le devis, la TVA ou la facturation ?
            </p>
            <div style={{ marginTop: 14 }}>
              <a href="mailto:contact@sociuly.fr" style={{ textDecoration: "none" }}>
                <Btn variant="outline" iconRight={<Icon name="arrow" size={14} />}>
                  Contacter l&apos;équipe
                </Btn>
              </a>
            </div>
          </div>
          <div>
            {FAQ.map((it, i) => (
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
                  <span style={{ paddingRight: 20 }}>{it.q}</span>
                  <span className="faq-icon" aria-hidden="true">+</span>
                </summary>
                <p className="faq-answer sy-body-l" style={{ marginTop: 14, maxWidth: 640 }}>{it.a}</p>
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
              Construisez votre prochain<br />
              <span style={{ color: "var(--accent-deep)" }}>séminaire d&apos;équipe.</span>
            </h3>
            <p className="sy-body-l" style={{ maxWidth: 420 }}>
              Demandez un devis sur une expérience publiée ou décrivez votre besoin sur mesure.
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
              Faites entrer les entreprises<br />
              <span style={{ color: "var(--accent)" }}>dans votre club.</span>
            </h3>
            <p className="sy-body-l" style={{ maxWidth: 420, color: "var(--ink-3)" }}>
              Inscription en 5 minutes, validation sous 72 h ouvrées. Pas d&apos;abonnement.
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
        .sy-grid-2-cta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        @media (max-width: 900px) {
          .sy-grid-2-cta { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
