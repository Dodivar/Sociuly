// Sociuly — Signature: Impact Visualization
// The "your booking pushes this project from 62% → 68%" hero moment.
// Used on detail pages, booking confirmation, project pages.

function ImpactHero({
  title = 'Tournoi national Espagne U17',
  asso = 'USB Volley',
  value = 0.62,
  delta = 0.06,
  collected = 2480,
  target = 4000,
  bookingPrice = 280,
  bookings = 14,
  days = 12,
  style,
}) {
  const newValue = Math.min(1, value + delta);
  return (
    <div className="sy-card-xl sy-card-elevated" style={{
      background: 'linear-gradient(140deg, var(--accent-soft) 0%, var(--surface) 60%)',
      border: '1px solid var(--line)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
      position: 'relative', padding: 0, ...style,
    }}>
      <div style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span className="sy-chip sy-chip-accent" style={{ fontWeight: 600 }}>
            <span style={{ position: 'relative', display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
              background: 'var(--accent)' }} />
            Projet en cours
          </span>
          <span className="sy-mono">{asso}</span>
        </div>

        <h2 style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 36, lineHeight: 1.04,
          letterSpacing: '-0.025em', margin: 0, fontVariationSettings: 'var(--display-var)',
          maxWidth: 460 }}>{title}</h2>

        {/* big number */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 64, lineHeight: 0.95,
            letterSpacing: '-0.035em', color: 'var(--ink)', fontVariationSettings: 'var(--display-var)' }} className="sy-num">
            €{collected.toLocaleString('fr-FR')}
          </div>
          <div className="sy-h3 sy-muted sy-num">collectés sur €{target.toLocaleString('fr-FR')}</div>
        </div>

        {/* the signature: dual progress with delta */}
        <div style={{ marginTop: 18 }}>
          <div style={{ position: 'relative', height: 14, borderRadius: 999,
            background: 'var(--surface-2)', overflow: 'hidden' }}>
            {/* current value */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${value * 100}%`, background: 'var(--accent)', borderRadius: 999 }} />
            {/* delta (your booking) */}
            <div style={{ position: 'absolute', left: `${value * 100}%`, top: 0, bottom: 0,
              width: `${delta * 100}%`,
              background: `repeating-linear-gradient(45deg, var(--accent-deep) 0 5px, var(--accent) 5px 10px)`,
              borderTopRightRadius: 999, borderBottomRightRadius: 999 }} />
            {/* current marker */}
            <div style={{ position: 'absolute', left: `${value * 100}%`, top: -3, bottom: -3,
              width: 2, background: 'var(--ink)', transform: 'translateX(-1px)' }} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between',
            alignItems: 'center' }}>
            <div className="sy-mono sy-num" style={{ color: 'var(--ink-2)' }}>
              Aujourd'hui · {Math.round(value * 100)}%
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Icon name="arrow" size={14} color="var(--accent-deep)" />
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 22,
                fontVariationSettings: 'var(--display-var)', color: 'var(--accent-deep)' }} className="sy-num">
                {Math.round(newValue * 100)}%
              </div>
              <div className="sy-small" style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>
                avec votre résa
              </div>
            </div>
          </div>
        </div>

        {/* meta strip */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px dashed var(--line-2)',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <div>
            <div className="sy-mono">Votre apport</div>
            <div className="sy-h2 sy-num" style={{ marginTop: 4, color: 'var(--accent-deep)' }}>
              +€{Math.round(bookingPrice * 0.3)}
            </div>
          </div>
          <div>
            <div className="sy-mono">Soutiens</div>
            <div className="sy-h2 sy-num" style={{ marginTop: 4 }}>{bookings}</div>
          </div>
          <div>
            <div className="sy-mono">Reste</div>
            <div className="sy-h2 sy-num" style={{ marginTop: 4 }}>{days}j</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────── Impact ribbon (slim version, for cards/lists) ───────
function ImpactRibbon({ title = 'Tournoi U17', value = 0.62, delta = 0.06, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 999, background: 'var(--accent-soft)',
      border: '1px solid var(--accent)', ...style,
    }}>
      <Icon name="trophy" size={16} color="var(--accent-deep)" />
      <div style={{ flex: 1 }}>
        <div className="sy-mono" style={{ color: 'var(--accent-deep)', fontSize: 10 }}>Finance · push +{Math.round(delta * 100)} pt</div>
        <div className="sy-h4" style={{ marginTop: 1 }}>{title}</div>
      </div>
      <div style={{ minWidth: 90 }}>
        <div className="sy-progress" style={{ background: '#fff8' }}>
          <i style={{ width: `${value * 100}%` }} />
        </div>
        <div className="sy-mono sy-num" style={{ marginTop: 4, color: 'var(--accent-deep)', textAlign: 'right' }}>
          {Math.round(value * 100)}%
        </div>
      </div>
    </div>
  );
}

// ─────── ImpactMap — visualizes contributions across nearby clubs ───────
function ImpactMap({ style }) {
  const clubs = [
    { x: 18, y: 25, size: 'lg', pct: 92, label: 'USB Volley', hot: true },
    { x: 38, y: 60, size: 'md', pct: 68, label: 'AS Saint-Brieuc' },
    { x: 62, y: 32, size: 'sm', pct: 32, label: 'JA Rennes' },
    { x: 78, y: 70, size: 'md', pct: 55, label: 'Stade Rennais' },
    { x: 50, y: 18, size: 'sm', pct: 18, label: 'EC Bruz' },
  ];
  return (
    <div style={{
      position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      background: 'var(--surface-2)', aspectRatio: '16/10', ...style,
    }}>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        {/* abstract topo */}
        <defs>
          <pattern id="dotgrid" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.4" fill="var(--ink-3)" opacity=".3" />
          </pattern>
        </defs>
        <rect width="100" height="60" fill="url(#dotgrid)" />
        <path d="M 5 40 Q 25 25 45 35 T 95 30" stroke="var(--line-2)" fill="none" strokeWidth=".6" />
        <path d="M 0 22 Q 30 12 60 22 T 100 18" stroke="var(--line-2)" fill="none" strokeWidth=".5" />
        <path d="M 0 50 Q 35 42 65 50 T 100 48" stroke="var(--line-2)" fill="none" strokeWidth=".4" />
      </svg>
      {clubs.map((c, i) => {
        const r = c.size === 'lg' ? 30 : c.size === 'md' ? 22 : 16;
        return (
          <div key={i} style={{
            position: 'absolute', left: `${c.x}%`, top: `${c.y}%`,
            transform: 'translate(-50%, -50%)',
          }}>
            <div style={{
              width: r, height: r, borderRadius: '50%',
              background: c.hot ? 'var(--accent)' : 'var(--primary)',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--display)', fontWeight: 700, fontSize: r < 20 ? 9 : 11,
              boxShadow: '0 4px 12px rgba(20,36,31,.25)', position: 'relative',
            }}>
              {c.pct}%
              {c.hot && (
                <span style={{ position: 'absolute', inset: -6, borderRadius: '50%',
                  border: '2px solid var(--accent)', opacity: .4, animation: 'sy-ping 2s ease-out infinite' }} />
              )}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes sy-ping { 0% { transform: scale(1); opacity: .6 } 100% { transform: scale(1.6); opacity: 0 } }
      `}</style>
      <div style={{ position: 'absolute', left: 16, bottom: 16, right: 16 }}>
        <div className="sy-card" style={{ background: 'rgba(252,249,241,.95)', backdropFilter: 'blur(12px)',
          padding: 14, borderRadius: 'var(--radius-md)' }}>
          <div className="sy-mono">Cette semaine près de vous</div>
          <div className="sy-h3 sy-num" style={{ marginTop: 4 }}>€8 320 collectés · 5 clubs actifs</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ImpactHero, ImpactRibbon, ImpactMap });
