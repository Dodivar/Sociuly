import { notFound } from "next/navigation";
import { Chip, Card, Progress, Stars } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { TopNav, SiteFooter } from "@/components/ds/patterns";
import { eur } from "@/lib/marketplace/experience-detail";
import { getAllClubSlugs, getClubBySlug } from "@/lib/clubs/club-detail.server";
import { ClubActions } from "./ClubActions";
import { ClubTabs } from "./ClubTabs";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllClubSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ClubProfilePage({ params }: Props) {
  const { slug } = await params;
  const CLUB = await getClubBySlug(slug);
  if (!CLUB) notFound();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav />

      {/* Cover */}
      <div
        className="asso-cover"
        style={{
          position: "relative",
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
      <div className="asso-content" style={{ position: "relative" }}>

        {/* Identity row */}
        <div className="asso-identity">
          <div className="asso-logo">{CLUB.initials}</div>

          <div style={{ flex: 1, minWidth: 0, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 className="sy-h1 asso-title">
                {CLUB.name}
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
                <Icon name="pin" size={13} /> {CLUB.cityLabel}
              </span>
              {CLUB.reviewCount > 0 && (
                <>
                  <span className="sy-small sy-muted">·</span>
                  <Stars value={CLUB.rating} size={13} mono />
                </>
              )}
              <span className="sy-small sy-muted">·</span>
              <span className="sy-small">{CLUB.descriptor}</span>
              {CLUB.verified && (
                <Chip variant="primary" size="sm">
                  <Icon name="check" size={10} /> vérifié
                </Chip>
              )}
            </div>
          </div>

          <ClubActions slug={CLUB.slug} clubName={CLUB.name} contactEmail={CLUB.contactEmail} />
        </div>

        {/* About + featured project */}
        <div className="asso-grid">
          <div>
            <h2 className="sy-h2">À propos</h2>
            <p className="sy-body" style={{ marginTop: 10, fontSize: 16, color: "var(--ink)" }}>
              {CLUB.description}
            </p>
            <div className="asso-stats">
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
            {CLUB.featuredProject && (
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
                    {eur(CLUB.featuredProject.raisedCents)} / {eur(CLUB.featuredProject.targetCents)}
                  </div>
                  <div className="sy-small sy-num">
                    {Math.round(CLUB.featuredProject.goal * 100)}%
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs + tab content — Client Component */}
        <ClubTabs
          clubName={CLUB.name}
          experiences={CLUB.experiences}
          projects={CLUB.projects}
          reviews={CLUB.reviews}
          team={CLUB.team}
          counts={CLUB.counts}
        />
      </div>

      <SiteFooter />

      <style>{`
        /* Styles de base (desktop ≥ 1440). Définis ici plutôt qu'en inline pour que
           les media queries puissent les surcharger — un style inline gagne toujours
           sur une règle de classe, ce qui cassait la version responsive. */
        .asso-cover { height: 220px; }
        .asso-content { padding: 0 48px; margin-top: -60px; }
        .asso-identity {
          display: flex;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 28px;
        }
        .asso-logo {
          width: 120px;
          height: 120px;
          border-radius: 24px;
          border: 4px solid var(--bg);
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--display);
          font-weight: 700;
          font-size: 44px;
          color: var(--primary);
          font-variation-settings: var(--display-var);
          flex-shrink: 0;
        }
        .asso-title { font-size: 36px; }
        .asso-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 28px; }
        .asso-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
        .asso-actions { display: flex; gap: 10px; padding-bottom: 8px; }

        /* Tablette : la grille passe sur une colonne, on garde la rangée d'identité horizontale */
        @media (max-width: 1024px) {
          .asso-content { padding: 0 32px; }
          .asso-grid { grid-template-columns: 1fr; }
          .asso-title { font-size: 30px; }
        }

        /* Mobile : on empile logo → titre → actions, façon profil mobile du mockup.
           La grille étant déjà en 1 colonne, la carte "projet phare" s'empile sous
           la section À propos au lieu d'être poussée hors écran. */
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
            width: 84px;
            height: 84px;
            border-radius: 20px;
            font-size: 30px;
            border-width: 3px;
          }
          .asso-identity > div { padding-bottom: 0 !important; }
          .asso-title { font-size: 24px; line-height: 1.15; }

          /* Actions plein écran : devis (CTA principal) sur sa propre ligne, puis Contacter + partage */
          .asso-actions {
            width: 100%;
            flex-wrap: wrap;
            padding-bottom: 0;
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
