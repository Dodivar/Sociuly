// Dashboard association wireframe variations

function DashSidebar({ active = 0, compact }) {
  const items = [
    ['◧', 'Dashboard'],
    ['◰', 'Prestations'],
    ['☷', 'Réservations'],
    ['€', 'Revenus'],
    ['◐', 'Projets'],
    ['✦', 'Avis'],
    ['⚙', 'Paramètres'],
  ];
  return (
    <div style={{
      padding: '14px 10px', borderRight: `1px solid ${WIRE.line2}`,
      background: WIRE.paper2, height: '100%', width: compact ? 60 : 200,
    }}>
      {!compact && <div className="wf-h2" style={{ padding: '0 8px 12px' }}>Sociuly</div>}
      {compact && <div className="wf-h2" style={{ textAlign: 'center', marginBottom: 10 }}>S.</div>}
      {items.map((it, i) => (
        <div key={i} style={{
          padding: compact ? '8px 0' : '7px 8px', borderRadius: 6, marginBottom: 2,
          background: i === active ? WIRE.ink : 'transparent',
          color: i === active ? '#fff' : WIRE.ink2,
          fontSize: 12, fontWeight: i === active ? 700 : 500,
          display: 'flex', alignItems: 'center', gap: 8, justifyContent: compact ? 'center' : 'flex-start',
        }}>
          <span style={{ width: 16, textAlign: 'center' }}>{it[0]}</span>
          {!compact && it[1]}
        </div>
      ))}
      {!compact && (
        <div className="wf-box-soft" style={{ marginTop: 16, padding: 8 }}>
          <div className="wf-mono">PROJET EN COURS</div>
          <div className="wf-h3" style={{ fontSize: 11, marginTop: 2 }}>Tournoi Espagne</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>62%</div>
        </div>
      )}
    </div>
  );
}

function KPICard({ label, value, delta, accent }) {
  return (
    <div className="wf-box" style={{ padding: 12 }}>
      <div className="wf-mono">{label}</div>
      <div className="wf-h1" style={{ fontSize: 24, marginTop: 4, color: accent ? WIRE.accent : WIRE.ink }}>{value}</div>
      {delta && <div className="wf-mono" style={{ marginTop: 4, color: WIRE.accent }}>{delta}</div>}
    </div>
  );
}

function MiniChart({ kind = 'area', h = 130 }) {
  // hand-drawn-ish sketchy chart
  if (kind === 'area') {
    return (
      <svg viewBox="0 0 320 130" style={{ width: '100%', height: h }}>
        <defs>
          <pattern id="charthatch" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M 0 6 L 6 0" stroke={WIRE.accent} strokeOpacity="0.18" strokeWidth="1" />
          </pattern>
        </defs>
        {/* baseline */}
        {[0, 32, 64, 96, 128].map((y, i) => (
          <line key={i} x1="0" y1={y} x2="320" y2={y} stroke={WIRE.line2} strokeWidth="1" strokeDasharray="2 3" />
        ))}
        <path d="M 0 100 L 40 85 L 80 92 L 120 70 L 160 60 L 200 65 L 240 48 L 280 32 L 320 28 L 320 130 L 0 130 Z" fill="url(#charthatch)" />
        <path d="M 0 100 L 40 85 L 80 92 L 120 70 L 160 60 L 200 65 L 240 48 L 280 32 L 320 28" stroke={WIRE.accent} fill="none" strokeWidth="2" strokeLinejoin="round" />
        {/* x labels */}
        {['jan', 'fév', 'mar', 'avr', 'mai', 'juin'].map((m, i) => (
          <text key={i} x={i * 60 + 16} y="128" fill={WIRE.ink3} fontFamily={WIRE.mono} fontSize="9">{m}</text>
        ))}
      </svg>
    );
  }
  // bars
  return (
    <svg viewBox="0 0 320 130" style={{ width: '100%', height: h }}>
      {[60, 90, 45, 110, 70, 100, 85].map((v, i) => (
        <rect key={i} x={i * 44 + 10} y={130 - v} width="28" height={v}
          fill={i === 3 ? WIRE.accent : WIRE.paper2} stroke={WIRE.ink} strokeWidth="1.2" />
      ))}
    </svg>
  );
}

function ReservationRow({ name = 'Camille L.', what = 'Barbecue club', date = '14 juin', status = 'Confirmée', amount = '€280' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 0.8fr 0.6fr', gap: 8,
      padding: '8px 10px', borderBottom: `1px solid ${WIRE.line2}`, alignItems: 'center', fontSize: 12 }}>
      <div>{name}</div>
      <div className="wf-muted">{what}</div>
      <div className="wf-mono">{date}</div>
      <Chip accent={status === 'Confirmée'} style={{ fontSize: 10 }}>{status}</Chip>
      <div style={{ fontWeight: 700 }}>{amount}</div>
    </div>
  );
}

// ============================================================
// VARIATION A — Classic SaaS: sidebar + KPI grid + chart
// ============================================================
function DashA_D() {
  return (
    <Frame kind="desktop" label="A · Dashboard — SaaS classique" tag="sidebar + KPIs">
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
        <DashSidebar active={0} />
        <div style={{ padding: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="wf-mono">USB VOLLEY · DASHBOARD</div>
              <div className="wf-h1" style={{ fontSize: 24, marginTop: 4 }}>Bonjour Marie 👋</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn sm ghost>Exporter</Btn>
              <Btn sm primary>+ Nouvelle prestation</Btn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
            <KPICard label="REVENUS · MAI" value="€1 840" delta="+ 18% vs avril" accent />
            <KPICard label="RÉSERVATIONS" value="14" delta="3 en attente" />
            <KPICard label="PROJET EN COURS" value="62%" delta="€2 480 / €4 000" accent />
            <KPICard label="NOTE MOYENNE" value="4.9 ★" delta="47 avis" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14, marginTop: 14 }}>
            <div className="wf-box" style={{ padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div className="wf-h3">Revenus sur 6 mois</div>
                <div style={{ display: 'flex', gap: 4 }}><span className="wf-tab on">6M</span><span className="wf-tab">1A</span></div>
              </div>
              <MiniChart kind="area" h={140} />
            </div>
            <div className="wf-box" style={{ padding: 12 }}>
              <div className="wf-h3">Prestations populaires</div>
              <MiniChart kind="bars" h={140} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginTop: 14 }}>
            <div className="wf-box" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${WIRE.line2}` }}>
                <div className="wf-h3">Prochaines réservations</div>
                <span className="wf-mono">voir tout →</span>
              </div>
              <ReservationRow />
              <ReservationRow name="Hugo M." what="Olympiades entreprise" date="21 juin" amount="€720" />
              <ReservationRow name="Léa D." what="Anniversaire sportif" date="28 juin" status="En attente" amount="€180" />
              <ReservationRow name="Pauline V." what="Buvette tournoi" date="5 juil." amount="€350" />
            </div>
            <div className="wf-callout" style={{ padding: 12 }}>
              <div className="wf-mono">PROJET FINANCÉ</div>
              <div className="wf-h2">Tournoi Espagne U17</div>
              <Img label="photo projet" h={70} style={{ marginTop: 8 }} />
              <Progress value={0.62} style={{ marginTop: 8 }} />
              <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · reste 12j</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <Btn sm ghost>Voir détails</Btn>
                <Btn sm primary>Partager →</Btn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DashA_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · dashboard">
      <MobileNav title="USB Volley" />
      <div style={{ padding: '10px 14px' }}>
        <div className="wf-mono">DASHBOARD · MAI</div>
        <div className="wf-h2" style={{ marginTop: 2 }}>Bonjour Marie 👋</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
          <KPICard label="REVENUS" value="€1.8k" delta="+18%" accent />
          <KPICard label="RÉSAS" value="14" delta="3 attente" />
        </div>

        <div className="wf-callout" style={{ marginTop: 12 }}>
          <div className="wf-mono">PROJET</div>
          <div className="wf-h3">Tournoi Espagne U17</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000</div>
        </div>

        <div className="wf-box" style={{ marginTop: 10, padding: 8 }}>
          <div className="wf-h3" style={{ marginBottom: 6 }}>Revenus</div>
          <MiniChart kind="area" h={80} />
        </div>

        <div className="wf-h3" style={{ marginTop: 12 }}>Prochaines résas</div>
        <div style={{ marginTop: 4 }}>
          <ReservationRow />
          <ReservationRow name="Hugo M." what="Olympiades" date="21/06" amount="€720" />
        </div>
      </div>
      {/* tab bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52,
        borderTop: `1px solid ${WIRE.line2}`, background: WIRE.paper,
        display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', alignItems: 'center' }}>
        {['◧', '◰', '+', '€', '⚙'].map((g, i) => (
          <div key={i} style={{
            textAlign: 'center', fontSize: 16, fontWeight: 700,
            color: i === 0 ? WIRE.accent : WIRE.ink3,
            transform: i === 2 ? 'scale(1.4)' : 'none',
          }}>{g}</div>
        ))}
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — Project-first dashboard: impact hero, KPIs below
// ============================================================
function DashB_D() {
  return (
    <Frame kind="desktop" label="B · Dashboard — Projet en hero" tag="impact-first SaaS">
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
        <DashSidebar active={4} />
        <div style={{ padding: 20, overflow: 'hidden' }}>
          <div className="wf-mono">USB VOLLEY · PROJETS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
            <div className="wf-h1" style={{ fontSize: 22 }}>Vos prestations financent — voici l'impact ce mois-ci</div>
            <Btn sm primary>+ Nouveau projet</Btn>
          </div>

          {/* big project hero */}
          <div className="wf-callout" style={{ marginTop: 14, padding: 16, display: 'grid', gridTemplateColumns: '180px 1fr 200px', gap: 14, alignItems: 'center' }}>
            <Img label="photo projet" h={120} />
            <div>
              <div className="wf-mono">PROJET ACTUEL</div>
              <div className="wf-h1" style={{ fontSize: 22, marginTop: 4 }}>Tournoi Espagne U17</div>
              <div className="wf-mono" style={{ marginTop: 4 }}>14 résas ont contribué · reste 12 jours</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <Progress value={0.62} style={{ flex: 1 }} />
                <span className="wf-h3">62%</span>
              </div>
              <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Btn primary>Partager le projet</Btn>
              <Btn ghost sm>Mettre à jour photos</Btn>
              <Btn ghost sm>Marquer comme atteint</Btn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
            <KPICard label="€ REVERSÉS À CE PROJET" value="€2 480" accent delta="+€430 cette sem." />
            <KPICard label="REVENUS · MAI" value="€1 840" delta="+18%" />
            <KPICard label="RÉSAS À VENIR" value="6" delta="prochaine: 14/06" />
            <KPICard label="NOTE" value="4.9 ★" delta="47 avis" />
          </div>

          {/* contributions list */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginTop: 14 }}>
            <div className="wf-box" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px', borderBottom: `1px solid ${WIRE.line2}` }}>
                <div className="wf-h3">Réservations qui ont financé ce projet</div>
              </div>
              <ReservationRow what="Barbecue (+€84)" />
              <ReservationRow name="Hugo M." what="Olympiades (+€216)" date="18 mai" amount="€720" />
              <ReservationRow name="Léa D." what="Anniversaire (+€54)" date="11 mai" amount="€180" />
              <ReservationRow name="Pauline V." what="Buvette (+€105)" date="4 mai" amount="€350" />
            </div>
            <div className="wf-box" style={{ padding: 12 }}>
              <div className="wf-h3">Tendance contributions</div>
              <MiniChart kind="area" h={130} />
              <div className="wf-mono" style={{ marginTop: 4 }}>+€430 cette semaine ↑</div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DashB_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · impact">
      <MobileNav title="Projets" />
      <div style={{ padding: '10px 14px', paddingBottom: 60 }}>
        <div className="wf-callout">
          <div className="wf-mono">PROJET ACTUEL</div>
          <div className="wf-h2">Tournoi Espagne U17</div>
          <Img label="projet" h={90} style={{ marginTop: 8 }} />
          <Progress value={0.62} style={{ marginTop: 8 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · 62%</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <Btn sm primary>Partager</Btn>
            <Btn sm ghost>Photos</Btn>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
          <KPICard label="REVERSÉ" value="€2.5k" accent />
          <KPICard label="REVENUS MAI" value="€1.8k" delta="+18%" />
        </div>

        <div className="wf-h3" style={{ marginTop: 12 }}>Ont financé</div>
        <div style={{ marginTop: 4 }}>
          <ReservationRow what="Barbecue (+€84)" />
          <ReservationRow name="Hugo M." what="Olympiades" date="18/05" amount="€720" />
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52,
        borderTop: `1px solid ${WIRE.line2}`, background: WIRE.paper,
        display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', alignItems: 'center' }}>
        {['◧', '◰', '+', '◐', '⚙'].map((g, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: i === 3 ? WIRE.accent : WIRE.ink3 }}>{g}</div>
        ))}
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION C — Compact icon rail + agenda-style today view
// ============================================================
function DashC_D() {
  return (
    <Frame kind="desktop" label="C · Dashboard — Aujourd'hui / agenda" tag="day-view">
      <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', height: '100%' }}>
        <DashSidebar active={2} compact />
        <div style={{ padding: '18px 20px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="wf-mono">VENDREDI 14 JUIN · USB VOLLEY</div>
              <div className="wf-h1" style={{ fontSize: 22, marginTop: 4 }}>3 prestations aujourd'hui · €1 180 collectés</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <Btn sm ghost>Semaine</Btn>
              <Btn sm primary>Aujourd'hui</Btn>
              <Btn sm ghost>Mois</Btn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginTop: 14 }}>
            {/* agenda left */}
            <div className="wf-box" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 10, borderBottom: `1px solid ${WIRE.line2}` }} className="wf-h3">Agenda du jour</div>
              {[
                ['10h', 'Briefing bénévoles', 'Salle club', 'Interne'],
                ['16h', 'Barbecue · Camille L.', '4 rue des Acacias', '€280'],
                ['19h30', 'Buvette tournoi U13', 'Gymnase Tabor', '€220'],
              ].map((r, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr 1fr 80px',
                  padding: '10px', borderBottom: `1px solid ${WIRE.line2}`,
                  gap: 8, alignItems: 'center', fontSize: 12,
                }}>
                  <div className="wf-h3" style={{ color: WIRE.accent }}>{r[0]}</div>
                  <div className="wf-h3">{r[1]}</div>
                  <div className="wf-muted">{r[2]}</div>
                  <div style={{ textAlign: 'right', fontWeight: 700 }}>{r[3]}</div>
                </div>
              ))}
            </div>

            <div className="wf-callout" style={{ padding: 12 }}>
              <div className="wf-mono">VOTRE OBJECTIF</div>
              <div className="wf-h2">Tournoi Espagne U17</div>
              <Progress value={0.62} style={{ marginTop: 8 }} />
              <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · +€500 cette semaine si l'agenda du jour est complet</div>
              <div className="wf-divider-dashed" />
              <div className="wf-mono">PARTAGEZ POUR ACCÉLÉRER</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <Btn sm>Lien</Btn><Btn sm>Insta</Btn><Btn sm>Facebook</Btn>
              </div>
            </div>
          </div>

          {/* mini KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 14 }}>
            <KPICard label="CETTE SEMAINE" value="€640" accent />
            <KPICard label="CE MOIS" value="€1 840" delta="+18%" />
            <KPICard label="PRESTATIONS ACTIVES" value="12" />
            <KPICard label="AVIS RÉCENTS" value="4.9 ★" delta="+ 5 cette sem." />
          </div>

          {/* mini chart */}
          <div className="wf-box" style={{ marginTop: 14, padding: 12 }}>
            <div className="wf-h3">Revenus 30 derniers jours</div>
            <MiniChart kind="bars" h={100} />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DashC_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · agenda">
      <MobileNav title="Aujourd'hui" />
      <div style={{ padding: '10px 14px', paddingBottom: 60 }}>
        <div className="wf-mono">VENDREDI 14 JUIN</div>
        <div className="wf-h2" style={{ marginTop: 2 }}>3 presta · €1 180</div>

        <div className="wf-callout" style={{ marginTop: 10 }}>
          <div className="wf-mono">OBJECTIF</div>
          <div className="wf-h3">Tournoi Espagne U17</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>62% · +€500 si la journée est complète</div>
        </div>

        <div className="wf-h3" style={{ marginTop: 14 }}>Agenda</div>
        <div className="wf-box" style={{ marginTop: 4 }}>
          {[
            ['10h', 'Briefing bénévoles', 'Interne'],
            ['16h', 'BBQ Camille L.', '€280'],
            ['19h30', 'Buvette tournoi', '€220'],
          ].map((r, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 60px', gap: 6,
              padding: '8px 10px', borderBottom: i < 2 ? `1px solid ${WIRE.line2}` : 'none',
              alignItems: 'center', fontSize: 12,
            }}>
              <div style={{ color: WIRE.accent, fontWeight: 700 }}>{r[0]}</div>
              <div>{r[1]}</div>
              <div style={{ textAlign: 'right', fontWeight: 700 }}>{r[2]}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 52,
        borderTop: `1px solid ${WIRE.line2}`, background: WIRE.paper,
        display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', alignItems: 'center' }}>
        {['◧', '◰', '☷', '€', '⚙'].map((g, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: i === 2 ? WIRE.accent : WIRE.ink3 }}>{g}</div>
        ))}
      </div>
    </Frame>
  );
}

Object.assign(window, {
  DashA_D, DashA_M, DashB_D, DashB_M, DashC_D, DashC_M, DashSidebar, KPICard, MiniChart, ReservationRow,
});
