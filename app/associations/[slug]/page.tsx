import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, Btn, Card, Chip, Stars } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { PrestationCard, TopNav } from "@/components/ds/patterns";
import { ImpactMini } from "@/components/ds/impact";
import {
  getClubBySlug,
  getAllClubSlugs,
  BASE_URL,
  truncate,
  type Club,
} from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// ─────────────────────────────────────────────────────────────────────────────
// Pré-génération des routes statiques connues
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllClubSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Métadonnées dynamiques SEO
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const club = await getClubBySlug(slug);

  if (!club) {
    return { title: "Association introuvable" };
  }

  // Titre ≤ 60 car. : "Nom · Sport à Ville | Sociuly" via le template layout
  const rawTitle = `${club.name} · ${club.sport} à ${club.city}`;
  const title = truncate(rawTitle, 46); // 46 + " | Sociuly" (10) = 56 max
  const description = truncate(club.shortDescription, 155);
  const url = `${BASE_URL}/associations/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: club.image,
          width: 1200,
          height: 630,
          alt: club.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [club.image],
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Construit le JSON-LD Schema.org LocalBusiness + SportsOrganization
// ─────────────────────────────────────────────────────────────────────────────

function buildLocalBusinessSchema(club: Club, slug: string): object {
  return {
    "@context": "https://schema.org",
    // Double typage : reconnaissance en tant qu'entreprise locale ET organisation sportive
    "@type": ["LocalBusiness", "SportsOrganization"],
    name: club.name,
    description: club.description,
    url: `${BASE_URL}/associations/${slug}`,
    image: club.image,
    email: club.email,
    ...(club.phone && { telephone: club.phone }),
    foundingDate: club.foundedYear.toString(),
    sport: club.sport,
    // Adresse postale structurée
    address: {
      "@type": "PostalAddress",
      ...(club.address && { streetAddress: club.address }),
      addressLocality: club.city,
      ...(club.postalCode && { postalCode: club.postalCode }),
      addressRegion: `Département ${club.department}`,
      addressCountry: "FR",
    },
    // Coordonnées géographiques si disponibles
    ...(club.latitude !== undefined &&
      club.longitude !== undefined && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: club.latitude,
          longitude: club.longitude,
        },
      }),
    ...(club.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: club.rating.toFixed(1),
        reviewCount: club.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function AssociationDetailPage({ params }: Props) {
  const { slug } = await params;
  const club = await getClubBySlug(slug);

  if (!club) notFound();

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Schema.org LocalBusiness — injecté dans <body>, valide pour Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildLocalBusinessSchema(club, slug)),
        }}
      />

      <TopNav active="prestations" />

      <div style={{ padding: "20px 48px 64px", maxWidth: 1440, margin: "0 auto" }}>
        {/* Fil d'Ariane */}
        <div className="sy-mono" style={{ marginBottom: 8 }}>
          <Link href="/prestations" style={{ color: "inherit", textDecoration: "none" }}>
            Marketplace
          </Link>
          {" › "}
          <span style={{ color: "var(--ink)" }}>{club.name}</span>
        </div>

        {/* En-tête club */}
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            flexWrap: "wrap",
            paddingBottom: 28,
            borderBottom: "1px solid var(--line)",
          }}
        >
          <Avatar initials={club.logoInitials} size="xl" tone="green" />

          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <h1 className="sy-h1" style={{ fontSize: 32 }}>
                {club.name}
              </h1>
              <Chip variant="primary">
                <Icon name="check" size={11} /> Asso vérifiée
              </Chip>
            </div>

            <div
              style={{
                display: "flex",
                gap: 14,
                marginTop: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Stars value={club.rating} />
              <span className="sy-small" style={{ color: "var(--ink)" }}>
                {club.rating.toFixed(1)} · {club.reviewCount} avis
              </span>
              <span className="sy-small sy-muted">·</span>
              <span
                className="sy-small"
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
              >
                <Icon name="pin" size={13} />
                {club.city} ({club.department})
              </span>
              <span className="sy-small sy-muted">·</span>
              <span className="sy-small" style={{ color: "var(--ink)" }}>
                {club.sport}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Btn
              variant="ghost"
              size="sm"
              icon={<Icon name="heart" size={14} />}
            >
              Sauver
            </Btn>
            <Btn
              variant="ghost"
              size="sm"
              icon={<Icon name="share" size={14} />}
            >
              Partager
            </Btn>
          </div>
        </div>

        {/* Grille principale : contenu + rail droit */}
        <div className="asso-grid">
          {/* Colonne principale */}
          <div>
            {/* Statistiques clés */}
            <div className="asso-stats-grid">
              {(
                [
                  ["users", `${club.memberCount} licenciés`, "Membres"],
                  ["calendar", `${club.prestationCount} prestations`, "Actives"],
                  ["pin", club.city, "Localisation"],
                  ["check", `Depuis ${club.foundedYear}`, "Fondé"],
                ] as Array<["users" | "calendar" | "pin" | "check", string, string]>
              ).map(([icon, value, label]) => (
                <Card key={label}>
                  <Icon name={icon} size={18} color="var(--primary)" />
                  <div className="sy-mono" style={{ marginTop: 8 }}>
                    {label}
                  </div>
                  <div className="sy-h4" style={{ marginTop: 2 }}>
                    {value}
                  </div>
                </Card>
              ))}
            </div>

            {/* Description */}
            <h2 className="sy-h2" style={{ marginTop: 28 }}>
              À propos
            </h2>
            <p
              className="sy-body"
              style={{ marginTop: 10, fontSize: 16, color: "var(--ink)" }}
            >
              {club.description}
            </p>

            {/* Prestations proposées */}
            <h2 className="sy-h2" style={{ marginTop: 32 }}>
              Nos prestations
            </h2>
            <p className="sy-small sy-muted" style={{ marginTop: 4 }}>
              Chaque réservation finance directement un projet de saison.
            </p>
            <div className="asso-prestations-grid">
              <PrestationCard hue="green" />
              <PrestationCard hue="orange" />
              <PrestationCard hue="teal" />
            </div>

            <div style={{ marginTop: 20 }}>
              <Btn
                variant="outline"
                iconRight={<Icon name="arrow" size={14} />}
              >
                Voir toutes les prestations
              </Btn>
            </div>
          </div>

          {/* Rail droit */}
          <aside>
            <div style={{ position: "sticky", top: 16 }}>
              {/* Bloc contact */}
              <Card
                style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div className="sy-h3">Contact & localisation</div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Icon name="pin" size={16} color="var(--primary)" />
                    <span className="sy-small" style={{ color: "var(--ink)" }}>
                      {club.address ? `${club.address}, ` : ""}
                      {club.postalCode} {club.city}
                    </span>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Icon name="download" size={16} color="var(--primary)" />
                    <span className="sy-small" style={{ color: "var(--ink)" }}>
                      {club.email}
                    </span>
                  </div>

                  {club.phone && (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Icon name="bell" size={16} color="var(--primary)" />
                      <span className="sy-small" style={{ color: "var(--ink)" }}>
                        {club.phone}
                      </span>
                    </div>
                  )}
                </div>

                <Btn
                  variant="primary"
                  iconRight={<Icon name="arrow" size={14} color="#fff" />}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Contacter l&apos;asso
                </Btn>
              </Card>

              {/* Projet de saison en cours */}
              <div style={{ marginTop: 16 }}>
                <ImpactMini />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .asso-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 36px;
        }
        .asso-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 22px;
        }
        .asso-prestations-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 16px;
        }
        @media (max-width: 1024px) {
          .asso-grid { grid-template-columns: 1fr; }
          .asso-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .asso-prestations-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .asso-prestations-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
