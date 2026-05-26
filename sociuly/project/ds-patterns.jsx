// Sociuly — domain components
// Composite cards specific to the Sociuly marketplace.

// ─────── PrestationCard ───────
// The bread-and-butter listing card.
function PrestationCard({
  title = 'Barbecue convivial du club',
  price = 280,
  loc = 'Rennes · 2 km',
  rating = 4.8,
  reviews = 47,
  category = 'BBQ · 10–60 pers.',
  asso = 'USB Volley',
  funds = 'Tournoi U17',
  goal = 0.62,
  hue = 'green',
  saved,
  compact,
  style,
  onClick,
}) {
  const hues = {
    green:    { bg: '#1f4b3f', accent: '#fbe082' },
    orange:   { bg: '#c0451f', accent: '#fce3d8' },
    yellow:   { bg: '#b8861a', accent: '#fff2c5' },
    sand:     { bg: '#8a6b3e', accent: '#f3dba6' },
    teal:     { bg: '#1f5b58', accent: '#d8efea' },
    rust:     { bg: '#8c4a25', accent: '#fbd6b9' },
  };
  const h = hues[hue] || hues.green;
  return (
    <div className="sy-card" style={{
      padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--line)', background: 'var(--surface)',
      cursor: 'pointer', transition: 'transform .2s ease, box-shadow .2s ease',
      ...style,
    }} onClick={onClick}>
      {/* image */}
      <div style={{ position: 'relative' }}>
        <div className="sy-img" style={{
          height: compact ? 150 : 200, borderRadius: 0,
          background: `linear-gradient(135deg, ${h.bg} 0%, ${h.bg}cc 50%, ${h.bg}aa 100%)`,
        }}>
          <svg viewBox="0 0 200 120" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .25 }}>
            <path d="M0 100 Q 40 60 80 80 T 200 70 L 200 120 L 0 120 Z" fill={h.accent} />
            <circle cx="160" cy="30" r="14" fill={h.accent} opacity=".6" />
          </svg>
          <span className="sy-img-label" style={{ position: 'absolute', top: 12, left: 12,
            background: 'rgba(252,249,241,.92)', color: 'var(--ink-2)' }}>{category}</span>
        </div>
        <button type="button" style={{
          position: 'absolute', top: 12, right: 12,
          width: 32, height: 32, borderRadius: '50%', border: 'none',
          background: 'rgba(252,249,241,.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}>
          <Icon name="heart" size={15} color={saved ? 'var(--accent)' : 'var(--ink)'} />
        </button>
      </div>

      {/* body */}
      <div style={{ padding: compact ? 14 : 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <h3 className="sy-h3" style={{ flex: 1 }}>{title}</h3>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 17,
            fontVariationSettings: 'var(--display-var)' }} className="sy-num">€{price}</div>
        </div>
        <div className="sy-small sy-muted" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="pin" size={12} color="var(--ink-3)" />
          <span>{loc}</span>
          <span>·</span>
          <Stars value={rating} size={11} />
          <span className="sy-mono" style={{ fontSize: 10 }}>{rating} ({reviews})</span>
        </div>

        {!compact && (
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed var(--line-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div className="sy-mono" style={{ fontSize: 10 }}>Finance</div>
              <div className="sy-mono sy-num" style={{ fontSize: 10, color: 'var(--accent-deep)' }}>{Math.round(goal * 100)}%</div>
            </div>
            <div className="sy-h4" style={{ marginTop: 2, color: 'var(--ink)' }}>{funds}</div>
            <Progress value={goal} style={{ marginTop: 8 }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────── ProjectCard ───────
function ProjectCard({
  title = 'Tournoi national Espagne U17',
  asso = 'USB Volley',
  value = 0.62,
  collected = 2480,
  target = 4000,
  days = 12,
  bookings = 14,
  status = 'live', // live | funded | upcoming
  hue = 'orange',
  style,
}) {
  const hues = {
    orange: '#c0451f', green: '#1f4b3f', yellow: '#b8861a', teal: '#1f5b58',
  };
  const bg = hues[hue] || hues.orange;
  return (
    <div className="sy-card" style={{
      padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--line)', background: 'var(--surface)', ...style,
    }}>
      <div className="sy-img" style={{
        height: 160, borderRadius: 0,
        background: `linear-gradient(135deg, ${bg} 0%, ${bg}aa 100%)`,
      }}>
        <svg viewBox="0 0 200 120" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .25 }}>
          <circle cx="50" cy="40" r="20" fill="#fff" opacity=".4" />
          <path d="M0 100 L 60 70 L 110 90 L 170 60 L 200 80 L 200 120 L 0 120 Z" fill="#fff" opacity=".3" />
        </svg>
        {status === 'funded' && (
          <span className="sy-chip sy-chip-solid" style={{ position: 'absolute', top: 12, left: 12,
            background: 'var(--surface)', color: 'var(--ink)' }}>
            <Icon name="check" size={12} /> Financé
          </span>
        )}
        {status === 'live' && (
          <span className="sy-chip" style={{ position: 'absolute', top: 12, left: 12,
            background: 'rgba(252,249,241,.95)', color: 'var(--accent-deep)', fontWeight: 600 }}>
            <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent)' }} />
            En cours
          </span>
        )}
      </div>
      <div style={{ padding: 16 }}>
        <div className="sy-mono">{asso}</div>
        <h3 className="sy-h3" style={{ marginTop: 4 }}>{title}</h3>
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22,
              fontVariationSettings: 'var(--display-var)' }} className="sy-num">€{collected.toLocaleString('fr-FR')}</div>
            <div className="sy-small sy-muted sy-num">/ €{target.toLocaleString('fr-FR')}</div>
          </div>
          <Progress value={value} style={{ marginTop: 8 }} size="tall" />
          <div className="sy-small sy-muted sy-num" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>{Math.round(value * 100)}% · {bookings} résa</span>
            {status === 'live' && <span>reste {days}j</span>}
            {status === 'funded' && <span>✓ atteint</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────── AssoCard ───────
function AssoCard({
  name = 'USB Volley',
  city = 'Rennes',
  members = 220,
  prestations = 42,
  rating = 4.9,
  verified = true,
  initials = 'UV',
  tone = 'green',
  style,
}) {
  return (
    <div className="sy-card sy-card-lg" style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Avatar initials={initials} size="lg" tone={tone} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <h3 className="sy-h3">{name}</h3>
            {verified && (
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--primary)',
                color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={11} color="#fff" />
              </span>
            )}
          </div>
          <div className="sy-small sy-muted" style={{ marginTop: 2 }}>{city} · {members} adhérents</div>
        </div>
      </div>
      <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
        paddingTop: 14, borderTop: '1px dashed var(--line-2)' }}>
        <div>
          <div className="sy-mono">Note</div>
          <div className="sy-h3 sy-num" style={{ marginTop: 2 }}>{rating}</div>
        </div>
        <div>
          <div className="sy-mono">Presta.</div>
          <div className="sy-h3 sy-num" style={{ marginTop: 2 }}>{prestations}</div>
        </div>
        <div>
          <div className="sy-mono">Projets</div>
          <div className="sy-h3 sy-num" style={{ marginTop: 2 }}>7</div>
        </div>
      </div>
    </div>
  );
}

// ─────── ImpactBlock (compact, on cards) ───────
function ImpactBlock({
  title = 'Tournoi national Espagne U17',
  asso = 'USB Volley',
  value = 0.62,
  collected = 2480,
  target = 4000,
  delta = 84, // €€ this booking adds
  style,
  variant = 'soft', // 'soft' | 'hero' | 'mini'
}) {
  if (variant === 'mini') {
    return (
      <div style={{ ...style }}>
        <div className="sy-mono" style={{ color: 'var(--accent-deep)' }}>Finance · {asso}</div>
        <div className="sy-h4" style={{ marginTop: 2 }}>{title}</div>
        <Progress value={value} style={{ marginTop: 6 }} />
        <div className="sy-small sy-muted sy-num" style={{ marginTop: 4 }}>
          €{collected.toLocaleString('fr-FR')} / €{target.toLocaleString('fr-FR')}
        </div>
      </div>
    );
  }
  if (variant === 'hero') {
    return <ImpactHero title={title} asso={asso} value={value} collected={collected} target={target} delta={delta} style={style} />;
  }
  // soft
  return (
    <div className="sy-card sy-card-accent" style={{ borderRadius: 'var(--radius-lg)',
      padding: 18, display: 'flex', gap: 14, alignItems: 'flex-start', ...style }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flex: '0 0 auto',
      }}>
        <Icon name="trophy" size={22} color="#fff" />
      </div>
      <div style={{ flex: 1 }}>
        <div className="sy-mono" style={{ color: 'var(--accent-deep)' }}>Votre réservation finance</div>
        <h3 className="sy-h3" style={{ marginTop: 2 }}>{title}</h3>
        <div className="sy-small sy-muted" style={{ marginTop: 2 }}>par <b style={{ color: 'var(--ink)' }}>{asso}</b></div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22,
              fontVariationSettings: 'var(--display-var)' }} className="sy-num">€{collected.toLocaleString('fr-FR')}</div>
            <div className="sy-small sy-muted sy-num">/ €{target.toLocaleString('fr-FR')}</div>
          </div>
          <Progress value={value} style={{ marginTop: 8 }} size="tall" />
          <div className="sy-small" style={{ marginTop: 8, color: 'var(--accent-deep)', fontWeight: 600 }}>
            +€{delta} avec votre réservation
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────── ReviewCard ───────
function ReviewCard({
  name = 'Camille L.', date = 'avril 2026', rating = 5,
  body = 'Super journée pour le BBQ de mon entreprise, équipe ultra réactive et on a fait avancer un projet local !',
  tone = 'orange',
  initials,
  style,
}) {
  return (
    <div className="sy-card sy-card-lg" style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar initials={initials || name.split(' ').map(p => p[0]).join('')} tone={tone} />
        <div style={{ flex: 1 }}>
          <div className="sy-h4">{name}</div>
          <div className="sy-mono">{date}</div>
        </div>
        <Stars value={rating} size={12} />
      </div>
      <p className="sy-body" style={{ marginTop: 10, color: 'var(--ink)' }}>"{body}"</p>
    </div>
  );
}

// ─────── BookingCard (sticky right rail on detail page) ───────
function BookingCard({ withImpact = true, style }) {
  return (
    <div className="sy-card sy-card-lg" style={{
      boxShadow: 'var(--shadow-md)', border: '1px solid var(--line)', ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 36, lineHeight: 1,
          fontVariationSettings: 'var(--display-var)' }} className="sy-num">€280</div>
        <div className="sy-mono">/ prestation</div>
      </div>
      <div style={{ marginTop: 14, border: '1.5px solid var(--ink)', borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
          <div style={{ flex: 1, padding: '10px 14px', borderRight: '1px solid var(--line)' }}>
            <div className="sy-mono">Date</div>
            <div className="sy-h4" style={{ marginTop: 2 }}>sam. 14 juin</div>
          </div>
          <div style={{ flex: 1, padding: '10px 14px' }}>
            <div className="sy-mono">Heure</div>
            <div className="sy-h4" style={{ marginTop: 2 }}>16h00</div>
          </div>
        </div>
        <div style={{ padding: '10px 14px' }}>
          <div className="sy-mono">Participants</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>24 personnes</div>
        </div>
      </div>
      <Btn variant="primary" size="lg" block style={{ marginTop: 14 }}>
        Réserver <Icon name="arrow" size={16} color="#fff" />
      </Btn>
      <div className="sy-small sy-muted" style={{ textAlign: 'center', marginTop: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="check" size={12} color="var(--success)" /> Annulation gratuite J-7
        </span>
        <span>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Icon name="lock" size={12} color="var(--ink-3)" /> Stripe
        </span>
      </div>
      {withImpact && (
        <>
          <div className="sy-divider" style={{ margin: '14px 0' }} />
          <ImpactBlock variant="mini" />
        </>
      )}
    </div>
  );
}

// ─────── Top nav ───────
const TOPNAV_ITEMS = [
  { id: 'prestations',  label: 'Prestations',  href: '#/marketplace' },
  { id: 'associations', label: 'Associations', href: '#/association' },
  { id: 'carte',        label: 'Carte',        href: '#/marketplace' },
  { id: 'projets',      label: 'Projets',      href: '#/projets' },
];

function TopNav({ active = 'prestations', variant = 'default' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '18px 32px', borderBottom: variant === 'transparent' ? 'none' : '1px solid var(--line)',
      background: variant === 'transparent' ? 'transparent' : 'var(--surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
        <a href="#/" style={{ textDecoration: 'none', color: 'inherit' }}><Logo /></a>
        <div className="sy-tab-underline sy-tabs" style={{ padding: 0 }}>
          {TOPNAV_ITEMS.map(it => (
            <a key={it.id} href={it.href} className={cx('sy-tab', active === it.id && 'on')}
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
              {it.label}
            </a>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <a href="#/club" style={{ textDecoration: 'none' }}>
          <Btn variant="ghost" size="sm">Inscrire mon asso</Btn>
        </a>
        <a href="#/club" style={{ textDecoration: 'none' }}>
          <Btn variant="dark" size="sm">Se connecter</Btn>
        </a>
      </div>
    </div>
  );
}

function MobileTopNav({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 18px', borderBottom: '1px solid var(--line)' }}>
      {title ? <div className="sy-h3">{title}</div> : <Logo size={20} />}
      {action || <Icon name="menu" size={22} />}
    </div>
  );
}

function Logo({ size = 22, color = 'var(--ink)' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={size + 4} height={size + 4} viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill="var(--primary)" />
        <circle cx="16" cy="16" r="6" fill="var(--accent)" />
      </svg>
      <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: size,
        letterSpacing: '-0.02em', color, fontVariationSettings: "'wdth' 95" }}>
        Sociuly
      </span>
    </div>
  );
}

// ─────── Section header ───────
function SectionHeader({ title, kicker, action, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      marginBottom: 18, ...style }}>
      <div>
        {kicker && <div className="sy-mono">{kicker}</div>}
        <h2 className="sy-h1" style={{ marginTop: kicker ? 4 : 0 }}>{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ─────── Stat strip ───────
function StatStrip({ items, dark, style }) {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end', ...style }}>
      {items.map((it, i) => (
        <div key={i} style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 44, lineHeight: 1,
            letterSpacing: '-0.025em', fontVariationSettings: 'var(--display-var)',
            color: dark ? 'var(--surface)' : 'var(--ink)' }} className="sy-num">{it[0]}</div>
          <div className="sy-mono" style={{ marginTop: 6,
            color: dark ? 'var(--ink-3)' : 'var(--ink-3)' }}>{it[1]}</div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  PrestationCard, ProjectCard, AssoCard, ImpactBlock, ReviewCard,
  BookingCard, TopNav, MobileTopNav, Logo, SectionHeader, StatStrip,
});
