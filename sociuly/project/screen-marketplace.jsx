// Sociuly — Marketplace screen (split: list + map)

function MarketMap({ style }) {
  const pins = [
    { x: 22, y: 30, price: 280, hot: true },
    { x: 42, y: 55, price: 180 },
    { x: 60, y: 22, price: 720 },
    { x: 72, y: 60, price: 350 },
    { x: 34, y: 75, price: 220 },
    { x: 58, y: 80, price: 420 },
    { x: 18, y: 60, price: 150 },
    { x: 82, y: 38, price: 480 },
  ];
  return (
    <div style={{
      position: 'relative', height: '100%', overflow: 'hidden',
      background: 'var(--surface-2)',
      ...style,
    }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <pattern id="dotgrid2" width="2.5" height="2.5" patternUnits="userSpaceOnUse">
            <circle cx="0.5" cy="0.5" r="0.25" fill="var(--ink-3)" opacity=".25" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#dotgrid2)" />
        {/* roads */}
        <path d="M 0 30 Q 30 22 50 32 T 100 25" stroke="var(--line-2)" fill="none" strokeWidth="1.2" />
        <path d="M 0 60 Q 35 50 60 60 T 100 55" stroke="var(--line-2)" fill="none" strokeWidth="0.9" />
        <path d="M 30 0 Q 35 30 30 60 T 35 100" stroke="var(--line-2)" fill="none" strokeWidth="0.8" />
        <path d="M 70 0 Q 72 40 68 70 T 70 100" stroke="var(--line-2)" fill="none" strokeWidth="0.8" />
        {/* park */}
        <path d="M 40 65 Q 55 60 65 72 Q 60 85 45 82 Q 38 75 40 65 Z" fill="var(--primary-soft)" opacity=".7" />
      </svg>

      {pins.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          transform: 'translate(-50%, -50%)',
        }}>
          <div style={{
            padding: '7px 14px', borderRadius: 999, background: p.hot ? 'var(--accent)' : 'var(--surface)',
            color: p.hot ? '#fff' : 'var(--ink)',
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 13,
            border: `1.5px solid ${p.hot ? 'var(--accent-deep)' : 'var(--ink)'}`,
            boxShadow: '0 4px 12px rgba(20,36,31,.18)',
            fontVariationSettings: 'var(--display-var)', whiteSpace: 'nowrap',
          }} className="sy-num">€{p.price}</div>
        </div>
      ))}

      {/* zoom controls */}
      <div style={{ position: 'absolute', right: 16, top: 16, display: 'flex', flexDirection: 'column', gap: 4,
        background: 'var(--surface)', borderRadius: 10, padding: 4, boxShadow: 'var(--shadow-md)' }}>
        <IconBtn size="sm"><Icon name="plus" size={14} /></IconBtn>
        <IconBtn size="sm"><Icon name="minus" size={14} /></IconBtn>
      </div>

      {/* impact callout */}
      <div style={{ position: 'absolute', left: 16, bottom: 16, right: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
          borderRadius: 999, background: 'var(--ink)', color: 'var(--surface)',
          boxShadow: 'var(--shadow-md)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
            <Icon name="trophy" size={18} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div className="sy-mono" style={{ color: 'var(--highlight)' }}>cette semaine près de vous</div>
            <div className="sy-h4 sy-num" style={{ marginTop: 2, color: 'var(--surface)' }}>
              €8 320 collectés · 5 clubs actifs
            </div>
          </div>
          <Btn variant="primary" size="sm" iconRight={<Icon name="arrow" size={13} color="#fff" />}>
            Voir l'impact
          </Btn>
        </div>
      </div>
    </div>
  );
}

function MarketplaceDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ padding: '14px 32px', borderBottom: '1px solid var(--line)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 24 }}>
        <Logo />
        <SearchBar compact style={{ flex: 1, maxWidth: 720 }} />
        <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
          <IconBtn><Icon name="heart" size={16} /></IconBtn>
          <IconBtn><Icon name="bell" size={16} /></IconBtn>
          <Avatar initials="ML" tone="orange" />
        </div>
      </div>

      {/* Filter chip bar */}
      <div style={{ padding: '14px 32px', borderBottom: '1px solid var(--line)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap', overflow: 'hidden' }}>
        <Btn variant="outline" size="sm" icon={<Icon name="filter" size={13} />}>Filtres · 0</Btn>
        <div className="sy-divider-vert" style={{ height: 24, margin: '0 6px' }} />
        {['Toutes', 'BBQ', 'Animation', 'Buvette', 'Événement', 'Initiation', 'Tournoi', 'Stage'].map((c, i) => (
          <Chip key={c} variant={i === 0 ? 'solid' : 'outline'}>{c}</Chip>
        ))}
        <div style={{ flex: 1 }} />
        <Tabs variant="pill" items={['Pertinence', 'Prix ↑', 'Note ★', 'Distance']} active="Pertinence" />
      </div>

      {/* Main split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', flex: 1, minHeight: 0 }}>
        {/* List side */}
        <div style={{ padding: '20px 32px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="sy-h1" style={{ fontSize: 26 }}>128 prestations près de Rennes</h2>
            <div className="sy-mono">★ 4.7 moyenne · €184 reversés cette semaine</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            <PrestationCard hue="green" />
            <PrestationCard title="Olympiades en entreprise" price={720} hue="orange" goal={0.78} funds="Mini-bus du club" rating={4.9} reviews={62} />
            <PrestationCard title="Anniversaire sportif" price={180} hue="yellow" goal={0.25} funds="Maillots saison" rating={4.6} reviews={28} />
            <PrestationCard title="Buvette événement" price={350} hue="teal" goal={0.55} funds="Vestiaires neufs" rating={4.7} reviews={41} />
            <PrestationCard title="Initiation rugby U10" price={420} hue="rust" goal={0.85} funds="Stage été" rating={5.0} reviews={19} />
            <PrestationCard title="Tournoi pétanque inter-entreprises" price={220} hue="sand" goal={0.15} funds="Boules de compétition" rating={4.5} reviews={12} />
          </div>
        </div>
        {/* Map side */}
        <div style={{ position: 'relative' }}>
          <MarketMap />
        </div>
      </div>
    </div>
  );
}

function MarketplaceMobile() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* sticky search */}
      <div style={{ padding: '14px 16px 10px', background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Btn variant="ghost" size="sm" style={{ padding: 0, width: 36 }}><Icon name="arrowLeft" size={18} /></Btn>
          <div className="sy-search" style={{ flex: 1, height: 40, padding: '0 14px' }}>
            <Icon name="search" size={14} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>BBQ · Rennes · ce week-end</span>
          </div>
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6, overflow: 'hidden' }}>
          <Btn variant="outline" size="sm" icon={<Icon name="filter" size={12} />}>Filtres</Btn>
          <Chip variant="solid" size="sm">BBQ</Chip>
          <Chip variant="outline" size="sm">Animation</Chip>
          <Chip variant="outline" size="sm">Buvette</Chip>
        </div>
      </div>
      <div style={{ padding: '14px 16px 100px', flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div className="sy-h3">128 prestations</div>
          <div className="sy-mono">tri · pertinence</div>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <PrestationCard compact />
          <PrestationCard compact title="Olympiades" price={720} hue="orange" goal={0.78} />
          <PrestationCard compact title="Anniversaire" price={180} hue="yellow" goal={0.25} />
        </div>
      </div>

      {/* floating map cta */}
      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)' }}>
        <Btn variant="dark" size="lg" icon={<Icon name="map" size={16} color="#fff" />}>
          Voir la carte (128)
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { MarketplaceDesktop, MarketplaceMobile, MarketMap });
