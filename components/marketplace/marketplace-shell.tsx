"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Btn, Chip, Progress, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { PrestationCard } from "@/components/ds/patterns";
import { MarketMap } from "@/components/ds/impact";

const CATEGORIES = ["Toutes", "BBQ", "Animation", "Buvette", "Événement", "Initiation", "Tournoi", "Stage"] as const;
const SORTS = ["Pertinence", "Prix ↑", "Note ★", "Distance"] as const;

type Category = (typeof CATEGORIES)[number];
type Sort = (typeof SORTS)[number];
type View = "list" | "map";

type PrestationItem = {
  title?: string;
  price?: number;
  hue?: "green" | "orange" | "yellow" | "teal" | "rust" | "sand";
  goal?: number;
  funds?: string;
  rating?: number;
  reviews?: number;
  href?: string;
};

type FeaturedProject = {
  title: string;
  value: number;
  caption: string;
  hue: keyof typeof PROJECT_HUES;
};

const PROJECT_HUES = {
  orange: "#c0451f",
  teal: "#1f5b58",
  green: "#1f4b3f",
  yellow: "#b8861a",
} as const;

const FEATURED_PROJECTS: FeaturedProject[] = [
  { title: "Tournoi Espagne U17", value: 0.92, caption: "92% · 3 résa restantes", hue: "orange" },
  { title: "Vestiaires neufs", value: 0.32, caption: "32%", hue: "teal" },
  { title: "Maillots saison", value: 0.7, caption: "70%", hue: "green" },
  { title: "Mini-bus club", value: 0.55, caption: "55%", hue: "yellow" },
];

const PRESTATIONS: PrestationItem[] = [
  { hue: "green" },
  {
    title: "Olympiades en entreprise", price: 720, hue: "orange",
    goal: 0.78, funds: "Mini-bus du club", rating: 4.9, reviews: 62,
    href: "/prestations/olympiades-en-entreprise",
  },
  {
    title: "Anniversaire sportif", price: 180, hue: "yellow",
    goal: 0.25, funds: "Maillots saison", rating: 4.6, reviews: 28,
    href: "/prestations/anniversaire-sportif",
  },
  {
    title: "Buvette événement", price: 350, hue: "teal",
    goal: 0.55, funds: "Vestiaires neufs", rating: 4.7, reviews: 41,
    href: "/prestations/buvette-evenement",
  },
  {
    title: "Initiation rugby U10", price: 420, hue: "rust",
    goal: 0.85, funds: "Stage été", rating: 5.0, reviews: 19,
    href: "/prestations/initiation-rugby-u10",
  },
  {
    title: "Tournoi pétanque inter-entreprises", price: 220, hue: "sand",
    goal: 0.15, funds: "Boules de compétition", rating: 4.5, reviews: 12,
    href: "/prestations/tournoi-petanque-inter-entreprises",
  },
];

export function MarketplaceShell({ view: initialView }: { view: View }) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setViewState] = useState<View>(initialView);
  const [category, setCategory] = useState<Category>("Toutes");
  const [sort, setSort] = useState<Sort>("Pertinence");

  // Keep local view in sync when the URL changes (shared link, back/forward).
  useEffect(() => {
    setViewState(initialView);
  }, [initialView]);

  function setView(next: View) {
    setViewState(next);
    router.push(next === "map" ? `${pathname}?view=map` : pathname, { scroll: false });
  }

  return (
    <>
      {/* Filter chip bar + view toggle */}
      <div
        style={{
          padding: "14px 32px",
          borderBottom: "1px solid var(--line)",
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Btn variant="outline" size="sm" icon={<Icon name="filter" size={13} />}>
          Filtres · 0
        </Btn>
        <div className="sy-divider-vert" style={{ height: 24, margin: "0 6px" }} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            variant={c === category ? "solid" : "outline"}
            onClick={() => setCategory(c)}
          >
            {c}
          </Chip>
        ))}
        <div style={{ flex: 1 }} />
        <Tabs
          variant="pill"
          items={[...SORTS]}
          active={sort}
          onChange={(next) => setSort(next as Sort)}
        />
        <div className="sy-divider-vert" style={{ height: 24, margin: "0 6px" }} />
        <ViewToggle value={view} onChange={setView} />
      </div>

      {/* Content area: list grid OR split (list + map) */}
      {view === "list" ? (
        <section style={{ padding: "20px 32px" }}>
          <FeaturedProjects />
          <ListHeader />
          <div className="prestation-grid-wide">
            {PRESTATIONS.map((p, i) => (
              <PrestationCard key={i} {...p} />
            ))}
          </div>
        </section>
      ) : (
        <div className="marketplace-split">
          <div style={{ padding: "20px 32px", overflow: "auto" }}>
            <ListHeader />
            <div className="prestation-grid-split">
              {PRESTATIONS.map((p, i) => (
                <PrestationCard key={i} {...p} />
              ))}
            </div>
          </div>
          <div className="marketplace-map">
            <MarketMap />
          </div>
        </div>
      )}

      <style>{`
        .marketplace-split {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          min-height: 600px;
        }
        .marketplace-map { position: relative; min-height: 600px; }
        .featured-row {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          padding-bottom: 4px;
          scroll-snap-type: x proximity;
        }
        .featured-row > * { scroll-snap-align: start; }
        .prestation-grid-wide {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .prestation-grid-split {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 1280px) {
          .prestation-grid-wide { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 1024px) {
          .marketplace-split { grid-template-columns: 1fr; }
          .marketplace-map { height: 420px; min-height: 420px; }
        }
        @media (max-width: 768px) {
          .prestation-grid-wide { grid-template-columns: 1fr; }
          .prestation-grid-split { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}

function FeaturedProjects() {
  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          gap: 8, flexWrap: "wrap", marginBottom: 14,
        }}
      >
        <h2 className="sy-h2" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Icon name="bolt" size={18} color="var(--accent)" />
          Projets bientôt financés — donnez le coup de pouce final
        </h2>
        <span className="sy-mono">scroll horizontal →</span>
      </div>
      <div
        className="featured-row"
        role="group"
        aria-label="Projets bientôt financés"
        tabIndex={0}
      >
        {FEATURED_PROJECTS.map((p, i) => (
          <ProjectMiniCard key={p.title} {...p} highlight={i === 0} />
        ))}
      </div>
    </section>
  );
}

function ProjectMiniCard({
  title, value, caption, hue, highlight,
}: FeaturedProject & { highlight?: boolean }) {
  const c = PROJECT_HUES[hue];
  return (
    <article
      style={{
        flex: "1 0 220px", minWidth: 220,
        border: highlight ? "1.5px solid var(--accent)" : "1px solid var(--line)",
        background: highlight ? "var(--accent-soft)" : "var(--surface)",
        borderRadius: "var(--radius-lg)", padding: 12,
      }}
    >
      <div
        className="sy-img"
        style={{
          height: 80, borderRadius: "var(--radius-md)", position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, ${c} 0%, ${c}cc 100%)`,
        }}
      >
        <svg
          viewBox="0 0 200 120"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.22 }}
        >
          <path d="M0 100 Q 40 60 80 80 T 200 70 L 200 120 L 0 120 Z" fill="#fff" />
          <circle cx="160" cy="30" r="14" fill="#fff" opacity="0.6" />
        </svg>
      </div>
      <div className="sy-h4" style={{ marginTop: 10 }}>{title}</div>
      <Progress value={value} style={{ marginTop: 8 }} />
      <div className="sy-mono" style={{ marginTop: 6, color: highlight ? "var(--accent-deep)" : "var(--ink-2)" }}>
        {caption}
      </div>
    </article>
  );
}

function ListHeader() {
  return (
    <div
      style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        marginBottom: 16, flexWrap: "wrap", gap: 8,
      }}
    >
      <h2 className="sy-h1" style={{ fontSize: 26 }}>128 prestations près de Strasbourg</h2>
      <div className="sy-mono">★ 4.7 moyenne · €184 reversés cette semaine</div>
    </div>
  );
}

function ViewToggle({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Bascule vue liste ou carte"
      style={{
        display: "inline-flex",
        background: "var(--surface-2)",
        borderRadius: 999,
        padding: 3,
        gap: 2,
      }}
    >
      <ToggleBtn
        active={value === "list"}
        onClick={() => onChange("list")}
        icon={<Icon name="grid" size={13} />}
        label="Liste"
      />
      <ToggleBtn
        active={value === "map"}
        onClick={() => onChange("map")}
        icon={<Icon name="map" size={13} />}
        label="Carte"
      />
    </div>
  );
}

function ToggleBtn({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 999, border: "none", cursor: "pointer",
        fontFamily: "var(--sans)", fontSize: 13, fontWeight: 600,
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--ink)" : "var(--ink-2)",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        transition: "background 120ms ease, color 120ms ease",
      }}
    >
      {icon}
      {label}
    </button>
  );
}
