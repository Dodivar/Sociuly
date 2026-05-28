import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { cx } from "@/lib/cx";
import { Avatar, Btn, Card, Chip, Progress, Stars } from "./components";
import { Icon } from "./icon";
import { ImpactMini } from "./impact";

// ─────── PrestationCard ───────
export type PrestationHue = "green" | "orange" | "yellow" | "sand" | "teal" | "rust";
const HUES: Record<PrestationHue, { bg: string; accent: string }> = {
  green:  { bg: "#1f4b3f", accent: "#fbe082" },
  orange: { bg: "#c0451f", accent: "#fce3d8" },
  yellow: { bg: "#b8861a", accent: "#fff2c5" },
  sand:   { bg: "#8a6b3e", accent: "#f3dba6" },
  teal:   { bg: "#1f5b58", accent: "#d8efea" },
  rust:   { bg: "#8c4a25", accent: "#fbd6b9" },
};

export type PrestationCardProps = {
  title?: string;
  price?: number;
  loc?: string;
  rating?: number;
  reviews?: number;
  category?: string;
  asso?: string;
  funds?: string;
  goal?: number;
  hue?: PrestationHue;
  saved?: boolean;
  compact?: boolean;
  href?: string;
  style?: CSSProperties;
};

export function PrestationCard({
  title = "Barbecue convivial du club",
  price = 280,
  loc = "Strasbourg · 2 km",
  rating = 4.8,
  reviews = 47,
  category = "BBQ · 10–60 pers.",
  funds = "Tournoi U17",
  goal = 0.62,
  hue = "green",
  saved,
  compact,
  href = "/prestations/barbecue-convivial-usb-volley",
  style,
}: PrestationCardProps) {
  const h = HUES[hue];
  return (
    <Link href={href} style={{ textDecoration: "none", color: "inherit" }}>
      <div
        className="sy-card"
        style={{
          padding: 0, overflow: "hidden", borderRadius: "var(--radius-lg)",
          border: "1px solid var(--line)", background: "var(--surface)",
          cursor: "pointer", transition: "transform .2s ease, box-shadow .2s ease",
          ...style,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            className="sy-img"
            style={{
              height: compact ? 150 : 200, borderRadius: 0,
              background: `linear-gradient(135deg, ${h.bg} 0%, ${h.bg}cc 50%, ${h.bg}aa 100%)`,
            }}
          >
            <svg
              viewBox="0 0 200 120"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}
            >
              <path d="M0 100 Q 40 60 80 80 T 200 70 L 200 120 L 0 120 Z" fill={h.accent} />
              <circle cx="160" cy="30" r="14" fill={h.accent} opacity="0.6" />
            </svg>
            <span
              className="sy-img-label"
              style={{ position: "absolute", top: 12, left: 12, background: "rgba(252,249,241,.92)", color: "var(--ink-2)" }}
            >
              {category}
            </span>
          </div>
          <span
            aria-label="Sauvegarder"
            style={{
              position: "absolute", top: 12, right: 12,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(252,249,241,.95)", display: "flex",
              alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <Icon name="heart" size={15} color={saved ? "var(--accent)" : "var(--ink)"} />
          </span>
        </div>

        <div style={{ padding: compact ? 14 : 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
            <h3 className="sy-h3" style={{ flex: 1 }}>{title}</h3>
            <div
              className="sy-num"
              style={{
                fontFamily: "var(--display)", fontWeight: 700, fontSize: 17,
                fontVariationSettings: "var(--display-var)",
              }}
            >
              €{price}
            </div>
          </div>
          <div className="sy-small sy-muted" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <Icon name="pin" size={12} color="var(--ink-3)" />
            <span>{loc}</span>
            <span>·</span>
            <Stars value={rating} size={11} />
            <span className="sy-mono" style={{ fontSize: 10 }}>{rating} ({reviews})</span>
          </div>

          {!compact && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--line-2)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="sy-mono" style={{ fontSize: 10 }}>Finance</div>
                <div className="sy-mono sy-num" style={{ fontSize: 10, color: "var(--accent-deep)" }}>
                  {Math.round(goal * 100)}%
                </div>
              </div>
              <div className="sy-h4" style={{ marginTop: 2, color: "var(--ink)" }}>{funds}</div>
              <Progress value={goal} style={{ marginTop: 8 }} />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─────── ReviewCard ───────
export function ReviewCard({
  name = "Camille L.",
  date = "avril 2026",
  rating = 5,
  body = "Super journée pour le BBQ de mon entreprise, équipe ultra réactive et on a fait avancer un projet local !",
  tone = "orange" as const,
  initials,
  style,
}: {
  name?: string; date?: string; rating?: number; body?: string;
  tone?: "green" | "orange" | "yellow" | "ink"; initials?: string; style?: CSSProperties;
}) {
  return (
    <div className="sy-card sy-card-lg" style={style}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar initials={initials || name.split(" ").map((p) => p[0]).join("")} tone={tone} />
        <div style={{ flex: 1 }}>
          <div className="sy-h4">{name}</div>
          <div className="sy-mono">{date}</div>
        </div>
        <Stars value={rating} size={12} />
      </div>
      <p className="sy-body" style={{ marginTop: 10, color: "var(--ink)" }}>&ldquo;{body}&rdquo;</p>
    </div>
  );
}

// ─────── BookingCard (sticky right rail on detail page) ───────
export function BookingCard({
  price = 280,
  date = "sam. 14 juin",
  time = "16h00",
  participants = "24 personnes",
  withImpact = true,
  ctaHref = "/reserver/barbecue-convivial-usb-volley",
  style,
}: {
  price?: number;
  date?: string;
  time?: string;
  participants?: string;
  withImpact?: boolean;
  ctaHref?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className="sy-card sy-card-lg"
      style={{ boxShadow: "var(--shadow-md)", border: "1px solid var(--line)", ...style }}
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div
          className="sy-num"
          style={{
            fontFamily: "var(--display)", fontWeight: 700, fontSize: 36, lineHeight: 1,
            fontVariationSettings: "var(--display-var)",
          }}
        >
          €{price}
        </div>
        <div className="sy-mono">/ prestation</div>
      </div>
      <div style={{ marginTop: 14, border: "1.5px solid var(--ink)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)" }}>
          <div style={{ flex: 1, padding: "10px 14px", borderRight: "1px solid var(--line)" }}>
            <div className="sy-mono">Date</div>
            <div className="sy-h4" style={{ marginTop: 2 }}>{date}</div>
          </div>
          <div style={{ flex: 1, padding: "10px 14px" }}>
            <div className="sy-mono">Heure</div>
            <div className="sy-h4" style={{ marginTop: 2 }}>{time}</div>
          </div>
        </div>
        <div style={{ padding: "10px 14px" }}>
          <div className="sy-mono">Participants</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>{participants}</div>
        </div>
      </div>
      <Link href={ctaHref} style={{ textDecoration: "none", display: "block", marginTop: 14 }}>
        <Btn variant="primary" size="lg" block iconRight={<Icon name="arrow" size={16} color="#fff" />}>
          Réserver
        </Btn>
      </Link>
      <div
        className="sy-small sy-muted"
        style={{
          textAlign: "center", marginTop: 10,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="check" size={12} color="var(--success)" /> Annulation gratuite J-7
        </span>
        <span>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="lock" size={12} color="var(--ink-3)" /> Stripe
        </span>
      </div>
      {withImpact && (
        <>
          <div className="sy-divider" style={{ margin: "14px 0" }} />
          <ImpactMini />
        </>
      )}
    </div>
  );
}

// ─────── Logo + Top nav ───────
export function Logo({ size = 22, color = "var(--ink)" }: { size?: number; color?: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 32 32" aria-hidden>
        <circle cx="16" cy="16" r="14" fill="var(--primary)" />
        <circle cx="16" cy="16" r="6" fill="var(--accent)" />
      </svg>
      <span
        style={{
          fontFamily: "var(--display)", fontWeight: 700, fontSize: size,
          letterSpacing: "-0.02em", color, fontVariationSettings: "'wdth' 95",
        }}
      >
        Sociuly
      </span>
    </div>
  );
}

const TOPNAV_ITEMS = [
  { id: "prestations",  label: "Prestations",  href: "/prestations" },
  { id: "associations", label: "Associations", href: "/prestations" },
  { id: "carte",        label: "Carte",        href: "/prestations" },
  { id: "projets",      label: "Projets",      href: "/prestations" },
];

export function TopNav({
  active = "prestations",
  variant = "default",
}: { active?: string; variant?: "default" | "transparent" }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 32px",
        borderBottom: variant === "transparent" ? "none" : "1px solid var(--line)",
        background: variant === "transparent" ? "transparent" : "var(--surface)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}><Logo /></Link>
        <div className="sy-tab-underline sy-tabs" style={{ padding: 0 }}>
          {TOPNAV_ITEMS.map((it) => (
            <Link
              key={it.id}
              href={it.href}
              className={cx("sy-tab", active === it.id && "on")}
              style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
            >
              {it.label}
            </Link>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <Link href="/inscription-club" style={{ textDecoration: "none" }}>
          <Btn variant="ghost" size="sm">Inscrire mon asso</Btn>
        </Link>
        <Link href="/connexion" style={{ textDecoration: "none" }}>
          <Btn variant="dark" size="sm">Se connecter</Btn>
        </Link>
      </div>
    </div>
  );
}

// ─────── Section header ───────
export function SectionHeader({
  title, kicker, action, style,
}: { title: ReactNode; kicker?: string; action?: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        marginBottom: 18, ...style,
      }}
    >
      <div>
        {kicker && <div className="sy-mono">{kicker}</div>}
        <h2 className="sy-h1" style={{ marginTop: kicker ? 4 : 0 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─────── Site footer ───────
const FOOTER_COLS: Array<{ title: string; links: Array<[string, string]> }> = [
  {
    title: "Sociuly",
    links: [
      ["Comment ça marche", "/"],
      ["Marketplace",       "/prestations"],
      ["Projets financés",  "/prestations"],
      ["Notre impact",      "/"],
    ],
  },
  {
    title: "Clubs & assos",
    links: [
      ["Inscrire mon club",  "/inscription-club"],
      ["Console club",       "/club"],
      ["Tarification",       "/"],
      ["Guide démarrage",    "/"],
    ],
  },
  {
    title: "Entreprises",
    links: [
      ["Séminaires d'équipe", "/prestations"],
      ["Mécénat sportif",     "/"],
      ["Devis sur mesure",    "/"],
      ["Études de cas",       "/"],
    ],
  },
  {
    title: "Légal",
    links: [
      ["Conditions générales", "/"],
      ["Confidentialité",      "/"],
      ["Mentions légales",     "/"],
      ["Cookies",              "/"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer
      style={{
        marginTop: 64, background: "var(--ink)", color: "var(--surface)",
        padding: "56px 48px 28px",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(4, 1fr)", gap: 36 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
              <circle cx="16" cy="16" r="14" fill="var(--primary)" />
              <circle cx="16" cy="16" r="6" fill="var(--accent)" />
            </svg>
            <span
              style={{
                fontFamily: "var(--display)", fontWeight: 700, fontSize: 24,
                letterSpacing: "-0.02em", color: "var(--surface)",
                fontVariationSettings: "'wdth' 95",
              }}
            >
              Sociuly
            </span>
          </div>
          <p className="sy-body" style={{ marginTop: 14, maxWidth: 320, color: "var(--ink-2)" }}>
            La plateforme qui finance le sport amateur local, une réservation à la fois.
          </p>
          <div style={{ marginTop: 22 }}>
            <div className="sy-mono" style={{ color: "var(--ink-3)" }}>Restez au courant</div>
            <form
              action="/api/newsletter/subscribe"
              method="post"
              style={{ marginTop: 10, maxWidth: 340 }}
            >
              <div
                style={{
                  display: "flex",
                  background: "var(--surface-2)", borderRadius: "var(--radius-md)",
                  padding: 4, gap: 4,
                }}
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="vous@asso.fr"
                  autoComplete="email"
                  style={{
                    flex: 1, border: "none", background: "transparent", outline: "none",
                    padding: "8px 12px", fontSize: 14, fontFamily: "var(--sans)", color: "var(--ink)",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: "var(--accent)", color: "var(--surface)",
                    border: "none", borderRadius: "var(--radius-sm)",
                    padding: "8px 16px", fontSize: 13, fontWeight: 600,
                    fontFamily: "var(--sans)", cursor: "pointer",
                  }}
                >
                  S&apos;abonner
                </button>
              </div>
            </form>
            <div className="sy-small" style={{ marginTop: 8, color: "var(--ink-3)" }}>
              Une newsletter mensuelle. Pas de spam.
            </div>
          </div>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <div className="sy-mono" style={{ color: "var(--ink-3)" }}>{col.title}</div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  style={{ color: "var(--surface)", textDecoration: "none", fontSize: 14, fontFamily: "var(--sans)" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 56, paddingTop: 22,
          borderTop: "1px solid rgba(252,249,241,.12)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 18, flexWrap: "wrap",
        }}
      >
        <div className="sy-mono" style={{ color: "var(--ink-3)" }}>
          © 2026 Sociuly SAS · Strasbourg · RCS B 924 318 027
        </div>
        <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
          <span className="sy-mono" style={{ color: "var(--ink-3)" }}>Suivez-nous</span>
          {["IG", "LI", "X", "YT"].map((s) => (
            <Link
              key={s}
              href="/"
              style={{
                width: 30, height: 30, borderRadius: "50%",
                border: "1px solid rgba(252,249,241,.18)",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--mono)", fontSize: 10, fontWeight: 600,
                color: "var(--surface)", textDecoration: "none", letterSpacing: "0.04em",
              }}
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
