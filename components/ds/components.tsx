"use client";

import type {
  ButtonHTMLAttributes, CSSProperties, InputHTMLAttributes, KeyboardEvent,
  ReactNode, RefObject, TextareaHTMLAttributes,
} from "react";
import { useEffect, useRef, useState } from "react";
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
      style={interactive ? { cursor: "pointer", ...style } : style}
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

// ─────── Select & DateField « maison » (desktop) ───────
// Sur tactile (pointer: coarse) on conserve les contrôles natifs de l'OS — très
// bons sur iOS/Android. Sur desktop (pointer: fine) on remplace les <select> et
// <input type=date> non stylables par des popovers du DS, accessibles au clavier.
// Progressive enhancement : rendu natif en SSR/1er rendu → bascule custom au mount.

// Détecte un pointeur fin + survol (≈ desktop souris/trackpad).
function usePointerFine() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

// Ferme un popover au clic extérieur et à la touche Échap.
function useDismiss(open: boolean, close: () => void, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close, ref]);
}

export type SelectOption = { value: string; label: string };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<SelectOption>;
  /** Libellé de l'option vide (valeur ""), affiché comme placeholder. */
  placeholder?: string;
  ariaLabel?: string;
  /** Variante intégrée à la pilule SearchBar (sans bordure ni fond). */
  inline?: boolean;
  /** Icône affichée à gauche (ex. calendrier pour un créneau). */
  leadingIcon?: ReactNode;
  /** Autorise l'option vide « placeholder » en tête de liste (défaut true). */
  allowEmpty?: boolean;
};

export function Select({
  value, onChange, options, placeholder = "Sélectionner", ariaLabel,
  inline = false, leadingIcon, allowEmpty = true,
}: SelectProps) {
  const fine = usePointerFine();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  useDismiss(open, () => setOpen(false), rootRef);
  useEffect(() => { if (open) listRef.current?.focus(); }, [open]);

  // Mobile / SSR / sans-JS : <select> natif (éventuellement enveloppé d'une icône).
  if (!fine) {
    const nativeSelect = (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={inline || leadingIcon ? undefined : "sy-input"}
        style={
          inline
            ? { ...SB_INPUT_STYLE, cursor: "pointer" }
            : leadingIcon
              ? {
                  flex: 1, border: "none", outline: "none", background: "transparent",
                  fontFamily: "inherit", fontSize: 14, color: "var(--ink)",
                  appearance: "none", cursor: "pointer", padding: "11px 0",
                }
              : { cursor: "pointer" }
        }
      >
        {allowEmpty && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
    if (leadingIcon) {
      return (
        <div className="sy-input" style={{ padding: "0 12px", display: "flex", alignItems: "center", gap: 8 }}>
          {leadingIcon}
          {nativeSelect}
          <Icon name="chevron" size={14} color="var(--ink-3)" />
        </div>
      );
    }
    return nativeSelect;
  }

  // L'option vide n'est ajoutée que si allowEmpty (permet de « tout désélectionner »).
  const items: SelectOption[] = allowEmpty ? [{ value: "", label: placeholder }, ...options] : [...options];
  const selected = options.find((o) => o.value === value);

  const openMenu = () => {
    setActive(Math.max(0, items.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const commit = (v: string) => {
    onChange(v);
    setOpen(false);
    triggerRef.current?.focus();
  };
  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  };
  const onListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(items.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); commit(items[active].value); }
    else if (e.key === "Tab") { setOpen(false); }
  };

  return (
    <div ref={rootRef} className="sy-select">
      <button
        ref={triggerRef}
        type="button"
        className={cx("sy-select-trigger", inline && "sy-select-trigger-inline")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKey}
      >
        {leadingIcon && <span className="sy-select-lead">{leadingIcon}</span>}
        <span className={cx("sy-select-value", !selected && "sy-select-placeholder")}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon name="chevron" size={16} style={{ flexShrink: 0, color: "var(--ink-3)" }} />
      </button>
      {open && (
        <ul
          ref={listRef}
          className="sy-select-menu"
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          onKeyDown={onListKey}
        >
          {items.map((o, i) => (
            <li
              key={o.value || "_all"}
              role="option"
              aria-selected={o.value === value}
              className={cx("sy-select-option", i === active && "is-active", o.value === value && "is-selected")}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); commit(o.value); }}
            >
              <span>{o.label}</span>
              {o.value === value && <Icon name="check" size={15} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────── DateField (calendrier custom desktop) ───────
const CAL_DOW = ["L", "M", "M", "J", "V", "S", "D"]; // semaine lundi → dimanche
const CAL_MONTH = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
const CAL_FULL = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric" });

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function fromISODate(s: string): Date | null {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type DateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  inline?: boolean;
  /** Date min sélectionnable (ISO yyyy-mm-dd). Les jours antérieurs sont désactivés. */
  min?: string;
  /** Libellé affiché quand aucune date n'est choisie. */
  placeholder?: string;
};

export function DateField({
  value, onChange, ariaLabel, inline = false, min, placeholder = "Toutes les dates",
}: DateFieldProps) {
  const fine = usePointerFine();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const selected = fromISODate(value);
  const [view, setView] = useState<Date>(() => selected ?? new Date());
  useDismiss(open, () => setOpen(false), rootRef);

  if (!fine) {
    return (
      <input
        type="date"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className={inline ? undefined : "sy-input"}
        style={inline ? { ...SB_INPUT_STYLE, cursor: "text" } : undefined}
      />
    );
  }

  const today = new Date();
  const minDate = fromISODate(min ?? "");
  const year = view.getFullYear();
  const month = view.getMonth();
  // getDay() : 0 = dimanche → on décale pour une semaine commençant le lundi.
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const isDisabled = (d: Date) =>
    minDate ? d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;
  const pick = (d: Date) => {
    if (isDisabled(d)) return;
    onChange(toISODate(d));
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div ref={rootRef} className="sy-datefield">
      <button
        ref={triggerRef}
        type="button"
        className={cx("sy-select-trigger", inline && "sy-select-trigger-inline")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => { if (selected) setView(selected); setOpen((o) => !o); }}
      >
        <span className={cx("sy-select-value", !selected && "sy-select-placeholder")}>
          {selected ? CAL_FULL.format(selected) : placeholder}
        </span>
        <Icon name="calendar" size={16} style={{ flexShrink: 0, color: "var(--ink-3)" }} />
      </button>
      {open && (
        <div className="sy-cal" role="dialog" aria-label={ariaLabel} aria-modal="false">
          <div className="sy-cal-head">
            <button
              type="button" className="sy-cal-nav" aria-label="Mois précédent"
              onClick={() => setView(new Date(year, month - 1, 1))}
            >
              <Icon name="arrowLeft" size={16} />
            </button>
            <span className="sy-cal-title">{CAL_MONTH.format(view)}</span>
            <button
              type="button" className="sy-cal-nav" aria-label="Mois suivant"
              onClick={() => setView(new Date(year, month + 1, 1))}
            >
              <Icon name="arrow" size={16} />
            </button>
          </div>
          <div className="sy-cal-grid sy-cal-dow">
            {CAL_DOW.map((d, i) => <span key={i} className="sy-cal-dow-cell">{d}</span>)}
          </div>
          <div className="sy-cal-grid">
            {cells.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  className={cx(
                    "sy-cal-day",
                    selected && isSameDay(d, selected) && "is-selected",
                    isSameDay(d, today) && "is-today",
                  )}
                  disabled={isDisabled(d)}
                  aria-pressed={selected ? isSameDay(d, selected) : false}
                  aria-label={CAL_FULL.format(d)}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              ) : <span key={i} aria-hidden="true" />,
            )}
          </div>
          {value && (
            <button
              type="button" className="sy-cal-clear"
              onClick={() => { onChange(""); setOpen(false); triggerRef.current?.focus(); }}
            >
              Effacer la date
            </button>
          )}
        </div>
      )}
    </div>
  );
}

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
      <div className="sb-section">
        <span className="sy-mono-strong" style={{ fontSize: 10.5 }}>Où</span>
        <Select
          inline
          value={city}
          onChange={(v) => setCity(v as City | "")}
          options={CITIES.map((c) => ({ value: c.id, label: c.label }))}
          placeholder="Toutes les villes"
          ariaLabel="Choisir une ville"
        />
      </div>
      <div className="sy-divider-vert" />
      <div className="sb-section">
        <span className="sy-mono-strong" style={{ fontSize: 10.5 }}>Quand</span>
        <DateField
          inline
          value={date}
          onChange={setDate}
          min={toISODate(new Date())}
          ariaLabel="Disponible à partir du"
        />
      </div>
      <div className="sy-divider-vert" />
      <div className="sb-section sb-section-cause">
        <span className="sy-mono-strong" style={{ fontSize: 10.5 }}>Catégorie</span>
        <Select
          inline
          value={category}
          onChange={(v) => setCategory(v as Category | "")}
          options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
          placeholder="Toutes les catégories"
          ariaLabel="Choisir une catégorie d'expérience"
        />
      </div>
      <div className="sb-cta">
        <Btn type="submit" variant="primary" size="lg" style={{ borderRadius: 999, padding: "0 24px" }}>
          <Icon name="search" /> Rechercher
        </Btn>
      </div>
    </form>
  );
}
