// Sociuly — Design tokens
// Color, type, radius, shadow. Themed via CSS variables.
// Injected once into <head>; consumed by class names + var() refs in ds-components.jsx.

const SOCIULY_THEMES = {
  outdoor: {
    label: 'Outdoor',
    '--bg':           '#f4efe4',
    '--surface':      '#fcf9f1',
    '--surface-2':    '#ede5d3',
    '--surface-3':    '#dfd4ba',
    '--ink':          '#14241f',
    '--ink-2':        '#4a5851',
    '--ink-3':        '#8b948e',
    '--line':         '#e3dccb',
    '--line-2':       '#cfc5ad',
    '--primary':      '#1f4b3f',
    '--primary-deep': '#14332b',
    '--primary-soft': '#d3e3d8',
    '--accent':       '#e8623d',
    '--accent-deep': '#c0451f',
    '--accent-soft':  '#fbded0',
    '--highlight':    '#f1c14a',
    '--highlight-soft': '#fdedb7',
    '--success':      '#2c8a5a',
    '--danger':       '#c0492f',
    '--ring':         'rgba(20,36,31,.16)',
  },
  pitch: {
    label: 'Pitch',
    '--bg':           '#0f1714',
    '--surface':      '#172420',
    '--surface-2':    '#1f3029',
    '--surface-3':    '#2a4036',
    '--ink':          '#f4efe4',
    '--ink-2':        '#b8bcb4',
    '--ink-3':        '#7a8079',
    '--line':         '#2a3a33',
    '--line-2':       '#3a4f47',
    '--primary':      '#3df58a',
    '--primary-deep': '#27c46a',
    '--primary-soft': '#1c3a2a',
    '--accent':       '#ff7245',
    '--accent-deep': '#e0552a',
    '--accent-soft':  '#3a1f17',
    '--highlight':    '#f5d96a',
    '--highlight-soft': '#3a3018',
    '--success':      '#3df58a',
    '--danger':       '#ff5b3a',
    '--ring':         'rgba(244,239,228,.12)',
  },
  stade: {
    label: 'Stade',
    '--bg':           '#eef2fb',
    '--surface':      '#ffffff',
    '--surface-2':    '#e1e8f5',
    '--surface-3':    '#cdd7ec',
    '--ink':          '#0b1530',
    '--ink-2':        '#3a4566',
    '--ink-3':        '#7780a0',
    '--line':         '#d8dff0',
    '--line-2':       '#bac4dd',
    '--primary':      '#1e63f0',
    '--primary-deep': '#0d2d8a',
    '--primary-soft': '#d6e2ff',
    '--accent':       '#0d2d8a',
    '--accent-deep': '#061a5c',
    '--accent-soft':  '#dbe2f5',
    '--highlight':    '#f5c518',
    '--highlight-soft': '#fdeec0',
    '--success':      '#1c8a4d',
    '--danger':       '#d33a1f',
    '--ring':         'rgba(30,99,240,.22)',
  },
  daybreak: {
    label: 'Daybreak',
    '--bg':           '#f5f0ea',
    '--surface':      '#ffffff',
    '--surface-2':    '#eee6da',
    '--surface-3':    '#dfd2bc',
    '--ink':          '#0c1422',
    '--ink-2':        '#454b58',
    '--ink-3':        '#828896',
    '--line':         '#e3dccb',
    '--line-2':       '#cdc4af',
    '--primary':      '#2a4cd7',
    '--primary-deep': '#1b35a3',
    '--primary-soft': '#d8def9',
    '--accent':       '#f04d2c',
    '--accent-deep': '#c43317',
    '--accent-soft':  '#fcd8cb',
    '--highlight':    '#f5b720',
    '--highlight-soft': '#fbe8b9',
    '--success':      '#1c8a4d',
    '--danger':       '#d33a1f',
    '--ring':         'rgba(12,20,34,.16)',
  },
};

const SOCIULY_FONTS = {
  bricolage: {
    label: 'Bricolage',
    display: "'Bricolage Grotesque', 'Söhne', system-ui, sans-serif",
    sans: "'Geist', 'Söhne', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
    displayVariation: "'wdth' 90, 'opsz' 32",
  },
  instrument: {
    label: 'Instrument',
    display: "'Instrument Serif', 'Tiempos', Georgia, serif",
    sans: "'Geist', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, Menlo, monospace",
    displayVariation: "normal",
  },
};

const SOCIULY_DENSITIES = {
  comfortable: { '--gap': '16px', '--card-pad': '18px', '--screen-pad': '24px' },
  compact:     { '--gap': '12px', '--card-pad': '14px', '--screen-pad': '20px' },
  spacious:    { '--gap': '22px', '--card-pad': '22px', '--screen-pad': '32px' },
};

const SOCIULY_RADII = {
  sharp:    { '--radius-xs': '2px', '--radius-sm': '4px', '--radius-md': '6px',  '--radius-lg': '10px', '--radius-xl': '16px' },
  balanced: { '--radius-xs': '4px', '--radius-sm': '8px', '--radius-md': '12px', '--radius-lg': '18px', '--radius-xl': '28px' },
  soft:     { '--radius-xs': '6px', '--radius-sm': '12px','--radius-md': '18px', '--radius-lg': '26px', '--radius-xl': '36px' },
};

function applySociulyTheme({ theme = 'outdoor', font = 'bricolage', density = 'comfortable', radius = 'balanced' } = {}) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const apply = (obj) => { Object.entries(obj).forEach(([k, v]) => { if (k.startsWith('--')) root.style.setProperty(k, v); }); };
  apply(SOCIULY_THEMES[theme] || SOCIULY_THEMES.outdoor);
  const f = SOCIULY_FONTS[font] || SOCIULY_FONTS.bricolage;
  root.style.setProperty('--display', f.display);
  root.style.setProperty('--sans', f.sans);
  root.style.setProperty('--mono', f.mono);
  root.style.setProperty('--display-var', f.displayVariation);
  apply(SOCIULY_DENSITIES[density] || SOCIULY_DENSITIES.comfortable);
  apply(SOCIULY_RADII[radius] || SOCIULY_RADII.balanced);
}

const SOCIULY_CSS = `
  body { background: var(--bg); }

  /* shadow tokens */
  :root {
    --shadow-sm: 0 1px 2px rgba(20,36,31,.04), 0 4px 12px rgba(20,36,31,.04);
    --shadow-md: 0 1px 3px rgba(20,36,31,.06), 0 12px 28px rgba(20,36,31,.07);
    --shadow-lg: 0 4px 12px rgba(20,36,31,.08), 0 28px 56px rgba(20,36,31,.12);
    --shadow-inset: inset 0 0 0 1px var(--line);
  }

  .sy { font-family: var(--sans); color: var(--ink); font-size: 15px; line-height: 1.5;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
  .sy *, .sy *::before, .sy *::after { box-sizing: border-box; }
  .sy a { color: inherit; text-decoration: none; }

  /* ─────── typography ─────── */
  .sy-display-xl { font-family: var(--display); font-weight: 700; font-size: 96px; line-height: 0.92;
    letter-spacing: -0.035em; font-variation-settings: var(--display-var); margin: 0; }
  .sy-display { font-family: var(--display); font-weight: 700; font-size: 68px; line-height: 0.95;
    letter-spacing: -0.03em; font-variation-settings: var(--display-var); margin: 0; }
  .sy-display-sm { font-family: var(--display); font-weight: 700; font-size: 44px; line-height: 1;
    letter-spacing: -0.025em; font-variation-settings: var(--display-var); margin: 0; }
  .sy-h1 { font-family: var(--display); font-weight: 700; font-size: 32px; line-height: 1.06;
    letter-spacing: -0.02em; margin: 0; font-variation-settings: var(--display-var); }
  .sy-h2 { font-family: var(--display); font-weight: 700; font-size: 22px; line-height: 1.18;
    letter-spacing: -0.012em; margin: 0; font-variation-settings: var(--display-var); }
  .sy-h3 { font-family: var(--sans); font-weight: 600; font-size: 16px; line-height: 1.3;
    letter-spacing: -0.005em; margin: 0; }
  .sy-h4 { font-family: var(--sans); font-weight: 600; font-size: 13.5px; line-height: 1.3; margin: 0; }
  .sy-body-l { font-size: 17px; line-height: 1.55; color: var(--ink-2); margin: 0; }
  .sy-body { font-size: 15px; line-height: 1.55; color: var(--ink-2); margin: 0; }
  .sy-small { font-size: 13px; line-height: 1.45; color: var(--ink-2); margin: 0; }
  .sy-mono { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ink-3); margin: 0; font-weight: 500; }
  .sy-mono-strong { font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ink); font-weight: 600; }
  .sy-muted { color: var(--ink-3); }
  .sy-num { font-feature-settings: 'tnum' on, 'lnum' on; }
  .sy-link { color: var(--ink); text-decoration: underline; text-decoration-color: var(--line-2);
    text-underline-offset: 3px; text-decoration-thickness: 1.5px; }
  .sy-link:hover { text-decoration-color: var(--ink); }
  .sy-accent { color: var(--accent); }
  .sy-primary { color: var(--primary); }

  /* ─────── surfaces ─────── */
  .sy-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md);
    padding: var(--card-pad); }
  .sy-card-lg { border-radius: var(--radius-lg); padding: 22px; }
  .sy-card-xl { border-radius: var(--radius-xl); padding: 28px; }
  .sy-card-elevated { box-shadow: var(--shadow-md); border-color: transparent; background: var(--surface); }
  .sy-card-flat { background: var(--surface-2); border-color: transparent; }
  .sy-card-ink { background: var(--ink); color: var(--surface); border-color: var(--ink); }
  .sy-card-primary { background: var(--primary); color: #fff; border-color: var(--primary); }
  .sy-card-accent { background: var(--accent-soft); border-color: transparent; }

  /* ─────── buttons ─────── */
  .sy-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    height: 44px; padding: 0 20px; border-radius: 999px; border: none;
    font-family: var(--sans); font-weight: 600; font-size: 14px; cursor: pointer;
    transition: transform .08s ease, background .15s ease, box-shadow .15s ease, color .15s ease;
    user-select: none; white-space: nowrap; letter-spacing: -0.005em; }
  .sy-btn:active { transform: translateY(1px); }
  .sy-btn:focus-visible { outline: 3px solid var(--ring); outline-offset: 2px; }
  .sy-btn-primary { background: var(--accent); color: #fff; }
  .sy-btn-primary:hover { background: var(--accent-deep); }
  .sy-btn-dark { background: var(--ink); color: var(--surface); }
  .sy-btn-dark:hover { background: var(--primary-deep); }
  .sy-btn-brand { background: var(--primary); color: #fff; }
  .sy-btn-brand:hover { background: var(--primary-deep); }
  .sy-btn-outline { background: transparent; color: var(--ink); border: 1.5px solid var(--ink); }
  .sy-btn-outline:hover { background: var(--ink); color: var(--surface); }
  .sy-btn-soft { background: var(--surface-2); color: var(--ink); }
  .sy-btn-soft:hover { background: var(--surface-3); }
  .sy-btn-ghost { background: transparent; color: var(--ink); }
  .sy-btn-ghost:hover { background: var(--surface-2); }
  .sy-btn-sm { height: 34px; padding: 0 14px; font-size: 13px; }
  .sy-btn-lg { height: 54px; padding: 0 24px; font-size: 15.5px; }
  .sy-btn-xl { height: 64px; padding: 0 32px; font-size: 17px; border-radius: 999px; }
  .sy-btn-block { display: flex; width: 100%; }
  .sy-btn-icon { width: 40px; padding: 0; }
  .sy-btn-icon-sm { width: 32px; height: 32px; padding: 0; }

  /* ─────── chip / tag ─────── */
  .sy-chip { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 12px;
    border-radius: 999px; font-size: 12.5px; font-weight: 500; background: var(--surface-2);
    color: var(--ink); border: 1px solid transparent; }
  .sy-chip-outline { background: transparent; border-color: var(--line-2); }
  .sy-chip-solid { background: var(--ink); color: var(--surface); }
  .sy-chip-accent { background: var(--accent-soft); color: var(--accent-deep); }
  .sy-chip-primary { background: var(--primary-soft); color: var(--primary-deep); }
  .sy-chip-highlight { background: var(--highlight-soft); color: #6e5111; }
  .sy-chip-sm { height: 22px; padding: 0 9px; font-size: 11px; }
  .sy-chip-lg { height: 36px; padding: 0 16px; font-size: 13px; font-weight: 600; }

  /* ─────── progress ─────── */
  .sy-progress { height: 6px; border-radius: 999px; background: var(--surface-2); overflow: hidden; position: relative; }
  .sy-progress > i { display: block; height: 100%; background: var(--accent); border-radius: inherit;
    transition: width .4s cubic-bezier(.4,0,.2,1); }
  .sy-progress.tall { height: 10px; }
  .sy-progress.xl { height: 14px; }
  .sy-progress-primary > i { background: var(--primary); }
  .sy-progress-highlight > i { background: var(--highlight); }

  /* ─────── input ─────── */
  .sy-input { display: flex; align-items: center; height: 44px; padding: 0 14px;
    border: 1.5px solid var(--line-2); border-radius: 10px; background: var(--surface);
    font-family: var(--sans); font-size: 14px; color: var(--ink); outline: none; width: 100%; }
  .sy-input::placeholder { color: var(--ink-3); }
  .sy-input:focus { border-color: var(--ink); box-shadow: 0 0 0 4px var(--ring); }
  .sy-textarea { min-height: 90px; padding: 12px 14px; line-height: 1.45; resize: vertical; }
  .sy-label { display: block; font-family: var(--mono); font-size: 11px; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ink-3); margin-bottom: 6px; }
  .sy-field { display: flex; flex-direction: column; gap: 0; }
  .sy-search { display: flex; align-items: center; gap: 10px; height: 52px; padding: 0 20px;
    background: var(--surface); border: 1.5px solid var(--line-2); border-radius: 999px;
    box-shadow: var(--shadow-sm); }
  .sy-search input { flex: 1; border: none; outline: none; background: transparent;
    font-family: var(--sans); font-size: 15px; color: var(--ink); }
  .sy-search input::placeholder { color: var(--ink-3); }

  /* ─────── divider ─────── */
  .sy-divider { height: 1px; background: var(--line); border: none; margin: 0; }
  .sy-divider-vert { width: 1px; background: var(--line); align-self: stretch; }

  /* ─────── img placeholder ─────── */
  .sy-img { background:
      repeating-linear-gradient(135deg, transparent 0 16px, rgba(20,36,31,.05) 16px 17px),
      var(--surface-2);
    border-radius: var(--radius-md); position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center; color: var(--ink-3); }
  .sy-img-label { font-family: var(--mono); font-size: 10.5px; letter-spacing: 0.08em;
    text-transform: uppercase; color: var(--ink-3); padding: 4px 10px;
    background: rgba(252,249,241,.7); border-radius: 999px; backdrop-filter: blur(8px); }
  .sy-img-cover { position: absolute; inset: 0; }

  /* ─────── pill nav ─────── */
  .sy-tabs { display: inline-flex; gap: 4px; background: var(--surface-2); padding: 4px;
    border-radius: 999px; }
  .sy-tab { height: 32px; padding: 0 14px; border-radius: 999px; font-size: 13px; font-weight: 500;
    color: var(--ink-2); display: inline-flex; align-items: center; cursor: pointer;
    transition: background .15s ease, color .15s ease; }
  .sy-tab:hover { color: var(--ink); }
  .sy-tab.on { background: var(--surface); color: var(--ink); font-weight: 600;
    box-shadow: var(--shadow-sm); }
  .sy-tab-underline { background: transparent; padding: 0; border-radius: 0; gap: 22px; }
  .sy-tab-underline .sy-tab { background: transparent; padding: 0 0 10px; border-radius: 0;
    border-bottom: 2px solid transparent; height: auto; box-shadow: none; color: var(--ink-3); }
  .sy-tab-underline .sy-tab.on { color: var(--ink); border-bottom-color: var(--accent);
    background: transparent; }

  /* ─────── avatar ─────── */
  .sy-avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--surface-2);
    border: 1.5px solid var(--surface); display: inline-flex; align-items: center; justify-content: center;
    font-family: var(--sans); font-weight: 600; font-size: 12px; color: var(--ink-2); overflow: hidden; flex: 0 0 auto; }
  .sy-avatar-lg { width: 48px; height: 48px; font-size: 16px; }
  .sy-avatar-xl { width: 72px; height: 72px; font-size: 22px; border-width: 2px; }
  .sy-avatar-stack { display: inline-flex; }
  .sy-avatar-stack .sy-avatar + .sy-avatar { margin-left: -10px; }

  /* ─────── badge ─────── */
  .sy-badge { display: inline-flex; align-items: center; justify-content: center; height: 20px;
    min-width: 20px; padding: 0 6px; border-radius: 999px; font-size: 11px; font-weight: 600;
    background: var(--accent); color: #fff; }
  .sy-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  .sy-dot-success { background: var(--success); }
  .sy-dot-pulse::after { content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: inherit; animation: sy-pulse 1.6s ease-out infinite; }
  @keyframes sy-pulse { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(2.6); opacity: 0; } }

  /* ─────── scroll utilities ─────── */
  .sy-row { display: flex; }
  .sy-col { display: flex; flex-direction: column; }
  .sy-stack > * + * { margin-top: var(--gap); }
  .sy-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap); }
  .sy-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gap); }
  .sy-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--gap); }

  /* ─────── frame (device wrappers) ─────── */
  .sy-frame { background: var(--surface); border-radius: 16px; box-shadow: var(--shadow-lg);
    overflow: hidden; position: relative; }
  .sy-frame-mobile { border-radius: 36px; }
  .sy-statusbar { height: 30px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 22px; font-size: 13px; font-weight: 600; }

  /* ─────── kbd ─────── */
  .sy-kbd { font-family: var(--mono); font-size: 11px; padding: 2px 6px; border-radius: 4px;
    background: var(--surface-2); border: 1px solid var(--line-2); color: var(--ink-2); }
`;

// Inject base CSS once.
if (typeof document !== 'undefined' && !document.getElementById('sociuly-css')) {
  const s = document.createElement('style');
  s.id = 'sociuly-css';
  s.textContent = SOCIULY_CSS;
  document.head.appendChild(s);
}

Object.assign(window, {
  SOCIULY_THEMES, SOCIULY_FONTS, SOCIULY_DENSITIES, SOCIULY_RADII,
  applySociulyTheme, SOCIULY_CSS,
});
