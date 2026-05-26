// Sociuly — core React components
// Lightweight wrappers around the CSS classes in ds-tokens.jsx.

function cx(...args) {
  return args.filter(Boolean).join(' ');
}

// ─────── Button ───────
function Btn({
  variant = 'primary', size, block, icon, iconRight, children, style, className, ...rest
}) {
  const cls = cx(
    'sy-btn',
    variant === 'primary' && 'sy-btn-primary',
    variant === 'dark' && 'sy-btn-dark',
    variant === 'brand' && 'sy-btn-brand',
    variant === 'outline' && 'sy-btn-outline',
    variant === 'soft' && 'sy-btn-soft',
    variant === 'ghost' && 'sy-btn-ghost',
    size === 'sm' && 'sy-btn-sm',
    size === 'lg' && 'sy-btn-lg',
    size === 'xl' && 'sy-btn-xl',
    block && 'sy-btn-block',
    className,
  );
  return (
    <button type="button" className={cls} style={style} {...rest}>
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
      {iconRight && <span style={{ display: 'inline-flex' }}>{iconRight}</span>}
    </button>
  );
}

function IconBtn({ size = 'md', children, style, className, ...rest }) {
  const cls = cx(
    'sy-btn', 'sy-btn-soft',
    size === 'sm' ? 'sy-btn-icon-sm' : 'sy-btn-icon',
    className,
  );
  return <button type="button" className={cls} style={style} {...rest}>{children}</button>;
}

// ─────── Chip ───────
function Chip({ variant, size, children, style, leadingDot, onClick }) {
  const cls = cx(
    'sy-chip',
    variant === 'outline' && 'sy-chip-outline',
    variant === 'solid' && 'sy-chip-solid',
    variant === 'accent' && 'sy-chip-accent',
    variant === 'primary' && 'sy-chip-primary',
    variant === 'highlight' && 'sy-chip-highlight',
    size === 'sm' && 'sy-chip-sm',
    size === 'lg' && 'sy-chip-lg',
  );
  return (
    <span className={cls} style={style} onClick={onClick}>
      {leadingDot && <span className="sy-dot" style={{ background: 'currentColor', width: 6, height: 6 }} />}
      {children}
    </span>
  );
}

// ─────── Card ───────
function Card({ size, variant, children, style, className, onClick }) {
  const cls = cx(
    'sy-card',
    size === 'lg' && 'sy-card-lg',
    size === 'xl' && 'sy-card-xl',
    variant === 'elevated' && 'sy-card-elevated',
    variant === 'flat' && 'sy-card-flat',
    variant === 'ink' && 'sy-card-ink',
    variant === 'primary' && 'sy-card-primary',
    variant === 'accent' && 'sy-card-accent',
    className,
  );
  return <div className={cls} style={style} onClick={onClick}>{children}</div>;
}

// ─────── Image placeholder ───────
function Img({ label = 'image', h, w, r, style, children, dark, kind }) {
  // kind: 'face', 'logo', 'product', 'scene' — gives nicer placeholder context
  const radius = r ?? 'var(--radius-md)';
  return (
    <div className="sy-img" style={{
      height: h, width: w, borderRadius: radius,
      ...(dark ? { background: 'var(--ink)', color: 'var(--ink-3)' } : {}),
      ...style,
    }}>
      {!children && <ImgGlyph kind={kind} />}
      {!children && <span className="sy-img-label">{label}</span>}
      {children}
    </div>
  );
}

function ImgGlyph({ kind }) {
  const fill = 'rgba(20,36,31,.08)';
  if (kind === 'face') {
    return (
      <svg viewBox="0 0 60 60" style={{ position: 'absolute', width: '50%', height: '50%', maxWidth: 100, maxHeight: 100, opacity: .5 }}>
        <circle cx="30" cy="22" r="11" fill={fill} />
        <path d="M5 60 C 5 40, 55 40, 55 60 Z" fill={fill} />
      </svg>
    );
  }
  if (kind === 'logo') {
    return (
      <svg viewBox="0 0 60 60" style={{ position: 'absolute', width: '40%', height: '40%', opacity: .35 }}>
        <rect x="6" y="6" width="48" height="48" rx="12" fill="none" stroke={fill} strokeWidth="2.5" />
        <circle cx="30" cy="30" r="10" fill={fill} />
      </svg>
    );
  }
  if (kind === 'scene') {
    return (
      <svg viewBox="0 0 100 60" style={{ position: 'absolute', width: '60%', height: '60%', opacity: .4 }}>
        <path d="M0 50 L 25 30 L 45 42 L 70 22 L 100 38 L 100 60 L 0 60 Z" fill={fill} />
        <circle cx="75" cy="14" r="6" fill={fill} />
      </svg>
    );
  }
  return null;
}

// ─────── Avatar ───────
function Avatar({ initials = '·', size = 'md', tone, style, src }) {
  const cls = cx(
    'sy-avatar',
    size === 'lg' && 'sy-avatar-lg',
    size === 'xl' && 'sy-avatar-xl',
  );
  const colors = {
    green: { bg: 'var(--primary-soft)', fg: 'var(--primary-deep)' },
    orange: { bg: 'var(--accent-soft)', fg: 'var(--accent-deep)' },
    yellow: { bg: 'var(--highlight-soft)', fg: '#6e5111' },
    ink: { bg: 'var(--ink)', fg: 'var(--surface)' },
  };
  const c = colors[tone] || {};
  return (
    <div className={cls} style={{ background: c.bg, color: c.fg, ...style }}>
      {src ? <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : initials}
    </div>
  );
}

function AvatarStack({ items, size = 'md', extra }) {
  return (
    <div className="sy-avatar-stack">
      {items.map((it, i) => (
        <Avatar key={i} initials={it.initials} tone={it.tone} size={size} src={it.src} />
      ))}
      {extra && (
        <div className={cx('sy-avatar', size === 'lg' && 'sy-avatar-lg', size === 'xl' && 'sy-avatar-xl')}
          style={{ background: 'var(--surface-2)', fontWeight: 600 }}>+{extra}</div>
      )}
    </div>
  );
}

// ─────── Progress ───────
function Progress({ value = 0.5, variant, size, style, showLabel }) {
  const cls = cx(
    'sy-progress',
    size === 'tall' && 'tall',
    size === 'xl' && 'xl',
    variant === 'primary' && 'sy-progress-primary',
    variant === 'highlight' && 'sy-progress-highlight',
  );
  return (
    <div className={cls} style={style}>
      <i style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

// ─────── Tabs ───────
function Tabs({ items, active, onChange, variant = 'pill' }) {
  const cls = cx('sy-tabs', variant === 'underline' && 'sy-tab-underline');
  return (
    <div className={cls}>
      {items.map((t) => {
        const id = typeof t === 'string' ? t : t.id;
        const label = typeof t === 'string' ? t : t.label;
        return (
          <span key={id} className={cx('sy-tab', active === id && 'on')}
            onClick={() => onChange && onChange(id)}>
            {label}
          </span>
        );
      })}
    </div>
  );
}

// ─────── Stars ───────
function Stars({ value = 5, size = 13, mono }) {
  const full = Math.round(value);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: size, color: 'var(--ink)' }}>
      <span style={{ letterSpacing: '-1px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < full ? 'var(--accent)' : 'var(--line-2)' }}>★</span>
        ))}
      </span>
      {mono && <span className="sy-mono">{value.toFixed(1)}</span>}
    </span>
  );
}

// ─────── Field / Input ───────
function Field({ label, hint, children, style }) {
  return (
    <div className="sy-field" style={style}>
      {label && <label className="sy-label">{label}</label>}
      {children}
      {hint && <div className="sy-small sy-muted" style={{ marginTop: 6 }}>{hint}</div>}
    </div>
  );
}

function Input({ icon, ...rest }) {
  if (icon) {
    return (
      <div className="sy-input" style={{ padding: '0 14px' }}>
        <span style={{ color: 'var(--ink-3)', marginRight: 8, display: 'inline-flex' }}>{icon}</span>
        <input {...rest} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: 'inherit', fontSize: 14, color: 'var(--ink)' }} />
      </div>
    );
  }
  return <input className="sy-input" {...rest} />;
}

function Textarea(props) {
  return <textarea className="sy-input sy-textarea" {...props} />;
}

// ─────── Sticky search bar (Airbnb-style "What/Where/When") ───────
function SearchBar({ compact, style }) {
  if (compact) {
    return (
      <div className="sy-search" style={{ height: 44, padding: '0 6px 0 18px', ...style }}>
        <Icon name="search" />
        <input placeholder="BBQ · Rennes · ce week-end" />
        <Btn variant="primary" size="sm" style={{ borderRadius: 999 }}>Rechercher</Btn>
      </div>
    );
  }
  return (
    <div className="sy-card sy-card-elevated" style={{
      display: 'flex', alignItems: 'stretch', borderRadius: 999, padding: 6,
      background: 'var(--surface)', boxShadow: 'var(--shadow-md)', ...style,
    }}>
      <div style={{ flex: 1.2, padding: '8px 22px', cursor: 'pointer' }}>
        <div className="sy-mono-strong" style={{ fontSize: 10.5 }}>Quoi</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>Toutes prestations</div>
      </div>
      <div className="sy-divider-vert" />
      <div style={{ flex: 1.2, padding: '8px 22px', cursor: 'pointer' }}>
        <div className="sy-mono-strong" style={{ fontSize: 10.5 }}>Où</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>Rennes · 10 km</div>
      </div>
      <div className="sy-divider-vert" />
      <div style={{ flex: 1.2, padding: '8px 22px', cursor: 'pointer' }}>
        <div className="sy-mono-strong" style={{ fontSize: 10.5 }}>Quand</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>Ce week-end</div>
      </div>
      <div className="sy-divider-vert" />
      <div style={{ flex: 1, padding: '8px 22px', cursor: 'pointer' }}>
        <div className="sy-mono-strong" style={{ fontSize: 10.5 }}>Cause</div>
        <div style={{ fontSize: 14, fontWeight: 500, marginTop: 2 }}>Toutes</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 6 }}>
        <Btn variant="primary" size="lg" style={{ borderRadius: 999, padding: '0 24px' }}>
          <Icon name="search" /> Rechercher
        </Btn>
      </div>
    </div>
  );
}

// ─────── Frame (device wrapper) ───────
function Frame({ kind = 'desktop', children, style, width, height, label, tag }) {
  const w = width ?? (kind === 'mobile' ? 380 : 1280);
  const h = height ?? (kind === 'mobile' ? 800 : 840);
  return (
    <div style={{ position: 'relative', width: w, height: h, flex: '0 0 auto', ...style }}>
      {label && (
        <div className="sy-mono" style={{ position: 'absolute', top: -24, left: 4 }}>{label}</div>
      )}
      {tag && (
        <div className="sy-mono" style={{ position: 'absolute', top: -24, right: 4 }}>{tag}</div>
      )}
      <div className={cx('sy-frame', kind === 'mobile' && 'sy-frame-mobile', 'sy')}
        style={{ width: '100%', height: '100%' }}>
        {kind === 'mobile' && (
          <div className="sy-statusbar">
            <span style={{ fontFamily: 'var(--sans)' }}>9:41</span>
            <span style={{ display: 'inline-flex', gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink)' }} />
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink)' }} />
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink)' }} />
            </span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─────── Pair (desktop + mobile side by side) ───────
function Pair({ desktop, mobile, gap = 48, style }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-start', padding: '40px 32px', ...style }}>
      {desktop}
      {mobile}
    </div>
  );
}

// ─────── Tiny icon set (SVG, stroke-based, minimal) ───────
function Icon({ name, size = 16, color = 'currentColor', style }) {
  const s = size;
  const stroke = 1.6;
  const common = { width: s, height: s, viewBox: '0 0 24 24', fill: 'none', stroke: color,
    strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const path = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
    map: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>,
    heart: <path d="M12 21s-7-4.3-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.7-7 10-7 10Z" />,
    share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8 11 8-4M8 13l8 4" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    arrowLeft: <><path d="M19 12H5M11 6l-6 6 6 6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    check: <path d="m5 12 5 5 9-12" />,
    close: <path d="M5 5l14 14M19 5 5 19" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    star: <path d="m12 3 2.7 6.1 6.6.6-5 4.5 1.5 6.5L12 17l-5.8 3.7L7.7 14l-5-4.5 6.6-.6L12 3Z" />,
    pin: <><path d="M12 22s7-7 7-13a7 7 0 0 0-14 0c0 6 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    user: <><circle cx="12" cy="9" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
    users: <><circle cx="9" cy="9" r="3.2" /><circle cx="17" cy="10" r="2.6" /><path d="M3 19a6 6 0 0 1 12 0M14 19a5 5 0 0 1 7 0" /></>,
    flag: <><path d="M5 22V4" /><path d="M5 4c3 0 5 2 8 2s4-2 6-2v10c-2 0-3 2-6 2s-5-2-8-2" /></>,
    sparkle: <path d="M12 3v6m0 6v6m-9-9h6m6 0h6M6 6l3 3m6 6 3 3M18 6l-3 3m-6 6-3 3" />,
    euro: <path d="M16 7a5 5 0 1 0 0 10M4 10h9M4 14h9" />,
    bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
    filter: <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h10" /></>,
    bell: <><path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4l2-2Z" /><path d="M10 21a2 2 0 0 0 4 0" /></>,
    chat: <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8l-4 4v-4H6a2 2 0 0 1-2-2V6Z" />,
    image: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="m5 19 5-5 4 4 2-2 4 3" /></>,
    upload: <><path d="M12 4v12M7 9l5-5 5 5M4 18h16" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.3a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.7 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.4.6 1 1 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" /></>,
    home: <><path d="M3 12 12 4l9 8" /><path d="M5 10v10h14V10" /></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
    trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" /><path d="M4 5h4M16 5h4M10 14v3M14 14v3M8 20h8" /></>,
    leaf: <><path d="M4 20c0-8 6-14 16-14 0 10-6 16-16 16Z" /><path d="M4 20 14 10" /></>,
    coin: <><circle cx="12" cy="12" r="8" /><path d="M9 9h4a2 2 0 0 1 0 4H9M9 15h5" /></>,
    download: <><path d="M12 4v12M7 11l5 5 5-5M4 20h16" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v5h1" /></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  };
  return <svg {...common}>{path[name] || null}</svg>;
}

Object.assign(window, {
  cx, Btn, IconBtn, Chip, Card, Img, Avatar, AvatarStack,
  Progress, Tabs, Stars, Field, Input, Textarea, SearchBar,
  Frame, Pair, Icon,
});
