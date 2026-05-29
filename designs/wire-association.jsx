// Page association wireframe variations

function AssoStats({ items, style, compact }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: compact ? 8 : 14, ...style }}>
      {items.map((it, i) => (
        <div key={i} className="wf-box" style={{ padding: compact ? 8 : 12 }}>
          <div className="wf-mono">{it[1]}</div>
          <div className="wf-h1" style={{ fontSize: compact ? 18 : 22, color: WIRE.accent, marginTop: 2 }}>{it[0]}</div>
        </div>
      ))}
    </div>
  );
}

function TimelineProject({ title = 'Maillots saison 25/26', date = 'oct. 2025', value = 0.8, done }) {
  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      <div style={{ width: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 14, height: 14, borderRadius: '50%',
          border: `1.5px solid ${WIRE.ink}`,
          background: done ? WIRE.accent : WIRE.paper,
        }} />
        <div style={{ flex: 1, width: 1.5, background: WIRE.line, marginTop: 4 }} />
      </div>
      <div style={{ flex: 1, paddingBottom: 14 }}>
        <div className="wf-mono">{date}</div>
        <div className="wf-h3" style={{ marginTop: 2 }}>{title}</div>
        <Progress value={value} style={{ marginTop: 6 }} />
      </div>
    </div>
  );
}

// ============================================================
// VARIATION A — Cover photo + tabs (Airbnb-ish)
// ============================================================
function AssoA_D() {
  return (
    <Frame kind="desktop" label="A · Association — Cover + tabs" tag="profil-club">
      <LandingNavD />
      <Img label="[ photo équipe · bannière ]" h={170} style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderTopWidth: 0 }} />
      <div style={{ padding: '0 22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: -32, position: 'relative' }}>
          <div className="wf-img" style={{ width: 80, height: 80, borderRadius: '50%', background: WIRE.paper2 }}>logo</div>
          <div style={{ flex: 1, paddingBottom: 10 }}>
            <div className="wf-h1" style={{ fontSize: 24 }}>USB Volley — Rennes</div>
            <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center', color: WIRE.ink2, fontSize: 12 }}>
              <Chip accent>✓ Asso vérifiée</Chip>
              <span>Volley-ball</span><span>·</span><span>Rennes (35)</span><span>·</span><span>Fondée en 1998</span>
            </div>
          </div>
          <Btn>♡ Suivre</Btn>
          <Btn primary>Réserver une prestation</Btn>
        </div>

        <AssoStats style={{ marginTop: 16 }} items={[
          ['€8 240', 'récoltés via Sociuly'],
          ['3', 'projets financés'],
          ['28', 'prestations réalisées'],
          ['4.9 ★', 'note moyenne'],
        ]} />

        <div style={{ marginTop: 16, display: 'flex', gap: 18, borderBottom: `1px solid ${WIRE.line}` }}>
          {['À propos', 'Prestations (12)', 'Projets', 'Avis (47)'].map((t, i) => (
            <div key={t} style={{
              paddingBottom: 8, fontSize: 13, fontWeight: i === 1 ? 700 : 500,
              color: i === 1 ? WIRE.ink : WIRE.ink2,
              borderBottom: i === 1 ? `2px solid ${WIRE.accent}` : 'none',
              marginBottom: -1,
            }}>{t}</div>
          ))}
        </div>

        <div className="wf-h2" style={{ marginTop: 14 }}>Prestations disponibles</div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <PrestationCard title="Barbecue du club" />
          <PrestationCard title="Initiation volley" goal={0.7} />
          <PrestationCard title="Tournoi entreprise" goal={0.25} />
          <PrestationCard title="Buvette événement" goal={0.55} />
        </div>

        <div className="wf-h2" style={{ marginTop: 16 }}>Projets en cours</div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <ProjectCard title="Tournoi Espagne U17" value={0.62} money="€2 480 / €4 000" />
          <ProjectCard title="Vestiaires neufs" value={0.32} money="€3.2k / €10k" count="12 résas" />
          <ProjectCard title="Mini-bus 9 places" value={0.55} money="€5.5k / €10k" count="32 résas" />
        </div>
      </div>
    </Frame>
  );
}

function AssoA_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile">
      <Img label="bannière" h={110} style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderTopWidth: 0 }} />
      <div style={{ padding: '0 14px' }}>
        <div className="wf-img" style={{ width: 56, height: 56, borderRadius: '50%', marginTop: -24, background: WIRE.paper2 }}>logo</div>
        <div className="wf-h2" style={{ marginTop: 8 }}>USB Volley — Rennes</div>
        <div style={{ marginTop: 4, fontSize: 11, color: WIRE.ink2 }}>
          <Chip accent>✓ vérifié</Chip> · Volley-ball · Rennes
        </div>

        <AssoStats compact style={{ marginTop: 12 }} items={[
          ['€8.2k', 'récoltés'],
          ['3', 'projets'],
          ['4.9★', 'note'],
        ]} />

        <div style={{ marginTop: 12, display: 'flex', gap: 14, borderBottom: `1px solid ${WIRE.line}` }}>
          {['Presta', 'Projets', 'Avis'].map((t, i) => (
            <span key={t} style={{
              fontSize: 12, fontWeight: i === 0 ? 700 : 500,
              color: i === 0 ? WIRE.ink : WIRE.ink2,
              borderBottom: i === 0 ? `2px solid ${WIRE.accent}` : 'none',
              paddingBottom: 6, marginBottom: -1,
            }}>{t}</span>
          ))}
        </div>

        <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
          <PrestationCard />
          <PrestationCard title="Initiation volley" goal={0.7} />
        </div>
      </div>
      <div className="wf-sticky" style={{ position: 'absolute', bottom: 8, left: 8, right: 8, padding: 10 }}>
        <Btn primary block>Voir les prestations</Btn>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — Left profile rail + content right
// ============================================================
function AssoB_D() {
  return (
    <Frame kind="desktop" label="B · Association — Profil rail gauche" tag="rail-left">
      <LandingNavD />
      <div style={{ padding: '14px 22px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18 }}>
        {/* left rail */}
        <div className="wf-box" style={{ padding: 14 }}>
          <Img label="logo carré" h={110} />
          <div className="wf-h2" style={{ marginTop: 10 }}>USB Volley</div>
          <div className="wf-mono">Volley-ball · Rennes</div>
          <Chip accent style={{ marginTop: 6 }}>✓ Asso vérifiée</Chip>

          <div className="wf-divider-dashed" />

          <div className="wf-mono">CONTACT</div>
          <div className="wf-skel" style={{ height: 6, marginTop: 4, width: '70%' }} />
          <div className="wf-skel" style={{ height: 6, marginTop: 4, width: '50%' }} />

          <div className="wf-divider-dashed" />

          <div className="wf-mono">À PROPOS</div>
          <div className="wf-skel" style={{ height: 6, marginTop: 4, width: '90%' }} />
          <div className="wf-skel" style={{ height: 6, marginTop: 3, width: '80%' }} />
          <div className="wf-skel" style={{ height: 6, marginTop: 3, width: '70%' }} />

          <Btn primary block style={{ marginTop: 12 }}>Réserver →</Btn>
          <Btn ghost block style={{ marginTop: 6 }}>Contacter</Btn>
        </div>

        {/* content */}
        <div>
          <AssoStats items={[
            ['€8 240', 'récoltés via Sociuly'],
            ['3', 'projets financés'],
            ['28', 'prestations réalisées'],
            ['4.9 ★', 'note moyenne'],
          ]} />

          <div className="wf-h2" style={{ marginTop: 16 }}>Projets soutenus par leurs prestations</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            <ProjectCard title="Tournoi Espagne U17" value={0.62} money="€2 480 / €4 000" />
            <ProjectCard title="Vestiaires neufs" value={0.32} money="€3.2k / €10k" count="12 résas" />
          </div>

          <div className="wf-h2" style={{ marginTop: 16 }}>Toutes les prestations (12)</div>
          <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <PrestationCard title="Barbecue du club" />
            <PrestationCard title="Initiation volley" goal={0.7} />
            <PrestationCard title="Tournoi entreprise" goal={0.25} />
            <PrestationCard title="Buvette" goal={0.55} />
            <PrestationCard title="Stage d'été" goal={0.85} />
            <PrestationCard title="Anniversaire" goal={0.15} />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function AssoB_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile">
      <MobileNav title="USB Volley" />
      <div style={{ padding: '10px 14px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="wf-img" style={{ width: 56, height: 56, borderRadius: 10 }}>logo</div>
          <div>
            <div className="wf-h2">USB Volley</div>
            <div className="wf-mono">Volley · Rennes</div>
            <Chip accent>✓ vérifié</Chip>
          </div>
        </div>
        <AssoStats compact style={{ marginTop: 12 }} items={[['€8.2k', 'récoltés'], ['3', 'projets'], ['28', 'presta']]} />

        <div className="wf-h3" style={{ marginTop: 14 }}>Projets soutenus</div>
        <div style={{ marginTop: 6, display: 'grid', gap: 8 }}>
          <ProjectCard title="Tournoi Espagne" value={0.62} money="€2.5k / €4k" />
        </div>

        <div className="wf-h3" style={{ marginTop: 12 }}>Prestations</div>
        <div style={{ marginTop: 6, display: 'grid', gap: 8 }}>
          <PrestationCard />
        </div>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION C — Story-first: projets timeline en tête
// ============================================================
function AssoC_D() {
  return (
    <Frame kind="desktop" label="C · Association — Story / timeline projets" tag="story-first">
      <LandingNavD />
      <div style={{ padding: '22px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="wf-img" style={{ width: 58, height: 58, borderRadius: '50%' }}>logo</div>
          <div style={{ flex: 1 }}>
            <div className="wf-h1" style={{ fontSize: 24 }}>USB Volley — Rennes</div>
            <div style={{ marginTop: 4 }}>
              <Chip accent>✓ vérifié</Chip>
              <span style={{ marginLeft: 6, fontSize: 12, color: WIRE.ink2 }}>Volley-ball · Rennes · depuis 1998 · ★ 4.9</span>
            </div>
          </div>
          <Btn>♡ Suivre</Btn>
          <Btn primary>Réserver →</Btn>
        </div>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24 }}>
          {/* timeline left */}
          <div>
            <div className="wf-h2">Le parcours du club, financé grâce à vous</div>
            <Note ink style={{ display: 'block', marginTop: 4, fontFamily: WIRE.sans, fontSize: 11 }}>
              timeline projets, du + ancien au + récent
            </Note>
            <div style={{ marginTop: 12 }}>
              <TimelineProject done date="févr. 2025" title="✓ Tenue d'arbitrage régionale" value={1} />
              <TimelineProject done date="juin 2025" title="✓ Stage U15 Brest" value={1} />
              <TimelineProject date="oct. 2025" title="Maillots saison 25/26" value={0.8} />
              <TimelineProject date="déc. 2025" title="Tournoi Espagne U17" value={0.62} />
              <TimelineProject date="2026 →" title="Rénovation vestiaires" value={0.32} />
            </div>
          </div>

          {/* right: stats + prestations */}
          <div>
            <AssoStats items={[
              ['€8 240', 'récoltés'],
              ['3', 'projets financés'],
              ['28', 'prestations'],
            ]} />

            <div className="wf-callout" style={{ marginTop: 12 }}>
              <div className="wf-mono">PROJET ACTUEL</div>
              <div className="wf-h2">Tournoi Espagne U17</div>
              <Progress value={0.62} style={{ marginTop: 8 }} />
              <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · 14 résas · reste 12j</div>
              <Btn primary sm style={{ marginTop: 10 }}>Aider en réservant →</Btn>
            </div>

            <div className="wf-h2" style={{ marginTop: 14 }}>Prestations actives</div>
            <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <PrestationCard title="Barbecue club" />
              <PrestationCard title="Initiation volley" goal={0.7} />
              <PrestationCard title="Tournoi entreprise" goal={0.25} />
              <PrestationCard title="Buvette" goal={0.55} />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function AssoC_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · story">
      <MobileNav title="USB Volley" />
      <div style={{ padding: '10px 14px' }}>
        <div className="wf-callout">
          <div className="wf-mono">PROJET ACTUEL</div>
          <div className="wf-h2">Tournoi Espagne U17</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000</div>
          <Btn primary block sm style={{ marginTop: 8 }}>Aider en réservant →</Btn>
        </div>
        <div className="wf-h3" style={{ marginTop: 14 }}>Le parcours du club</div>
        <div style={{ marginTop: 8 }}>
          <TimelineProject done date="juin 25" title="✓ Stage Brest" value={1} />
          <TimelineProject date="oct. 25" title="Maillots 25/26" value={0.8} />
          <TimelineProject date="déc. 25" title="Tournoi Espagne" value={0.62} />
        </div>
      </div>
    </Frame>
  );
}

Object.assign(window, {
  AssoA_D, AssoA_M, AssoB_D, AssoB_M, AssoC_D, AssoC_M, AssoStats, TimelineProject,
});
