import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, Btn, Card, Chip, Progress, Stars } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { SiteFooter, TopNav } from "@/components/ds/patterns";
import { ImpactHero } from "@/components/ds/impact";
import { ExperienceGallery } from "@/components/experiences/gallery";
import { ExperienceBookingRail } from "@/components/experiences/booking-rail";
import { ExperienceReviews } from "@/components/experiences/reviews";
import { ShareButton } from "@/components/experiences/share-button";
import { FavoriteButton } from "@/components/experiences/favorite-button";
import {
  eur,
  getAllExperienceSlugs,
  getExperienceBySlug,
} from "@/lib/marketplace/experience-detail.server";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllExperienceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const exp = await getExperienceBySlug(slug);
  if (!exp) notFound();

  const { club, project } = exp;

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNav />

      <div style={{ padding: "20px var(--page-pad) 40px", maxWidth: 1440, margin: "0 auto" }}>
        {/* breadcrumb */}
        <div className="sy-mono" style={{ marginBottom: 8 }}>
          <Link href="/experiences" style={{ color: "inherit", textDecoration: "none" }}>Expériences</Link>
          {" › "}
          <span style={{ color: "var(--ink)" }}>{exp.title}</span>
        </div>

        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            gap: 18, flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="sy-h1" style={{ fontSize: 36 }}>{exp.title}</h1>
            <div style={{ display: "flex", gap: 14, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Stars value={exp.rating} />
              <span className="sy-small" style={{ color: "var(--ink)" }}>
                {exp.rating.toFixed(1)} · {exp.reviewCount} avis
              </span>
              <span className="sy-small sy-muted">·</span>
              <span className="sy-small" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="pin" size={13} /> {exp.cityLabel}
              </span>
              {exp.verified && (
                <Chip variant="primary"><Icon name="check" size={11} /> Club vérifié</Chip>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <FavoriteButton experienceId={exp.id} />
            <ShareButton title={exp.title} />
          </div>
        </div>

        {/* gallery (mosaïque + viewer) */}
        <ExperienceGallery photos={exp.photos} />

        {/* Main grid: content + right rail */}
        <div className="detail-grid">
          <div>
            {/* club strip — lien actif vers le profil du club */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 14, paddingBottom: 22,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <Avatar initials={club.initials} size="lg" tone={club.tone} />
              <div style={{ flex: 1 }}>
                <div className="sy-h3">Proposé par {club.name}</div>
                <div className="sy-small sy-muted">
                  {club.experienceCount} expériences · {club.typeLabel} · {club.responseTime}
                </div>
              </div>
              <Link href={`/clubs/${club.slug}`} style={{ textDecoration: "none" }}>
                <Btn variant="outline" size="sm" iconRight={<Icon name="arrow" size={13} />}>
                  Voir le club
                </Btn>
              </Link>
            </div>

            {/* facts */}
            <div className="facts-grid">
              {exp.facts.map(([k, v, ic]) => (
                <Card key={k}>
                  <Icon name={ic} size={18} color="var(--primary)" />
                  <div className="sy-mono" style={{ marginTop: 8 }}>{k}</div>
                  <div className="sy-h4" style={{ marginTop: 2 }}>{v}</div>
                </Card>
              ))}
            </div>

            {/* description */}
            <h2 className="sy-h2" style={{ marginTop: 28 }}>L&apos;expérience</h2>
            {exp.description.map((p, i) => (
              <p
                key={i}
                className="sy-body"
                style={{ marginTop: i === 0 ? 10 : 8, fontSize: i === 0 ? 16 : undefined, color: "var(--ink)" }}
              >
                {p}
              </p>
            ))}

            <div className="included-grid">
              {exp.included.map((t) => (
                <div key={t} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span
                    style={{
                      width: 22, height: 22, borderRadius: 7, background: "var(--primary)",
                      color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center",
                      flex: "0 0 auto",
                    }}
                  >
                    <Icon name="check" size={13} color="#fff" />
                  </span>
                  <span className="sy-small" style={{ color: "var(--ink)" }}>{t}</span>
                </div>
              ))}
            </div>

            {/* projet financé — lien actif vers le projet du club */}
            <h2 className="sy-h2" style={{ marginTop: 28 }}>Votre devis finance un projet</h2>
            <Link
              href={`/clubs/${project.clubSlug}`}
              style={{ textDecoration: "none", color: "inherit", display: "block", marginTop: 12 }}
            >
              <Card
                style={{
                  padding: 18, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    width: 48, height: 48, borderRadius: 12, flex: "0 0 auto",
                    background: "var(--primary-soft)", display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon name="trophy" size={22} color="var(--primary-deep)" />
                </span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div className="sy-mono">Projet financé · {club.name}</div>
                  <div className="sy-h3" style={{ marginTop: 2 }}>{project.title}</div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 10 }}>
                    <span className="sy-small sy-muted">
                      {eur(project.raisedCents)} collectés sur {eur(project.targetCents)}
                    </span>
                    <span className="sy-mono sy-num" style={{ color: "var(--accent-deep)" }}>
                      {Math.round(project.goal * 100)}%
                    </span>
                  </div>
                  <Progress value={project.goal} style={{ marginTop: 8 }} />
                </div>
                <Icon name="arrow" size={16} color="var(--ink-3)" />
              </Card>
            </Link>

            {/* calendar */}
            <h2 className="sy-h2" style={{ marginTop: 28 }}>Disponibilités</h2>
            <Card style={{ marginTop: 12, padding: 18, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  width: 72, height: 72, borderRadius: 12, background: "var(--accent-soft)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
              >
                <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>
                  {new Date(`${exp.slots[0].date}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 3).toUpperCase()}
                </div>
                <div
                  className="sy-num"
                  style={{
                    fontFamily: "var(--display)", fontWeight: 700, fontSize: 30, lineHeight: 1,
                    color: "var(--accent-deep)", fontVariationSettings: "var(--display-var)",
                  }}
                >
                  {new Date(`${exp.slots[0].date}T00:00:00`).getDate()}
                </div>
                <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>
                  {new Date(`${exp.slots[0].date}T00:00:00`).toLocaleDateString("fr-FR", { month: "short" }).toUpperCase()}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="sy-mono">Prochaine date</div>
                <div className="sy-h3" style={{ marginTop: 4 }}>
                  {new Date(`${exp.slots[0].date}T00:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  {" · "}{exp.slots[0].time.replace(":", "h")}
                </div>
                <div className="sy-small sy-muted" style={{ marginTop: 4 }}>
                  + {exp.slots.length - 1} autres créneaux à venir
                </div>
              </div>
              <Btn variant="outline" iconRight={<Icon name="chevron" size={14} />}>Voir le calendrier</Btn>
            </Card>

            {/* reviews — pagination « voir plus » */}
            <ExperienceReviews reviews={exp.reviews} rating={exp.rating} count={exp.reviewCount} />
          </div>

          {/* RIGHT RAIL — estimateur de devis sticky */}
          <aside>
            <div style={{ position: "sticky", top: 16 }}>
              <ExperienceBookingRail experience={exp} />
              <div style={{ marginTop: 16 }}>
                <ImpactHero />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />

      <style>{`
        .detail-gallery {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          height: 380px;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .detail-gallery > .gallery-hero { grid-row: 1 / 3; }
        .detail-gallery > .gallery-tile { position: relative; }
        .detail-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 36px;
        }
        .facts-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 22px;
        }
        .included-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 18px;
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }
        @media (max-width: 1024px) {
          .detail-grid { grid-template-columns: 1fr; }
          .facts-grid { grid-template-columns: repeat(2, 1fr); }
          .detail-gallery { height: 320px; }
        }
        @media (max-width: 768px) {
          .detail-gallery {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 220px 100px;
            height: auto;
          }
          .detail-gallery > .gallery-hero { grid-row: 1 / 2; grid-column: 1 / 3; }
          .detail-gallery > .gallery-tile:nth-child(n+4) { display: none; }
          .reviews-grid { grid-template-columns: 1fr; }
          .included-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .facts-grid { grid-template-columns: repeat(2, 1fr); }
          .detail-gallery { grid-template-columns: 1fr; grid-template-rows: 220px; }
          .detail-gallery > .gallery-hero { grid-column: 1; }
          .detail-gallery > .gallery-tile:nth-child(n+2) { display: none; }
        }
      `}</style>
    </main>
  );
}
