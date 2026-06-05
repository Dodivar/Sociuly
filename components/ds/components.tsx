"use client";

import type {
  ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import {
  CATEGORIES, CITIES, DEFAULT_FILTERS, buildQuery,
  type Category, type City, type MarketplaceFilters,
} from "@/lib/marketplace/experiences";
import { Icon } from "./icon";

// ─────── Button ───────
type BtnVariant = "primary" | "dark" | "brand" | "outline" | "soft" | "ghost";
type BtnSize = "sm" | "md" | "lg" | "xl";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
  block?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
};

export function Btn({
  variant = "primary", size, block, icon, iconRight, children, className, ...rest
}: BtnProps) {
  const cls = cx(
    "sy-btn",
    variant === "primary" && "sy-btn-primary",
    variant === "dark" && "sy-btn-dark",
    variant === "brand" && "sy-btn-brand",
    variant === "outline" && "sy-btn-outline",
    variant === "soft" && "sy-btn-soft",
    variant === "ghost" && "sy-btn-ghost",
    size === "sm" && "sy-btn-sm",
    size === "lg" && "sy-btn-lg",
    size === "xl" && "sy-btn-xl",
    block && "sy-btn-block",
    className,
  );
  return (
    <button type="button" className={cls} {...rest}>
      {icon && <span style={{ display: "inline-flex" }}>{icon}</span>}
      {children}
      {iconRight && <span style={{ display: "inline-flex" }}>{iconRight}</span>}
    </button>
  );
}

type IconBtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md" };
export function IconBtn({ size = "md", children, className, ...rest }: IconBtnProps) {
  const cls = cx(
    "sy-btn", "sy-btn-soft",
    size === "sm" ? "sy-btn-icon-sm" : "sy-btn-icon",
    className,
  );
  return <button type="button" className={cls} {...rest}>{children}</button>;
}

// ─────── Chip ───────
type ChipProps = {
  variant?: "outline" | "solid" | "accent" | "primary" | "highlight";
  size?: "sm" | "lg";
  children?: ReactNode;
  style?: CSSProperties;
  leadingDot?: boolean;
  onClick?: () => void;
};
export function Chip({ variant, size, children, style, leadingDot, onClick }: ChipProps) {
  const cls = cx(
    "sy-chip",
    variant === "outline" && "sy-chip-outline",
    variant === "solid" && "sy-chip-solid",
    variant === "accent" && "sy-chip-accent",
    variant === "primary" && "sy-chip-primary",
    variant === "highlight" && "sy-chip-highlight",
    size === "sm" && "sy-chip-sm",
    size === "lg" && "sy-chip-lg",
  );
  const interactive = !!onClick;
  return (
    <span
      className={cls}
      style={style}
      onClick={onClick}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
    >
      {leadingDot && (
        <span className="sy-dot" style={{ background: "currentColor", width: 6, height: 6 }} />
      )}
      {children}
    </span>
  );
}

// ─────── Card ───────
type CardProps = {
  size?: "lg" | "xl";
  variant?: "elevated" | "flat" | "ink" | "primary" | "accent";
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
};
export function Card({ size, variant, children, style, className, onClick }: CardProps) {
  const cls = cx(
    "sy-card",
    size === "lg" && "sy-card-lg",
    size === "xl" && "sy-card-xl",
    variant === "elevated" && "sy-card-elevated",
    variant === "flat" && "sy-card-flat",
    variant === "ink" && "sy-card-ink",
    variant === "primary" && "sy-card-primary",
    variant === "accent" && "sy-card-accent",
    className,
  );
  return <div className={cls} style={style} {...(onClick ? { onClick } : {})}>{children}</div>;
}

// ─────── Avatar ───────
type AvatarTone = "green" | "orange" | "yellow" | "ink";
type AvatarProps = {
  initials?: string;
  size?: "md" | "lg" | "xl";
  tone?: AvatarTone;
  style?: CSSProperties;
  src?: string;
};
const AVATAR_COLORS: Record<AvatarTone, { bg: string; fg: string }> = {
  green:  { bg: "var(--primary-soft)",   fg: "var(--primary-deep)" },
  orange: { bg: "var(--accent-soft)",    fg: "var(--accent-deep)" },
  yellow: { bg: "var(--highlight-soft)", fg: "#6e5111" },
  ink:    { bg: "var(--ink)",            fg: "var(--surface)" },
};
export function Avatar({ initials = "·", size = "md", tone, style, src }: AvatarProps) {
  const cls = cx(
    "sy-avatar",
    size === "lg" && "sy-avatar-lg",
    size === "xl" && "sy-avatar-xl",
  );
  const c = tone ? AVATAR_COLORS[tone] : { bg: undefined, fg: undefined };
  return (
    <div className={cls} style={{ background: c.bg, color: c.fg, ...style }}>
      {src
        ? <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        : initials}
    </div>
  );
}

// ─────── Progress ───────
type ProgressProps = {
  value?: number; // 0..1
  variant?: "primary" | "highlight";
  size?: "tall" | "xl";
  style?: CSSProperties;
};
export function Progress({ value = 0.5, variant, size, style }: ProgressProps) {
  const cls = cx(
    "sy-progress",
    size === "tall" && "tall",
    size === "xl" && "xl",
    variant === "primary" && "sy-progress-primary",
    variant === "highlight" && "sy-progress-highlight",
  );
  return (
    <div className={cls} style={style}>
      <i style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

// ─────── Tabs ───────
type TabItem = string | { id: string; label: string };
type TabsProps = {
  items: TabItem[];
  active?: string;
  onChange?: (id: string) => void;
  variant?: "pill" | "underline";
};
export function Tabs({ items, active, onChange, variant = "pill" }: TabsProps) {
  const cls = cx("sy-tabs", variant === "underline" && "sy-tab-underline");
  return (
    <div className={cls}>
      {items.map((t) => {
        const id = typeof t === "string" ? t : t.id;
        const label = typeof t === "string" ? t : t.label;
        const tabCls = cx("sy-tab", active === id && "on");
        return onChange ? (
          <button key={id} type="button" className={tabCls} onClick={() => onChange(id)}>
            {label}
          </button>
        ) : (
          <span key={id} className={tabCls}>{label}</span>
        );
      })}
    </div>
  );
}

// ─────── Stars ───────
export function Stars({ value = 5, size = 13, mono }: { value?: number; size?: number; mono?: boolean }) {
  const full = Math.round(value);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: size, color: "var(--ink)" }}>
      <span style={{ letterSpacing: "-1px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < full ? "var(--accent)" : "var(--line-2)" }}>★</span>
        ))}
      </span>
      {mono && <span className="sy-mono">{value.toFixed(1)}</span>}
    </span>
  );
}

// ─────── Field / Input ───────
export function Field({ label, hint, error, children, style }: {
  label?: string; hint?: string; error?: string; children: ReactNode; style?: CSSProperties;
}) {
  return (
    <div className="sy-field" style={style}>
      {label && <label className="sy-label">{label}</label>}
      {children}
      {error
        ? <div className="sy-small" role="alert" style={{ marginTop: 6, color: "var(--danger)" }}>{error}</div>
        : hint && <div className="sy-small sy-muted" style={{ marginTop: 6 }}>{hint}</div>
      }
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode };
export function Input({ icon, ...rest }: InputProps) {
  if (icon) {
    return (
      <div className="sy-input" style={{ padding: "0 14px" }}>
        <span style={{ color: "var(--ink-3)", marginRight: 8, display: "inline-flex" }}>{icon}</span>
        <input
          {...rest}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
          }}
        />
      </div>
    );
  }
  return <input className="sy-input" {...rest} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="sy-input sy-textarea" {...props} />;
}

// ─────── Sticky search bar (Airbnb-style "Quoi / Où / Quand / Catégorie") ───────
// Chaque champ est câblé sur un filtre marketplace réel (q, ville, date, cat).
// Soumission → /experiences sérialisé via buildQuery (même contrat d'URL que la
// page catalogue, cf. lib/marketplace/experiences → parseFilters).
const SB_INPUT_STYLE: CSSProperties = {
  border: "none", outline: "none", background: "transparent",
  fontFamily: "inherit", fontSize: 14, fontWeight: 500, marginTop: 2,
  color: "var(--ink)", width: "100%", padding: 0,
};

export function SearchBar({ compact, style }: { compact?: boolean; style?: CSSProperties }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [city, setCity] = useState<City | "">("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState<Category | "">("");

  // Construit l'URL du catalogue à partir des seuls filtres choisis (les valeurs
  // par défaut sont omises par buildQuery → URL propre, partageable).
  function pushTo(next: Partial<MarketplaceFilters>) {
    const filters: MarketplaceFilters = { ...DEFAULT_FILTERS, ...next };
    const qs = buildQuery(filters);
    router.push(qs ? `/experiences?${qs}` : "/experiences");
  }

  if (compact) {
    return (
      <form
        className="sy-search"
        style={{ height: 44, padding: "0 6px 0 18px", ...style }}
        role="search"
        onSubmit={(e) => { e.preventDefault(); pushTo({ q: q.trim() }); }}
      >
        <Icon name="search" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cohésion · Strasbourg · journée"
          aria-label="Rechercher une expérience"
        />
        <Btn type="submit" variant="primary" size="sm" style={{ borderRadius: 999 }}>Rechercher</Btn>
      </form>
    );
  }
  return (
    <form
      className="sy-searchbar-full sy-card sy-card-elevated"
      style={style}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        pushTo({
          q: q.trim(),
          city: city || null,
          date: date || null,
          category: category || null,
        });
      }}
    >
      <label className="sb-section" style={{ cursor: "text" }}>
        <span className="sy-mono-strong" style={{ fontSize: 10.5 }}>Quoi</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Toutes expériences"
          aria-label="Rechercher une expérience"
          style={SB_INPUT_STYLE}
        />
      </label>
      <div className="sy-divider-vert" />
      <label className="sb-section" style={{ cursor: "pointer" }}>
        <span className="sy-mono-strong" style={{ fontSize: 10.5 }}>Où</span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value as City | "")}
          aria-label="Choisir une ville"
          style={{ ...SB_INPUT_STYLE, cursor: "pointer" }}
        >
          <option value="">Toutes les villes</option>
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </label>
      <div className="sy-divider-vert" />
      <label className="sb-section" style={{ cursor: "text" }}>
        <span className="sy-mono-strong" style={{ fontSize: 10.5 }}>Quand</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Disponible à partir du"
          style={{ ...SB_INPUT_STYLE, cursor: "text" }}
        />
      </label>
      <div className="sy-divider-vert" />
      <label className="sb-section sb-section-cause" style={{ cursor: "pointer" }}>
        <span className="sy-mono-strong" style={{ fontSize: 10.5 }}>Catégorie</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category | "")}
          aria-label="Choisir une catégorie d'expérience"
          style={{ ...SB_INPUT_STYLE, cursor: "pointer" }}
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </label>
      <div className="sb-cta">
        <Btn type="submit" variant="primary" size="lg" style={{ borderRadius: 999, padding: "0 24px" }}>
          <Icon name="search" /> Rechercher
        </Btn>
      </div>
    </form>
  );
}
