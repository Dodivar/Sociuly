// Marketplace / Recherche wireframe variations

function MarketTopBar() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 22px', borderBottom: `1px solid ${WIRE.line2}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div className="wf-h2">Sociuly</div>
        <div className="wf-sticky" style={{ padding: '4px 10px', display: 'flex', gap: 8, alignItems: 'center', boxShadow: 'none', border: `1.2px solid ${WIRE.line}` }}>
          <span className="wf-mono">QUOI</span>
          <b style={{ fontSize: 12 }}>Toutes prestations</b>
          <span style={{ color: WIRE.line }}>|</span>
          <span className="wf-mono">OÙ</span>
          <b style={{ fontSize: 12 }}>Rennes · 10km</b>
          <span style={{ color: WIRE.line }}>|</span>
          <span className="wf-mono">QUAND</span>
          <b style={{ fontSize: 12 }}>cette semaine</b>
          <Btn sm primary>↻</Btn>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Btn sm ghost>Carte</Btn>
        <Btn sm ghost>Se connecter</Btn>
      </div>
    </div>
  );
}

function FilterGroup({ title, options, multi }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="wf-h3" style={{ marginBottom: 6 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {options.map((o, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: WIRE.ink2 }}>
            <span style={{
              width: 14, height: 14, border: `1.3px solid ${WIRE.ink}`,
              borderRadius: multi ? 3 : 7, background: i === 0 ? WIRE.accent : WIRE.paper,
            }} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// VARIATION A — Airbnb classic: sidebar filters + grid
// ============================================================
function MarketA_D() {
  return (
    <Frame kind="desktop" label="A · Marketplace — Sidebar filtres" tag="grid + sidebar">
      <MarketTopBar />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 0, height: 'calc(100% - 49px)' }}>
        {/* sidebar */}
        <div style={{ padding: '14px 14px', borderRight: `1px solid ${WIRE.line2}`, overflow: 'hidden' }}>
          <div className="wf-h3" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            Filtres <span className="wf-mono">reset</span>
          </div>
          <FilterGroup title="Catégorie" multi options={['Repas / BBQ', 'Animation sportive', 'Événement', 'Buvette']} />
          <FilterGroup title="Type d'asso" multi options={['Club sport', 'Asso jeunes', 'École de sport']} />
          <FilterGroup title="Capacité" options={['< 20', '20–50', '50–100', '100+']} />
          <div className="wf-h3" style={{ marginBottom: 6 }}>Budget</div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span className="wf-mono">€50</span><span className="wf-mono">€2000</span></div>
          <div className="wf-progress" style={{ marginTop: 4 }}><i style={{ width: '55%' }} /></div>
        </div>
        {/* grid */}
        <div style={{ padding: '14px 18px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div className="wf-h2">128 prestations près de Rennes</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="wf-tab on">Pertinence</span>
              <span className="wf-tab">Prix ↑</span>
              <span className="wf-tab">Note ★</span>
              <span className="wf-tab">Distance</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            <PrestationCard title="Barbecue du club" price="€280" goal={0.4} />
            <PrestationCard title="Olympiades en entreprise" price="€720" goal={0.7} />
            <PrestationCard title="Anniversaire sportif" price="€180" goal={0.25} />
            <PrestationCard title="Buvette événement" price="€350" goal={0.55} />
            <PrestationCard title="Initiation rugby" price="€420" goal={0.85} />
            <PrestationCard title="Tournoi pétanque" price="€220" goal={0.15} />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function MarketA_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile">
      <MobileNav title="Marketplace" />
      <div style={{ padding: '10px 14px' }}>
        <div className="wf-sticky" style={{ padding: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className="wf-mono" style={{ flex: 1 }}>Rennes · 10km · cette semaine</span>
          <Btn sm>Filtres</Btn>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          <Chip solid>Repas / BBQ</Chip>
          <Chip>Animation</Chip>
          <Chip>Événement</Chip>
          <Chip>Buvette</Chip>
        </div>
        <div className="wf-mono" style={{ marginTop: 10 }}>128 prestations · trié par pertinence</div>
        <div style={{ marginTop: 8, display: 'grid', gap: 10 }}>
          <PrestationCard />
          <PrestationCard title="Olympiades" goal={0.7} />
          <PrestationCard title="Anniversaire sportif" goal={0.25} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
        <Btn primary block>🗺 Voir la carte (128)</Btn>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — Map split: 50/50 with map
// ============================================================
function MapSketch({ withImpact }) {
  return (
    <div style={{
      position: 'relative', height: '100%',
      background: `
        repeating-linear-gradient(0deg, transparent 0 28px, rgba(0,0,0,.04) 28px 29px),
        repeating-linear-gradient(90deg, transparent 0 28px, rgba(0,0,0,.04) 28px 29px),
        ${WIRE.paper2}`,
    }}>
      {/* roads */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path d="M 20 80 Q 200 40 380 130 T 700 200" stroke="#bcb9b0" fill="none" strokeWidth="6" />
        <path d="M 60 280 Q 240 240 460 320 T 720 360" stroke="#bcb9b0" fill="none" strokeWidth="4" />
        <path d="M 200 20 L 230 400" stroke="#bcb9b0" fill="none" strokeWidth="3" />
        <path d="M 480 20 L 500 400" stroke="#bcb9b0" fill="none" strokeWidth="3" />
      </svg>
      {/* pins */}
      {[[180, 110, '€280'], [340, 160, '€180'], [430, 90, '€720'], [560, 220, '€350'], [260, 260, '€220'], [500, 310, '€420']].map(([x, y, p], i) => (
        <div key={i} style={{
          position: 'absolute', left: x, top: y,
          background: i === 1 ? WIRE.ink : WIRE.paper, color: i === 1 ? '#fff' : WIRE.ink,
          border: `1.4px solid ${WIRE.ink}`, borderRadius: 999,
          padding: '3px 8px', fontFamily: WIRE.sans, fontWeight: 700, fontSize: 11,
          boxShadow: '2px 2px 0 -1px rgba(0,0,0,.4)',
        }}>{p}</div>
      ))}
      {withImpact && (
        <div className="wf-callout" style={{ position: 'absolute', left: 16, bottom: 16, right: 16 }}>
          <div className="wf-mono">3 PROJETS PROCHES</div>
          <div className="wf-h3">€8 300 collectés cette semaine près de vous</div>
        </div>
      )}
      {/* controls */}
      <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="wf-box" style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>＋</div>
        <div className="wf-box" style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>−</div>
      </div>
    </div>
  );
}

function MarketB_D() {
  return (
    <Frame kind="desktop" label="B · Marketplace — Split map" tag="map · proximité">
      <MarketTopBar />
      <div style={{ padding: '10px 18px', display: 'flex', gap: 8, alignItems: 'center', borderBottom: `1px solid ${WIRE.line2}` }}>
        {['Toutes', 'BBQ', 'Animation', 'Événement', 'Buvette', 'Initiation', 'Tournoi'].map((c, i) => (
          <Chip key={c} solid={i === 0}>{c}</Chip>
        ))}
        <div style={{ flex: 1 }} />
        <Note ink>filtres en chip horizontal</Note>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100% - 49px - 42px)' }}>
        <div style={{ padding: 12, overflow: 'hidden', borderRight: `1px solid ${WIRE.line2}` }}>
          <div className="wf-mono" style={{ marginBottom: 8 }}>128 RÉSULTATS · 4.2 ★ moyenne · €184 reversés à Rennes</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <PrestationCard title="Barbecue club" />
            <PrestationCard title="Olympiades" goal={0.7} />
            <PrestationCard title="Anniversaire" goal={0.25} />
            <PrestationCard title="Buvette" goal={0.55} />
            <PrestationCard title="Initiation rugby" goal={0.85} />
            <PrestationCard title="Tournoi pétanque" goal={0.15} />
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <MapSketch withImpact />
        </div>
      </div>
    </Frame>
  );
}

function MarketB_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · map first">
      <div style={{ height: 360, position: 'relative' }}>
        <MapSketch />
        <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: 6 }}>
          <div className="wf-sticky" style={{ flex: 1, padding: '6px 10px' }}>
            <span className="wf-mono">Rennes · BBQ</span>
          </div>
          <Btn sm>Filtres</Btn>
        </div>
      </div>
      <div style={{ padding: 12, background: WIRE.paper }}>
        <div style={{ width: 36, height: 4, background: WIRE.line, borderRadius: 2, margin: '0 auto 8px' }} />
        <div className="wf-mono">128 RÉSULTATS · glissez ↑</div>
        <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
          <PrestationCard />
          <PrestationCard title="Olympiades" goal={0.7} />
        </div>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION C — Editorial: featured projects + faceted grid below
// ============================================================
function MarketC_D() {
  return (
    <Frame kind="desktop" label="C · Marketplace — Projets en tête" tag="featured-first">
      <MarketTopBar />
      <div style={{ padding: '14px 22px' }}>
        {/* featured: réserver pour un projet */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div className="wf-h2">🔥 Projets bientôt financés — donnez le coup de pouce final</div>
          <Note ink>scroll horizontal →</Note>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <div className="wf-callout" style={{ padding: 10 }}>
            <Img label="projet 1" h={80} />
            <div className="wf-h3" style={{ marginTop: 6 }}>Tournoi Espagne U17</div>
            <Progress value={0.92} style={{ marginTop: 6 }} />
            <div className="wf-mono" style={{ marginTop: 4 }}>92% · 3 résa restantes</div>
          </div>
          <div className="wf-box" style={{ padding: 10 }}>
            <Img label="projet 2" h={80} />
            <div className="wf-h3" style={{ marginTop: 6 }}>Vestiaires neufs</div>
            <Progress value={0.32} style={{ marginTop: 6 }} />
            <div className="wf-mono" style={{ marginTop: 4 }}>32%</div>
          </div>
          <div className="wf-box" style={{ padding: 10 }}>
            <Img label="projet 3" h={80} />
            <div className="wf-h3" style={{ marginTop: 6 }}>Maillots saison</div>
            <Progress value={0.7} style={{ marginTop: 6 }} />
            <div className="wf-mono" style={{ marginTop: 4 }}>70%</div>
          </div>
          <div className="wf-box" style={{ padding: 10 }}>
            <Img label="projet 4" h={80} />
            <div className="wf-h3" style={{ marginTop: 6 }}>Mini-bus club</div>
            <Progress value={0.55} style={{ marginTop: 6 }} />
            <div className="wf-mono" style={{ marginTop: 4 }}>55%</div>
          </div>
        </div>

        {/* facets horizontal */}
        <div style={{ marginTop: 18, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="wf-h3">Filtrer :</span>
          <Chip solid>Toutes</Chip>
          <Chip>Repas / BBQ</Chip>
          <Chip>Animation</Chip>
          <Chip>Événement</Chip>
          <Chip>Buvette</Chip>
          <span style={{ color: WIRE.line }}>|</span>
          <Chip>≤ €300</Chip>
          <Chip>10–20 pers.</Chip>
          <Chip>ce week-end</Chip>
          <Chip accent>+ filtres</Chip>
        </div>

        {/* grid */}
        <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <PrestationCard />
          <PrestationCard title="Olympiades" goal={0.7} />
          <PrestationCard title="Anniversaire sportif" goal={0.25} />
          <PrestationCard title="Buvette" goal={0.55} />
          <PrestationCard title="Initiation rugby" goal={0.85} />
          <PrestationCard title="Tournoi pétanque" goal={0.15} />
          <PrestationCard title="Apéro de fin de saison" goal={0.45} />
          <PrestationCard title="Stage d'été" goal={0.62} />
        </div>
      </div>
    </Frame>
  );
}

function MarketC_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile">
      <MobileNav title="Marketplace" />
      <div style={{ padding: '10px 14px' }}>
        <div className="wf-mono">PROJETS BIENTÔT FINANCÉS →</div>
        <div style={{ marginTop: 6, display: 'flex', gap: 8, overflow: 'hidden' }}>
          <div className="wf-callout" style={{ minWidth: 150, padding: 8 }}>
            <Img label="projet" h={60} />
            <div className="wf-h3" style={{ marginTop: 4, fontSize: 12 }}>Tournoi Espagne</div>
            <Progress value={0.92} style={{ marginTop: 6 }} />
          </div>
          <div className="wf-box" style={{ minWidth: 150, padding: 8 }}>
            <Img label="projet" h={60} />
            <div className="wf-h3" style={{ marginTop: 4, fontSize: 12 }}>Maillots</div>
            <Progress value={0.7} style={{ marginTop: 6 }} />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Chip solid>Toutes</Chip>
          <Chip>BBQ</Chip>
          <Chip>Animation</Chip>
          <Chip>Buvette</Chip>
        </div>
        <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
          <PrestationCard />
          <PrestationCard title="Olympiades" goal={0.7} />
        </div>
      </div>
    </Frame>
  );
}

Object.assign(window, {
  MarketA_D, MarketA_M, MarketB_D, MarketB_M, MarketC_D, MarketC_M,
});
