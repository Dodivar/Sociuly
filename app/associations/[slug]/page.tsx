import { Btn, IconBtn, Chip, Card, Progress, Stars } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { TopNav, SiteFooter } from "@/components/ds/patterns";
import { AssociationTabs } from "./AssociationTabs";

// Placeholder data — will be replaced by Prisma queries in Phase B
const ASSO = {
  slug: "usb-volley",
  initials: "UV",
  name: "USB Volley",
  fullName: "Union Sportive de Bréquigny",
  city: "Rennes (35200)",
  rating: 4.9,
  reviewCount: 47,
  memberCount: 220,
  teamCount: 4,
  verified: true,
  description:
    "Club de volley-ball amateur fondé en 1978, l'USB regroupe 4 équipes (loisirs, U13, U17, seniors). Nous proposons des prestations conviviales pour financer notre saison sportive et les déplacements de nos jeunes en compétition.",
  stats: [
    { value: "42", label: "prestations", sub: "depuis 2024" },
    { value: "€18 400", label: "reversés", sub: "à 7 projets" },
    { value: "4.9 / 5", label: "satisfaction", sub: "47 avis" },
  ],
  featuredProject: {
    title: "Tournoi national U17 · Espagne",
    raised: 2480,
    target: 4000,
    goal: 0.62,
    daysLeft: 12,
  },
};

export async function generateStaticParams() {
  return [{ slug: "usb-volley" }];
}

export default function AssoProfilePage() {
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
      <TopNav active="associations" />

      {/* Cover */}
      <div
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
      <div style={{ padding: "0 48px", position: "relative", marginTop: -60 }}>

        {/* Identity row */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 28 }}>
          <div style={logoStyle}>{ASSO.initials}</div>

          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 className="sy-h1" style={{ fontSize: 36 }}>
                {ASSO.name} · {ASSO.fullName}
              </h1>
              {ASSO.verified && (
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
                  aria-label="Association vérifiée"
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
                <Icon name="pin" size={13} /> {ASSO.city}
              </span>
              <span className="sy-small sy-muted">·</span>
              <Stars value={ASSO.rating} size={13} mono />
              <span className="sy-small sy-muted">·</span>
              <span className="sy-small">
                {ASSO.memberCount} adhérents · {ASSO.teamCount} équipes
              </span>
              <Chip variant="primary" size="sm">
                <Icon name="check" size={10} /> vérifié
              </Chip>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, paddingBottom: 8 }}>
            <Btn variant="outline">Suivre</Btn>
            <Btn variant="dark">Contacter</Btn>
            <IconBtn aria-label="Partager">
              <Icon name="share" size={16} />
            </IconBtn>
          </div>
        </div>

        {/* About + featured project */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
          <div>
            <h2 className="sy-h2">À propos</h2>
            <p className="sy-body" style={{ marginTop: 10, fontSize: 16, color: "var(--ink)" }}>
              {ASSO.description}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 12,
                marginTop: 18,
              }}
            >
              {ASSO.stats.map((s) => (
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
                {ASSO.featuredProject.title}
              </div>
              <Progress
                value={ASSO.featuredProject.goal}
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
                  €{ASSO.featuredProject.raised.toLocaleString("fr-FR")} / €
                  {ASSO.featuredProject.target.toLocaleString("fr-FR")}
                </div>
                <div className="sy-small sy-num">
                  reste {ASSO.featuredProject.daysLeft}j
                </div>
              </div>
              <Btn variant="primary" block style={{ marginTop: 14 }}>
                Soutenir le projet
              </Btn>
            </Card>
          </div>
        </div>

        {/* Tabs + tab content — Client Component */}
        <AssociationTabs />
      </div>

      <SiteFooter />

      <style>{`
        @media (max-width: 900px) {
          .asso-identity { flex-direction: column; align-items: flex-start !important; }
          .asso-identity h1 { font-size: 24px !important; }
          .asso-grid { grid-template-columns: 1fr !important; }
          .asso-stats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .asso-stats { grid-template-columns: 1fr 1fr !important; }
          .asso-actions { display: none !important; }
        }
      `}</style>
    </div>
  );
}
