// Sociuly — Club dashboard (the club admin's view)

function ClubSidebar({ active = 'home' }) {
  const items = [
    { id: 'home', label: 'Tableau de bord', icon: 'home' },
    { id: 'presta', label: 'Mes prestations', icon: 'grid' },
    { id: 'resa', label: 'Réservations', icon: 'calendar', badge: 3 },
    { id: 'projets', label: 'Projets', icon: 'trophy' },
    { id: 'rev', label: 'Revenus', icon: 'euro' },
    { id: 'avis', label: 'Avis', icon: 'star' },
    { id: 'team', label: 'Équipe', icon: 'users' },
  ];
  return (
    <div style={{ width: 240, background: 'var(--ink)', height: '100%', padding: '22px 16px',
      display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
        <svg width="24" height="24" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="var(--primary)" />
          <circle cx="16" cy="16" r="6" fill="var(--accent)" />
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18,
            color: 'var(--surface)' }}>Sociuly</div>
          <div className="sy-mono" style={{ color: 'var(--ink-3)' }}>Console club</div>
        </div>
      </div>

      {/* org switcher */}
      <div style={{ padding: '10px 12px', borderRadius: 10, background: '#1f3029',
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials="UV" tone="green" />
        <div style={{ flex: 1 }}>
          <div className="sy-h4" style={{ color: 'var(--surface)', fontSize: 13 }}>USB Volley</div>
          <div className="sy-mono" style={{ color: 'var(--ink-3)' }}>Rennes</div>
        </div>
        <Icon name="chevron" size={14} color="var(--ink-3)" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => (
          <div key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10,
            color: active === it.id ? 'var(--surface)' : 'var(--ink-3)',
            background: active === it.id ? '#1f3029' : 'transparent',
            fontSize: 14, fontWeight: active === it.id ? 600 : 500, cursor: 'pointer',
          }}>
            <Icon name={it.icon} size={16} color={active === it.id ? 'var(--accent)' : 'var(--ink-3)'} />
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge && <span className="sy-badge" style={{ background: 'var(--accent)' }}>{it.badge}</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto', padding: 12, borderRadius: 12, background: '#1f3029' }}>
        <div className="sy-mono" style={{ color: 'var(--highlight)' }}>Saison 2026</div>
        <div className="sy-h4" style={{ color: 'var(--surface)', marginTop: 4 }}>Objectif 80%</div>
        <Progress value={0.62} style={{ marginTop: 8, background: '#2a4036' }} />
        <div className="sy-small" style={{ color: 'var(--ink-3)', marginTop: 6 }}>€18 400 / €30 000</div>
      </div>
    </div>
  );
}

function StatCard({ value, label, delta, deltaPositive = true, icon }) {
  return (
    <Card style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--primary-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={icon} size={16} color="var(--primary)" />
        </div>
        <div className="sy-mono">{label}</div>
      </div>
      <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 32, lineHeight: 1.05,
        marginTop: 14, fontVariationSettings: 'var(--display-var)' }} className="sy-num">{value}</div>
      {delta && (
        <div className="sy-small sy-num" style={{ marginTop: 4,
          color: deltaPositive ? 'var(--success)' : 'var(--danger)' }}>
          {deltaPositive ? '↑' : '↓'} {delta} vs sem. dernière
        </div>
      )}
    </Card>
  );
}

function BookingRow({ date, day, time, name, presta, status, amount, project }) {
  const statusColors = {
    confirmed: { bg: 'var(--primary-soft)', fg: 'var(--primary-deep)', label: 'Confirmée' },
    pending:   { bg: 'var(--highlight-soft)', fg: '#6e5111', label: 'À valider' },
    done:      { bg: 'var(--surface-2)', fg: 'var(--ink-2)', label: 'Terminée' },
  };
  const s = statusColors[status];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '64px 1fr 1fr 1fr 120px 100px',
      gap: 16, alignItems: 'center', padding: '14px 18px', borderTop: '1px solid var(--line)' }}>
      <div style={{ width: 50, height: 50, borderRadius: 10, background: 'var(--surface-2)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sy-mono" style={{ fontSize: 9 }}>{day}</div>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18, lineHeight: 1 }} className="sy-num">{date}</div>
      </div>
      <div>
        <div className="sy-h4">{name}</div>
        <div className="sy-mono" style={{ marginTop: 2 }}>{time}</div>
      </div>
      <div>
        <div className="sy-small" style={{ color: 'var(--ink)', fontWeight: 500 }}>{presta}</div>
        <div className="sy-mono" style={{ marginTop: 2 }}>24 pers.</div>
      </div>
      <div>
        <div className="sy-mono" style={{ color: 'var(--accent-deep)' }}>→ projet</div>
        <div className="sy-small" style={{ marginTop: 2 }}>{project}</div>
      </div>
      <div>
        <span className="sy-chip" style={{ background: s.bg, color: s.fg, fontWeight: 600 }}>
          {s.label}
        </span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18,
          fontVariationSettings: 'var(--display-var)' }} className="sy-num">€{amount}</div>
      </div>
    </div>
  );
}

function FundingChart() {
  // Simple sparkline-style bar chart, 14 days
  const data = [12, 18, 8, 22, 30, 14, 26, 38, 24, 42, 50, 36, 48, 56];
  const max = 56;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140 }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%', height: `${(v / max) * 100}%`,
                background: i >= 11 ? 'var(--accent)' : 'var(--primary)',
                borderRadius: 4,
                opacity: i === data.length - 1 ? 1 : i >= 11 ? .85 : .55,
              }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <div className="sy-mono">12 mai</div>
        <div className="sy-mono">25 mai</div>
      </div>
    </div>
  );
}

function ClubDashboardDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden',
      display: 'flex' }}>
      <ClubSidebar active="home" />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--line)',
          background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 className="sy-h1" style={{ fontSize: 26 }}>Bonjour Margaux 👋</h1>
            <p className="sy-small sy-muted" style={{ marginTop: 2 }}>
              3 réservations à valider · €1 240 collectés cette semaine pour le tournoi U17.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="outline" icon={<Icon name="upload" size={14} />}>Exporter</Btn>
            <Btn variant="primary" icon={<Icon name="plus" size={14} color="#fff" />}>
              Nouvelle prestation
            </Btn>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 32px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <StatCard label="Revenus · 30j" value="€4 280" delta="+18%" icon="euro" />
            <StatCard label="Réservations" value="22" delta="+5" icon="calendar" />
            <StatCard label="Note moyenne" value="4.9" delta="+0.1" icon="star" />
            <StatCard label="Projet U17" value="62%" delta="+8 pt" icon="trophy" />
          </div>

          {/* 2-col content */}
          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
            {/* Bookings list */}
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="sy-mono">Réservations à venir</div>
                  <h3 className="sy-h2" style={{ marginTop: 4 }}>Prochaines prestations</h3>
                </div>
                <Tabs variant="pill" items={['Toutes', 'À valider', 'Confirmées']} active="Toutes" />
              </div>
              <BookingRow date="14" day="SAM JUIN" time="16h00–19h00" name="Camille Léger"
                presta="Barbecue convivial" status="pending" amount="280" project="Tournoi U17" />
              <BookingRow date="21" day="SAM JUIN" time="14h00–17h00" name="Lycée Bréquigny"
                presta="Olympiades inter-classes" status="confirmed" amount="720" project="Tournoi U17" />
              <BookingRow date="28" day="SAM JUIN" time="11h00–14h00" name="Famille Dupuy"
                presta="Anniversaire enfant" status="confirmed" amount="180" project="Maillots" />
              <BookingRow date="05" day="SAM JUIL" time="18h00–22h00" name="Mairie de Rennes"
                presta="Buvette fête de quartier" status="confirmed" amount="350" project="Vestiaires" />
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)', textAlign: 'center' }}>
                <Btn variant="ghost" size="sm" iconRight={<Icon name="arrow" size={13} />}>
                  Voir les 22 réservations
                </Btn>
              </div>
            </Card>

            {/* Right column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Funding sparkline */}
              <Card>
                <div className="sy-mono">Tournoi U17 · 14 derniers jours</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 30,
                    fontVariationSettings: 'var(--display-var)' }} className="sy-num">€2 480</div>
                  <div className="sy-mono" style={{ color: 'var(--success)' }}>↑ +€420</div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <FundingChart />
                </div>
                <Progress value={0.62} size="tall" style={{ marginTop: 16 }} />
                <div className="sy-small sy-num" style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                  <span>62% atteint</span>
                  <span style={{ color: 'var(--accent-deep)' }}>reste 12j</span>
                </div>
              </Card>

              {/* Tasks */}
              <Card>
                <div className="sy-mono">À faire</div>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['Valider la résa du 14 juin', 'urgent', 'orange'],
                    ['Répondre à 2 messages', '', 'yellow'],
                    ['Mettre à jour le projet U17', '', 'green'],
                  ].map(([t, urg, tone]) => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%',
                        background: tone === 'orange' ? 'var(--accent)' : tone === 'yellow' ? 'var(--highlight)' : 'var(--primary)' }} />
                      <div style={{ flex: 1 }}>
                        <div className="sy-small" style={{ color: 'var(--ink)', fontWeight: 500 }}>{t}</div>
                        {urg && <div className="sy-mono" style={{ color: 'var(--accent-deep)', fontSize: 9 }}>{urg}</div>}
                      </div>
                      <Icon name="arrow" size={13} color="var(--ink-3)" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ClubDashboardDesktop, ClubSidebar });
