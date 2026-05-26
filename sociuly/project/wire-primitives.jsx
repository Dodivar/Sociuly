// Sociuly wireframe primitives — low-fi sketchy w/ blue accent
// Load AFTER React, BEFORE the screen files.

const WIRE = {
  ink: '#1d1d1f',
  ink2: '#4a4a52',
  ink3: '#8a8a92',
  line: '#cdcdd0',
  line2: '#e6e5e1',
  paper: '#fbfaf6',
  paper2: '#f4f2ec',
  accent: '#1f6feb',
  accentSoft: '#dfeaff',
  hand: "'Caveat', 'Kalam', cursive",
  sans: "'Inter', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
};

// inject base wire styles once
if (typeof document !== 'undefined' && !document.getElementById('wire-styles')) {
  const s = document.createElement('style');
  s.id = 'wire-styles';
  s.textContent = `
    .wf { font-family: ${WIRE.sans}; color: ${WIRE.ink}; font-size: 13px; line-height: 1.35; }
    .wf, .wf * { box-sizing: border-box; }
    .wf-frame {
      background: ${WIRE.paper};
      border: 1.5px solid ${WIRE.ink};
      border-radius: 14px;
      box-shadow: 4px 5px 0 -2px ${WIRE.line};
      overflow: hidden;
      position: relative;
    }
    .wf-frame-label {
      position: absolute; top: -28px; left: 4px;
      font-family: ${WIRE.hand}; font-size: 20px; color: ${WIRE.ink2};
      transform: rotate(-1deg);
    }
    .wf-frame-tag {
      position: absolute; top: -22px; right: 8px;
      font-family: ${WIRE.mono}; font-size: 10px; color: ${WIRE.ink3};
      letter-spacing: 0.08em; text-transform: uppercase;
    }
    .wf-box {
      border: 1.4px solid ${WIRE.ink};
      border-radius: 8px;
      background: ${WIRE.paper};
    }
    .wf-box-soft { border: 1.2px dashed ${WIRE.line}; border-radius: 8px; background: ${WIRE.paper}; }
    .wf-img {
      background:
        repeating-linear-gradient(135deg, transparent 0 8px, rgba(0,0,0,.06) 8px 9px),
        ${WIRE.paper2};
      border: 1.4px solid ${WIRE.ink};
      border-radius: 8px;
      position: relative;
      display: flex; align-items: center; justify-content: center;
      color: ${WIRE.ink3};
      font-family: ${WIRE.mono}; font-size: 10px;
      text-align: center; padding: 6px;
    }
    .wf-img.with-x::before, .wf-img.with-x::after {
      content: ''; position: absolute; inset: 6px;
      border-top: 1px solid rgba(0,0,0,.18);
      transform-origin: top left;
      pointer-events: none;
    }
    .wf-img.with-x::before { transform: skewY(35deg); width: 70%; }
    .wf-img.with-x::after { transform: skewY(-35deg) translateX(0); right: 6px; left: auto; width: 70%; transform-origin: top right; }
    .wf-btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      border: 1.4px solid ${WIRE.ink}; border-radius: 999px;
      padding: 8px 14px; font-family: ${WIRE.sans}; font-weight: 600; font-size: 12px;
      background: ${WIRE.paper}; color: ${WIRE.ink};
      box-shadow: 2px 2px 0 -0.5px ${WIRE.ink};
      white-space: nowrap;
    }
    .wf-btn-primary { background: ${WIRE.accent}; color: #fff; border-color: ${WIRE.ink}; }
    .wf-btn-ghost { border-style: dashed; box-shadow: none; }
    .wf-btn-sm { padding: 5px 10px; font-size: 11px; box-shadow: 1.5px 1.5px 0 -0.5px ${WIRE.ink}; }
    .wf-btn-block { display: flex; width: 100%; }
    .wf-chip {
      display: inline-flex; align-items: center; gap: 4px;
      border: 1.2px solid ${WIRE.ink}; border-radius: 999px;
      padding: 3px 9px; font-size: 11px; background: ${WIRE.paper};
      font-family: ${WIRE.sans}; color: ${WIRE.ink2};
    }
    .wf-chip-accent { background: ${WIRE.accentSoft}; border-color: ${WIRE.accent}; color: ${WIRE.accent}; font-weight: 600; }
    .wf-chip-solid { background: ${WIRE.ink}; color: #fff; border-color: ${WIRE.ink}; }
    .wf-note {
      font-family: ${WIRE.hand}; color: ${WIRE.accent}; font-size: 16px; line-height: 1.1;
      transform: rotate(-1.2deg); display: inline-block;
    }
    .wf-note-ink { color: ${WIRE.ink2}; }
    .wf-h1 { font-family: ${WIRE.sans}; font-weight: 800; font-size: 22px; line-height: 1.1; letter-spacing: -0.01em; }
    .wf-h2 { font-family: ${WIRE.sans}; font-weight: 700; font-size: 16px; line-height: 1.15; }
    .wf-h3 { font-family: ${WIRE.sans}; font-weight: 700; font-size: 13px; letter-spacing: -0.005em; }
    .wf-muted { color: ${WIRE.ink3}; }
    .wf-mono { font-family: ${WIRE.mono}; font-size: 10.5px; color: ${WIRE.ink3}; letter-spacing: 0.02em; }
    .wf-divider { height: 1px; background: ${WIRE.line}; margin: 8px 0; }
    .wf-divider-dashed { border-top: 1.2px dashed ${WIRE.line}; margin: 8px 0; }
    .wf-progress {
      height: 8px; border-radius: 999px; background: ${WIRE.line2};
      border: 1px solid ${WIRE.ink}; overflow: hidden; position: relative;
    }
    .wf-progress > i {
      display: block; height: 100%;
      background: ${WIRE.accent};
      border-right: 1px solid ${WIRE.ink};
    }
    .wf-scroll { overflow: hidden; }
    .wf-strap {
      background: ${WIRE.ink}; color: #fff;
      font-family: ${WIRE.mono}; font-size: 10px; letter-spacing: 0.06em;
      text-transform: uppercase; padding: 3px 8px; border-radius: 4px;
      display: inline-block;
    }
    .wf-statusbar {
      height: 22px; display: flex; align-items: center; justify-content: space-between;
      padding: 0 14px; font-family: ${WIRE.sans}; font-size: 10px; font-weight: 700;
      color: ${WIRE.ink};
    }
    .wf-statusbar .dots { display: inline-flex; gap: 3px; }
    .wf-statusbar .dots i { width: 4px; height: 4px; border-radius: 50%; background: ${WIRE.ink}; display: inline-block; }
    .wf-navtabs { display: flex; gap: 14px; font-size: 12px; }
    .wf-navtabs span { color: ${WIRE.ink2}; }
    .wf-navtabs .on { color: ${WIRE.ink}; font-weight: 700; border-bottom: 2px solid ${WIRE.accent}; padding-bottom: 2px; }
    .wf-stack { display: flex; flex-direction: column; }
    .wf-row { display: flex; flex-direction: row; }
    .wf-grid { display: grid; }
    .wf-bullet { width: 6px; height: 6px; border-radius: 50%; background: ${WIRE.ink}; display: inline-block; }
    .wf-numcircle {
      width: 26px; height: 26px; border-radius: 50%; border: 1.4px solid ${WIRE.ink};
      display: inline-flex; align-items: center; justify-content: center;
      font-family: ${WIRE.hand}; font-size: 18px; color: ${WIRE.ink};
      background: ${WIRE.paper};
    }
    .wf-callout {
      background: ${WIRE.accentSoft};
      border: 1.4px solid ${WIRE.accent};
      border-radius: 10px;
      padding: 10px;
      position: relative;
    }
    .wf-callout::before {
      content: ''; position: absolute; top: -5px; left: 14px;
      width: 10px; height: 10px; background: ${WIRE.accentSoft};
      border-left: 1.4px solid ${WIRE.accent}; border-top: 1.4px solid ${WIRE.accent};
      transform: rotate(45deg);
    }
    .wf-sticky {
      box-shadow: 0 0 0 1.4px ${WIRE.ink}, 4px 4px 0 -1px ${WIRE.ink};
      border-radius: 12px; background: ${WIRE.paper};
    }
    .wf-tab { padding: 5px 10px; border-radius: 6px; font-size: 11px; color: ${WIRE.ink2}; cursor: default; }
    .wf-tab.on { background: ${WIRE.ink}; color: #fff; }
    .wf-kbd { font-family: ${WIRE.mono}; font-size: 10px; border: 1px solid ${WIRE.line}; padding: 1px 5px; border-radius: 4px; color: ${WIRE.ink2}; }
    .wf-arrow { stroke: ${WIRE.accent}; fill: none; stroke-width: 1.6; stroke-linecap: round; }
    .wf-skel { background: ${WIRE.line2}; border-radius: 4px; }
    .wf-handframe { border: 1.5px solid ${WIRE.ink}; border-radius: 22px; box-shadow: 4px 5px 0 -2px ${WIRE.line}; }
  `;
  document.head.appendChild(s);
}

// --- Components ---
function Frame({ kind = 'desktop', label, tag, width, height, children, style }) {
  const w = width ?? (kind === 'mobile' ? 360 : 1180);
  const h = height ?? (kind === 'mobile' ? 720 : 880);
  return (
    <div style={{ position: 'relative', width: w, height: h, flex: '0 0 auto', ...style }}>
      {label && <div className="wf-frame-label">{label}</div>}
      {tag && <div className="wf-frame-tag">{tag}</div>}
      <div className="wf-frame wf" style={{ width: '100%', height: '100%', borderRadius: kind === 'mobile' ? 26 : 14 }}>
        {kind === 'mobile' && (
          <div className="wf-statusbar" style={{ borderBottom: `1px solid ${WIRE.line2}` }}>
            <span>9:41</span>
            <span className="dots"><i /><i /><i /></span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function Pair({ desktop, mobile, gap = 56 }) {
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-start', padding: '36px 24px 24px' }}>
      {desktop}
      {mobile}
    </div>
  );
}

function Img({ label, h = 120, style }) {
  return (
    <div className="wf-img" style={{ height: h, ...style }}>
      <span>{label || '[ image ]'}</span>
    </div>
  );
}

function Btn({ primary, ghost, sm, block, children, style }) {
  const cls = [
    'wf-btn',
    primary ? 'wf-btn-primary' : '',
    ghost ? 'wf-btn-ghost' : '',
    sm ? 'wf-btn-sm' : '',
    block ? 'wf-btn-block' : '',
  ].filter(Boolean).join(' ');
  return <button type="button" className={cls} style={style}>{children}</button>;
}

function Chip({ accent, solid, children, style }) {
  const cls = ['wf-chip', accent ? 'wf-chip-accent' : '', solid ? 'wf-chip-solid' : ''].filter(Boolean).join(' ');
  return <span className={cls} style={style}>{children}</span>;
}

function Note({ children, style, ink }) {
  return <span className={`wf-note ${ink ? 'wf-note-ink' : ''}`} style={style}>{children}</span>;
}

function Progress({ value = 0.5, style }) {
  return (
    <div className="wf-progress" style={style}>
      <i style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

function ImpactBlock({ compact, value = 0.62, title = 'Voyage tournoi Espagne', sub = '€2 480 / €4 000 collectés', style }) {
  return (
    <div className="wf-callout" style={style}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {!compact && <div className="wf-img" style={{ width: 56, height: 44 }}><span>projet</span></div>}
        <div style={{ flex: 1 }}>
          <div className="wf-mono" style={{ marginBottom: 2 }}>CETTE PRESTATION FINANCE</div>
          <div className="wf-h3" style={{ marginBottom: 6 }}>{title}</div>
          <Progress value={value} />
          <div className="wf-mono" style={{ marginTop: 4 }}>{sub}</div>
        </div>
      </div>
    </div>
  );
}

// Sketchy arrow svg
function Arrow({ from, to, curve = 30, style }) {
  const [x1, y1] = from; const [x2, y2] = to;
  const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2 - curve;
  return (
    <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible', ...style }}>
      <path d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`} className="wf-arrow" />
      <path d={`M ${x2} ${y2} l -6 -2 m 6 2 l -3 -6`} className="wf-arrow" />
    </svg>
  );
}

Object.assign(window, { WIRE, Frame, Pair, Img, Btn, Chip, Note, Progress, ImpactBlock, Arrow });
