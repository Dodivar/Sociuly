import Link from "next/link";
import { Btn, IconBtn, Chip, Card, Progress, Stars } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { TopNav, SiteFooter } from "@/components/ds/patterns";
import { ClubTabs } from "./ClubTabs";

// Placeholder data — will be replaced by Prisma queries in Phase B
const CLUB = {
  slug: "sig-strasbourg",
  initials: "SIG",
  name: "SIG Strasbourg",
  fullName: "Strasbourg IG Basket",
  clubType: "club_pro" as const,
  city: "Strasbourg (67000)",
  rating: 4.9,
  reviewCount: 47,
  memberCount: 180,
  teamCount: 6,
  verified: true,
  description:
    "Club professionnel de basket évoluant en Betclic Élite. La SIG ouvre son Arena et son staff aux entreprises : séminaires de cohésion, initiations encadrées, matchs VIP et masterclass. Chaque expérience finance directement notre école de jeunes et nos déplacements.",
  stats: [
    { value: "12", label: "expériences", sub: "au catalogue" },
    { value: "€42 800", label: "reversés", sub: "à 6 projets" },
    { value: "4.9 / 5", label: "satisfaction", sub: "47 avis" },
  ],
  featuredProject: {
    title: "École de jeunes U17 · saison 2026",
    raised: 24800,
    target: 40000,
    goal: 0.62,
    daysLeft: 12,
  },
};

export async function generateStaticParams() {
  return [{ slug: "sig-strasbourg" }];
}

export default function ClubProfilePage() {
  const logoStyle = {
    width: 120,
    height: 120,
    borderRadius: 24,
    background: "var(--surface)",
    border: "4px solid var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "var(--display)",
    fontWeight: 700,
    fontSize: 44,
    color: "var(--primary)",
    fontVariationSettings: "var(--display-var)",
    flexShrink: 0,
  };

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav active="clubs" />

      {/* Cover */}
      <div
        className="asso-cover"
        style={{
          position: "relative",
          height: 220,
          overflow: "hidden",
          background: "linear-gradient(135deg, #1f4b3f 0%, #14332b 100%)",
        }}
      >
        <svg
          viewBox="0 0 1440 220"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}
          aria-hidden
        >
          <circle cx="1200" cy="60" r="80" fill="#f1c14a" opacity=".7" />
          <path d="M0 170 Q 400 130 720 150 T 1440 130 L 1440 220 L 0 220 Z" fill="#e8623d" opacity=".5" />
          <path d="M0 200 Q 500 170 900 190 T 1440 180 L 1440 220 L 0 220 Z" fill="#14332b" />
        </svg>
      </div>

      {/* Main content */}
      <div className="asso-content" style={{ padding: "0 48px", position: "relative", marginTop: -60 }}>

        {/* Identity row */}
        <div className="asso-identity" style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 28 }}>
          <div className="asso-logo" style={logoStyle}>{CLUB.initials}</div>

          <div style={{ flex: 1, minWidth: 0, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 className="sy-h1 asso-title" style={{ fontSize: 36 }}>
                {CLUB.name} · {CLUB.fullName}
              </h1>
              {CLUB.verified && (
                <span
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-label="Club vérifié"
                >
                  <Icon name="check" size={14} color="#fff" />
                </span>
              )}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 6,
                flexWrap: "wrap",
              }}
            >
              <span
                className="sy-small"
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Icon name="pin" size={13} /> {CLUB.city}
              </span>
              <span className="sy-small sy-muted">·</span>
              <Stars value={CLUB.rating} size={13} mono />
              <span className="sy-small sy-muted">·</span>
              <span className="sy-small">
                {CLUB.memberCount} adhérents · {CLUB.teamCount} équipes
              </span>
              <Chip variant="primary" size="sm">
                <Icon name="check" size={10} /> vérifié
              </Chip>
            </div>
          </div>

          <div className="asso-actions" style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
            <Btn className="asso-act-contact" variant="outline">Contacter</Btn>
            <Link className="asso-act-devis" href="/experiences" style={{ textDecoration: "none" }}>
              <Btn variant="dark">Demander un devis</Btn>
            </Link>
            <IconBtn className="asso-act-share" aria-label="Partager">
              <Icon name="share" size={16} />
            </IconBtn>
          </div>
        </div>

        {/* About + featured project */}
        <div className="asso-grid" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
          <div>
            <h2 className="sy-h2">À propos</h2>
            <p className="sy-body" style={{ marginTop: 10, fontSize: 16, color: "var(--ink)" }}>
              {CLUB.description}
            </p>
            <div
              className="asso-stats"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginTop: 18,
              }}
            >
              {CLUB.stats.map((s) => (
                <Card key={s.label}>
                  <div
                    className="sy-num"
                    style={{
                      fontFamily: "var(--display)",
                      fontWeight: 700,
                      fontSize: 28,
                      fontVariationSettings: "var(--display-var)",
                    }}
                  >
                    {s.value}
                  </div>
                  <div className="sy-h4" style={{ marginTop: 4 }}>{s.label}</div>
                  <div className="sy-mono" style={{ marginTop: 2 }}>{s.sub}</div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card
              variant="accent"
              style={{ padding: 20, borderRadius: "var(--radius-lg)" }}
            >
              <div className="sy-mono">projet phare en cours</div>
              <div className="sy-h2" style={{ marginTop: 6 }}>
                {CLUB.featuredProject.title}
              </div>
              <Progress
                value={CLUB.featuredProject.goal}
                size="tall"
                style={{ marginTop: 12 }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                }}
              >
                <div className="sy-small sy-num">
                  €{CLUB.featuredProject.raised.toLocaleString("fr-FR")} / €
                  {CLUB.featuredProject.target.toLocaleString("fr-FR")}
                </div>
                <div className="sy-small sy-num">
                  reste {CLUB.featuredProject.daysLeft}j
                </div>
              </div>
              <Link href="/experiences" style={{ textDecoration: "none", display: "block", marginTop: 14 }}>
                <Btn variant="primary" block>
                  Voir les expériences du club
                </Btn>
              </Link>
            </Card>
          </div>
        </div>

        {/* Tabs + tab content — Client Component */}
        <ClubTabs />
      </div>

      <SiteFooter />

      <style>{`
        /* Tablette : la grille passe sur une colonne, on garde la rangée d'identité horizontale */
        @media (max-width: 1024px) {
          .asso-content { padding: 0 32px; }
          .asso-grid { grid-template-columns: 1fr; }
          .asso-title { font-size: 30px; }
        }

        /* Mobile : on empile logo → titre → actions, façon profil mobile du mockup */
        @media (max-width: 768px) {
          .asso-cover { height: 150px; }
          .asso-content { padding: 0 16px; margin-top: -44px; }
          .asso-identity {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
            margin-bottom: 22px;
          }
          .asso-logo {
            width: 84px !important;
            height: 84px !important;
            border-radius: 20px !important;
            font-size: 30px !important;
            border-width: 3px !important;
          }
          .asso-identity > div { padding-bottom: 0 !important; }
          .asso-title { font-size: 24px; line-height: 1.15; }

          /* Actions plein écran : devis (CTA principal) sur sa propre ligne, puis Contacter + partage */
          .asso-actions {
            width: 100%;
            flex-wrap: wrap;
            padding-bottom: 0 !important;
          }
          .asso-act-devis {
            order: -1;
            flex: 1 1 100%;
          }
          .asso-act-devis > .sy-btn { width: 100%; }
          .asso-act-contact { flex: 1; }
        }

        @media (max-width: 480px) {
          .asso-stats { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
