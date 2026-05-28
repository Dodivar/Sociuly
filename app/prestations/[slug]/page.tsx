import type { Metadata } from "next";
import Link from "next/link";
import { Avatar, Btn, Card, Chip, Stars } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { BookingCard, ReviewCard, TopNav } from "@/components/ds/patterns";
import { ImpactHero } from "@/components/ds/impact";
import {
  getPrestationBySlug,
  getAllPrestationSlugs,
  BASE_URL,
  truncate,
  type Prestation,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// ─────────────────────────────────────────────────────────────────────────────
// Pré-génération des routes statiques connues
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllPrestationSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Métadonnées dynamiques SEO
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const prestation = await getPrestationBySlug(slug);

  if (!prestation) {
    return { title: "Prestation introuvable" };
  }

  // Titre ≤ 60 car. : "Titre · Ville — Prix€ | Sociuly" via le template layout
  const rawTitle = `${prestation.title} · ${prestation.city} — ${prestation.price}€`;
  const title = truncate(rawTitle, 46); // 46 + " | Sociuly" (10) = 56 max
  const description = truncate(prestation.shortDescription, 155);
  const url = `${BASE_URL}/prestations/${slug}`;

  return {
    title,
    description,
    // URL canonique explicite
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: prestation.image,
          width: 1200,
          height: 630,
          alt: prestation.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [prestation.image],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Construit le JSON-LD Schema.org Service pour une prestation
// ─────────────────────────────────────────────────────────────────────────────

function buildServiceSchema(prestation: Prestation, slug: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: prestation.title,
    description: prestation.description,
    url: `${BASE_URL}/prestations/${slug}`,
    image: prestation.image,
    category: prestation.category,
    areaServed: {
      "@type": "City",
      name: prestation.city,
    },
    provider: {
      "@type": "SportsOrganization",
      name: prestation.clubName,
      url: `${BASE_URL}/associations/${prestation.clubSlug}`,
    },
    offers: {
      "@type": "Offer",
      price: prestation.price.toString(),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      // Date de la prochaine disponibilité si connue
      ...(prestation.nextDate && { availabilityStarts: prestation.nextDate }),
    },
    ...(prestation.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: prestation.rating.toFixed(1),
        reviewCount: prestation.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };
}

const FACTS: Array<[string, string, "users" | "calendar" | "pin" | "check"]> = [
  ["Capacité", "10–60 pers.",          "users"],
  ["Durée",    "≈ 3 heures",            "calendar"],
  ["Lieu",     "Chez vous",             "pin"],
  ["Inclus",   "Matériel + 6 bénévoles", "check"],
];

const INCLUDED = [
  "Matériel de cuisson", "Tables et nappes",
  "6 bénévoles",         "Service de A à Z",
  "Vaisselle compostable", "Boissons sur option",
];

export default async function PrestationDetailPage({ params }: Props) {
  const { slug } = await params;
  const prestation = await getPrestationBySlug(slug);

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Schema.org Service — injecté dans <body>, valide pour Google */}
      {prestation && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildServiceSchema(prestation, slug)),
          }}
        />
      )}
      <TopNav active="prestations" />

      <div style={{ padding: "20px 48px 40px", maxWidth: 1440, margin: "0 auto" }}>
        {/* breadcrumb */}
        <div className="sy-mono" style={{ marginBottom: 8 }}>
          <Link href="/prestations" style={{ color: "inherit", textDecoration: "none" }}>Marketplace</Link>
          {" › BBQ › "}
          <span style={{ color: "var(--ink)" }}>Barbecue convivial USB Volley</span>
        </div>

        <div
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            gap: 18, flexWrap: "wrap",
          }}
        >
          <div>
            <h1 className="sy-h1" style={{ fontSize: 36 }}>Barbecue convivial du club USB Volley</h1>
            <div style={{ display: "flex", gap: 14, marginTop: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Stars value={4.9} />
              <span className="sy-small" style={{ color: "var(--ink)" }}>4.9 · 47 avis</span>
              <span className="sy-small sy-muted">·</span>
              <span className="sy-small" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Icon name="pin" size={13} /> Strasbourg (67)
              </span>
              <Chip variant="primary"><Icon name="check" size={11} /> Asso vérifiée</Chip>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" size="sm" icon={<Icon name="heart" size={14} />}>Sauver</Btn>
            <Btn variant="ghost" size="sm" icon={<Icon name="share" size={14} />}>Partager</Btn>
          </div>
        </div>

        {/* gallery */}
        <div className="detail-gallery">
          <div
            className="sy-img gallery-hero"
            style={{ borderRadius: 0, background: "linear-gradient(165deg, #1f4b3f 0%, #14332b 100%)" }}
          >
            <svg viewBox="0 0 220 220" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4 }}>
              <circle cx="160" cy="60" r="36" fill="#f1c14a" opacity="0.7" />
              <path d="M0 170 Q 60 130 110 150 T 220 130 L 220 220 L 0 220 Z" fill="#e8623d" opacity="0.55" />
              <path d="M0 200 Q 80 175 130 195 T 220 185 L 220 220 L 0 220 Z" fill="#14332b" />
            </svg>
            <span className="sy-img-label" style={{ position: "absolute", bottom: 16, left: 16 }}>
              Photo principale · scène BBQ
            </span>
          </div>
          <div className="sy-img" style={{ borderRadius: 0, background: "linear-gradient(135deg, #e8623d 0%, #c0451f 100%)" }} />
          <div className="sy-img" style={{ borderRadius: 0, background: "linear-gradient(135deg, #f1c14a 0%, #b8861a 100%)" }} />
          <div className="sy-img" style={{ borderRadius: 0, background: "linear-gradient(135deg, #1f5b58 0%, #14332b 100%)" }} />
          <div
            className="sy-img"
            style={{ borderRadius: 0, position: "relative", background: "linear-gradient(135deg, #8a6b3e 0%, #5a4525 100%)" }}
          >
            <Btn
              variant="dark"
              size="sm"
              style={{ position: "absolute", bottom: 12, right: 12 }}
              icon={<Icon name="grid" size={13} color="#fff" />}
            >
              Voir 12 photos
            </Btn>
          </div>
        </div>

        {/* Main grid: content + right rail */}
        <div className="detail-grid">
          <div>
            {/* asso strip */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 14, paddingBottom: 22,
                borderBottom: "1px solid var(--line)",
              }}
            >
              <Avatar initials="UV" size="lg" tone="green" />
              <div style={{ flex: 1 }}>
                <div className="sy-h3">Proposé par USB Volley</div>
                <div className="sy-small sy-muted">42 prestations · membre depuis 2024 · répond en 2h</div>
              </div>
              <Btn variant="outline" size="sm" iconRight={<Icon name="arrow" size={13} />}>
                Voir l&apos;asso
              </Btn>
            </div>

            {/* facts */}
            <div className="facts-grid">
              {FACTS.map(([k, v, ic]) => (
                <Card key={k}>
                  <Icon name={ic} size={18} color="var(--primary)" />
                  <div className="sy-mono" style={{ marginTop: 8 }}>{k}</div>
                  <div className="sy-h4" style={{ marginTop: 2 }}>{v}</div>
                </Card>
              ))}
            </div>

            {/* description */}
            <h2 className="sy-h2" style={{ marginTop: 28 }}>L&apos;expérience</h2>
            <p className="sy-body" style={{ marginTop: 10, fontSize: 16, color: "var(--ink)" }}>
              Notre équipe de bénévoles vient cuisiner chez vous : grillades préparées sur place,
              salades de saison, ambiance conviviale assurée. Idéal pour les anniversaires, les
              événements d&apos;entreprise ou les fêtes de quartier.
            </p>
            <p className="sy-body" style={{ marginTop: 8 }}>
              Tout le matériel est fourni, les bénévoles s&apos;occupent du service du début à la fin.
              Vous profitez, on s&apos;occupe du reste — et chaque réservation finance directement
              notre projet de saison.
            </p>

            <div className="included-grid">
              {INCLUDED.map((t) => (
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

            {/* calendar */}
            <h2 className="sy-h2" style={{ marginTop: 28 }}>Disponibilités</h2>
            <Card style={{ marginTop: 12, padding: 18, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
              <div
                style={{
                  width: 72, height: 72, borderRadius: 12, background: "var(--accent-soft)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}
              >
                <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>SAM</div>
                <div
                  className="sy-num"
                  style={{
                    fontFamily: "var(--display)", fontWeight: 700, fontSize: 30, lineHeight: 1,
                    color: "var(--accent-deep)", fontVariationSettings: "var(--display-var)",
                  }}
                >
                  14
                </div>
                <div className="sy-mono" style={{ color: "var(--accent-deep)" }}>JUIN</div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="sy-mono">Prochaine date</div>
                <div className="sy-h3" style={{ marginTop: 4 }}>Samedi 14 juin · 16h00</div>
                <div className="sy-small sy-muted" style={{ marginTop: 4 }}>+ 8 autres créneaux ce mois-ci</div>
              </div>
              <Btn variant="outline" iconRight={<Icon name="chevron" size={14} />}>Voir le calendrier</Btn>
            </Card>

            {/* reviews */}
            <div
              style={{
                marginTop: 28, display: "flex", alignItems: "baseline",
                justifyContent: "space-between", flexWrap: "wrap", gap: 8,
              }}
            >
              <h2 className="sy-h2">Avis (47)</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Stars value={4.9} size={14} />
                <span className="sy-h3">4.9</span>
              </div>
            </div>
            <div className="reviews-grid">
              <ReviewCard />
              <ReviewCard
                name="Hugo M."
                tone="green"
                rating={5}
                body="Excellent moment d'équipe, et le club a pu financer ses maillots. Service nickel, ambiance au top."
              />
            </div>
          </div>

          {/* RIGHT RAIL */}
          <aside>
            <div style={{ position: "sticky", top: 16 }}>
              <BookingCard ctaHref={`/reserver/${slug}`} />
              <div style={{ marginTop: 16 }}>
                <ImpactHero />
              </div>
            </div>
          </aside>
        </div>
      </div>

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
          .detail-gallery > :nth-child(n+4) { display: none; }
          .reviews-grid { grid-template-columns: 1fr; }
          .included-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
