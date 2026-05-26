// Dashboard admin + validation associations

function AdminSidebar({ active = 0 }) {
  const items = [
    ['◧', 'Vue globale'],
    ['✓', 'Validation assos'],
    ['◰', 'Modération'],
    ['€', 'Finances'],
    ['◷', 'Signalements'],
    ['☰', 'Logs'],
    ['⚙', 'Réglages'],
  ];
  return (
    <div style={{ padding: '14px 10px', borderRight: `1px solid ${WIRE.line2}`, background: WIRE.paper2, height: '100%' }}>
      <div className="wf-h2" style={{ padding: '0 8px 6px' }}>Sociuly</div>
      <div className="wf-mono" style={{ padding: '0 8px 12px' }}>ADMIN</div>
      {items.map((it, i) => (
        <div key={i} style={{
          padding: '7px 8px', borderRadius: 6, marginBottom: 2,
          background: i === active ? WIRE.ink : 'transparent',
          color: i === active ? '#fff' : WIRE.ink2,
          fontSize: 12, fontWeight: i === active ? 700 : 500,
          display: 'flex', alignItems: 'center', gap: 8,
          position: 'relative',
        }}>
          <span style={{ width: 16, textAlign: 'center' }}>{it[0]}</span>
          {it[1]}
          {i === 1 && (
            <span style={{
              marginLeft: 'auto', background: WIRE.accent, color: '#fff',
              borderRadius: 999, padding: '0 6px', fontSize: 10, fontWeight: 700,
            }}>7</span>
          )}
        </div>
      ))}
    </div>
  );
}

function AssoValidationRow({ name = 'AS Saint-Brieuc Hand', sport = 'Handball', loc = 'Saint-Brieuc (22)', docs = 4, when = 'il y a 2j', status = 'à vérifier' }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 1.6fr 1fr 0.8fr 0.7fr 1fr',
      gap: 10, alignItems: 'center', padding: '10px 12px',
      borderBottom: `1px solid ${WIRE.line2}`, fontSize: 12,
    }}>
      <div className="wf-img" style={{ width: 32, height: 32, borderRadius: '50%' }}>logo</div>
      <div>
        <div className="wf-h3" style={{ fontSize: 12 }}>{name}</div>
        <div className="wf-mono">{sport} · {loc}</div>
      </div>
      <div className="wf-mono">{docs} pièce(s) jointes</div>
      <Chip>{status}</Chip>
      <div className="wf-mono">{when}</div>
      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
        <Btn sm ghost>Voir</Btn>
        <Btn sm>✕</Btn>
        <Btn sm primary>✓ Valider</Btn>
      </div>
    </div>
  );
}

// ============================================================
// VARIATION A — Admin classique : KPIs en hero, validation en table
// ============================================================
function AdminA_D() {
  return (
    <Frame kind="desktop" label="A · Admin — Vue globale" tag="KPIs + table" height={920}>
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', height: '100%' }}>
        <AdminSidebar active={0} />
        <div style={{ padding: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="wf-mono">SOCIULY · ADMIN</div>
              <div className="wf-h1" style={{ fontSize: 22, marginTop: 4 }}>Vue globale — mai 2026</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn sm ghost>Exporter CSV</Btn>
              <Btn sm ghost>Période ▾</Btn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginTop: 14 }}>
            <KPICard label="ASSOS ACTIVES" value="238" delta="+ 12 ce mois" />
            <KPICard label="CA PLATEFORME" value="€18.4k" delta="+ 18%" accent />
            <KPICard label="RÉSERVATIONS" value="1 612" delta="+ 246" />
            <KPICard label="COMMISSIONS" value="€1 240" delta="+ 18%" />
            <KPICard label="REVERSÉ AUX CLUBS" value="€17.2k" accent />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginTop: 14 }}>
            <div className="wf-box" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="wf-h3">CA & commissions · 6 mois</div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span className="wf-tab">CA</span><span className="wf-tab on">Commissions</span><span className="wf-tab">Reversé</span>
                </div>
              </div>
              <MiniChart kind="area" h={150} />
            </div>
            <div className="wf-box" style={{ padding: 12 }}>
              <div className="wf-h3">Top catégories</div>
              <MiniChart kind="bars" h={150} />
            </div>
          </div>

          {/* validation table */}
          <div className="wf-box" style={{ marginTop: 14, padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `1px solid ${WIRE.line2}`,
            }}>
              <div>
                <div className="wf-h3">Associations en attente de validation</div>
                <div className="wf-mono">7 demandes · les plus anciennes en haut</div>
              </div>
              <Btn sm ghost>Tout traiter →</Btn>
            </div>
            <AssoValidationRow />
            <AssoValidationRow name="ESC Lorient Foot" sport="Football" loc="Lorient (56)" docs={5} when="il y a 4j" />
            <AssoValidationRow name="Volley Club Vannes" sport="Volley" loc="Vannes (56)" docs={3} when="il y a 5j" status="docs incomplets" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function AdminA_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · admin (rare)">
      <MobileNav title="Sociuly Admin" />
      <div style={{ padding: '10px 14px' }}>
        <div className="wf-mono">VUE GLOBALE</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <KPICard label="ASSOS" value="238" delta="+12" />
          <KPICard label="CA" value="€18.4k" delta="+18%" accent />
          <KPICard label="RÉSAS" value="1 612" />
          <KPICard label="COMM." value="€1 240" />
        </div>
        <div className="wf-h3" style={{ marginTop: 14 }}>À valider (7)</div>
        <div className="wf-box" style={{ marginTop: 6 }}>
          {['AS Saint-Brieuc', 'ESC Lorient', 'VC Vannes'].map((n, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: 8, borderBottom: i < 2 ? `1px solid ${WIRE.line2}` : 'none',
            }}>
              <div className="wf-img" style={{ width: 28, height: 28, borderRadius: '50%' }} />
              <div style={{ flex: 1, fontSize: 12 }}>{n}</div>
              <Btn sm primary>✓</Btn><Btn sm>✕</Btn>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — Validation-first : file d'attente en hero
// ============================================================
function AdminB_D() {
  return (
    <Frame kind="desktop" label="B · Admin — File de validation en hero" tag="ops-first" height={920}>
      <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', height: '100%' }}>
        <AdminSidebar active={1} />
        <div style={{ padding: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="wf-mono">SOCIULY · ADMIN · VALIDATION</div>
              <div className="wf-h1" style={{ fontSize: 22, marginTop: 4 }}>7 associations en attente</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Chip>tous · 7</Chip><Chip solid>à vérifier · 5</Chip><Chip>docs manquants · 2</Chip>
            </div>
          </div>

          {/* split: list left + review pane right */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginTop: 14 }}>
            <div className="wf-box" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', borderBottom: `1px solid ${WIRE.line2}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="wf-mono">DEMANDES · TRI : ANCIENNETÉ</div>
                <Btn sm ghost>Filtres</Btn>
              </div>
              <AssoValidationRow />
              <AssoValidationRow name="ESC Lorient Foot" sport="Football" loc="Lorient (56)" docs={5} when="il y a 4j" />
              <AssoValidationRow name="Volley Club Vannes" sport="Volley" loc="Vannes (56)" docs={3} when="il y a 5j" status="docs incomplets" />
              <AssoValidationRow name="Rugby Quimper" sport="Rugby" loc="Quimper (29)" docs={6} when="il y a 1 sem." />
              <AssoValidationRow name="Pétanque Concarneau" sport="Pétanque" loc="Concarneau" docs={4} when="il y a 1 sem." />
            </div>

            {/* review pane */}
            <div className="wf-box" style={{ padding: 14, background: WIRE.accentSoft, borderColor: WIRE.accent }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="wf-img" style={{ width: 48, height: 48, borderRadius: '50%' }}>logo</div>
                <div style={{ flex: 1 }}>
                  <div className="wf-h2">AS Saint-Brieuc Hand</div>
                  <div className="wf-mono">Handball · Saint-Brieuc (22) · soumis il y a 2j</div>
                </div>
                <Chip>à vérifier</Chip>
              </div>

              <div className="wf-divider-dashed" />
              <div className="wf-mono">PIÈCES JOINTES</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 6 }}>
                {['Statuts asso (PDF)', 'RNA / Récépissé', 'RIB', 'Pièce identité prés.'].map((d, i) => (
                  <div key={i} className="wf-box" style={{ padding: 8, display: 'flex', alignItems: 'center', gap: 6, background: WIRE.paper }}>
                    <div style={{ width: 22, height: 28, border: `1.2px solid ${WIRE.ink}`, borderRadius: 3, background: WIRE.paper2 }} />
                    <div style={{ flex: 1, fontSize: 11 }}>{d}</div>
                    <Btn sm ghost>↗</Btn>
                  </div>
                ))}
              </div>

              <div className="wf-divider-dashed" />
              <div className="wf-mono">CHECKLIST</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                {[
                  ['Statuts conformes', true],
                  ['RNA vérifié', true],
                  ['Identité du président', true],
                  ['RIB lisible', false],
                ].map(([t, ok], i) => (
                  <label key={i} style={{ display: 'flex', gap: 6, fontSize: 12 }}>
                    <span style={{
                      width: 14, height: 14, borderRadius: 3,
                      border: `1.3px solid ${WIRE.ink}`,
                      background: ok ? WIRE.accent : WIRE.paper,
                      color: '#fff', fontSize: 10, fontWeight: 700,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    }}>{ok ? '✓' : ''}</span>
                    {t}
                  </label>
                ))}
              </div>

              <div className="wf-divider-dashed" />
              <div className="wf-mono">NOTE INTERNE</div>
              <FakeTextarea />

              <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                <Btn ghost>Demander un doc</Btn>
                <Btn ghost>Refuser</Btn>
                <Btn primary block style={{ flex: 1 }}>✓ Valider l'association</Btn>
              </div>
            </div>
          </div>

          {/* mini KPIs strap */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
            <KPICard label="VALIDÉES CE MOIS" value="12" />
            <KPICard label="DÉLAI MOYEN" value="2.4j" />
            <KPICard label="REFUSÉES" value="1" />
            <KPICard label="SIGNALEMENTS" value="3" delta="à traiter" accent />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function AdminB_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · validation">
      <MobileNav title="À valider · 7" />
      <div style={{ padding: '10px 14px', paddingBottom: 60 }}>
        {[
          ['AS Saint-Brieuc Hand', 'Handball · 22'],
          ['ESC Lorient Foot', 'Football · 56'],
          ['Volley Club Vannes', 'Volley · 56'],
          ['Rugby Quimper', 'Rugby · 29'],
        ].map(([n, s], i) => (
          <div key={i} className="wf-box" style={{ padding: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="wf-img" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              <div style={{ flex: 1 }}>
                <div className="wf-h3" style={{ fontSize: 12 }}>{n}</div>
                <div className="wf-mono">{s}</div>
              </div>
              <Chip>{i === 2 ? 'docs ?' : 'à vérif.'}</Chip>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              <Btn sm ghost block style={{ flex: 1 }}>Voir</Btn>
              <Btn sm primary block style={{ flex: 1 }}>✓ Valider</Btn>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

Object.assign(window, { AdminA_D, AdminA_M, AdminB_D, AdminB_M, AdminSidebar, AssoValidationRow });
