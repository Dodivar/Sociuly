// Sociuly — Project management (club POV) + Admin validation

// ============================================================
// CLUB · Project management (master/detail)
// ============================================================
function ProjectListItem({ active, status, title, value, money, days }) {
  const stColor = {
    live:     { dot: 'var(--accent)',   label: 'En cours' },
    funded:   { dot: 'var(--success)',  label: 'Financé' },
    draft:    { dot: 'var(--ink-3)',    label: 'Brouillon' },
    upcoming: { dot: 'var(--highlight)',label: 'À venir' },
  };
  const s = stColor[status];
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12,
      background: active ? 'var(--surface-2)' : 'transparent',
      border: active ? '1.5px solid var(--ink)' : '1.5px solid transparent',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: s.dot }} />
        <div className="sy-mono">{s.label}</div>
        <div style={{ marginLeft: 'auto' }} className="sy-mono sy-num">{days || ''}</div>
      </div>
      <div className="sy-h4" style={{ marginTop: 6 }}>{title}</div>
      <Progress value={value} style={{ marginTop: 10 }} />
      <div className="sy-small sy-muted sy-num" style={{ marginTop: 6 }}>{money}</div>
    </div>
  );
}

function ProjectTimeline({ items }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 26 }}>
      <div style={{ position: 'absolute', left: 9, top: 8, bottom: 8, width: 2, background: 'var(--line)' }} />
      {items.map((it, i) => (
        <div key={i} style={{ position: 'relative', paddingBottom: i === items.length - 1 ? 0 : 22 }}>
          <div style={{ position: 'absolute', left: -22, top: 4, width: 18, height: 18, borderRadius: '50%',
            background: it.icon === 'check' ? 'var(--primary)' : 'var(--surface)',
            border: `2px solid ${it.icon === 'check' ? 'var(--primary)' : 'var(--line-2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {it.icon === 'check' && <Icon name="check" size={10} color="#fff" />}
          </div>
          <div className="sy-mono">{it.date}</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>{it.title}</div>
          {it.body && <div className="sy-small sy-muted" style={{ marginTop: 4 }}>{it.body}</div>}
        </div>
      ))}
    </div>
  );
}

function ProjectsDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden', display: 'flex' }}>
      <ClubSidebar active="projets" />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* LIST (left) */}
        <div style={{ width: 340, borderRight: '1px solid var(--line)',
          background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="sy-h2">Projets</h2>
              <IconBtn size="sm"><Icon name="plus" size={15} /></IconBtn>
            </div>
            <Input placeholder="Rechercher…" icon={<Icon name="search" size={14} />}
              style={{ marginTop: 12, height: 38 }} />
            <div style={{ marginTop: 12 }}>
              <Tabs variant="pill" items={['Tous', 'Live', 'Brouillons']} active="Tous" />
            </div>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden', flex: 1 }}>
            <ProjectListItem active status="live" title="Tournoi national Espagne U17"
              value={0.62} money="€2 480 / €4 000" days="12j" />
            <ProjectListItem status="live" title="Maillots de saison 2026"
              value={0.7} money="€1 050 / €1 500" days="38j" />
            <ProjectListItem status="live" title="Rénovation vestiaires"
              value={0.32} money="€3 200 / €10 000" days="74j" />
            <ProjectListItem status="upcoming" title="Stage été · U13"
              value={0.05} money="€120 / €2 200" days="à ouvrir" />
            <ProjectListItem status="funded" title="Mini-bus du club"
              value={1} money="€8 500 collectés" />
            <ProjectListItem status="draft" title="Tournoi national U13"
              value={0} money="brouillon" />
          </div>
        </div>

        {/* DETAIL (right) */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '28px 36px' }}>
          {/* Title block */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <Chip variant="accent" leadingDot>en cours · projet</Chip>
              <h1 className="sy-h1" style={{ marginTop: 12, fontSize: 36 }}>Tournoi national Espagne U17</h1>
              <p className="sy-body" style={{ marginTop: 8, maxWidth: 640 }}>
                Emmenez nos U17 défendre les couleurs du club au tournoi international d'Alicante, du 12 au 16 juillet.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="outline" icon={<Icon name="eye" size={14} />}>Aperçu public</Btn>
              <Btn variant="dark">Modifier</Btn>
            </div>
          </div>

          {/* Big numbers */}
          <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: 16, alignItems: 'stretch' }}>
            <Card style={{ background: 'var(--accent-soft)', borderColor: 'transparent', padding: 22 }}>
              <div className="sy-mono" style={{ color: 'var(--accent-deep)' }}>Collecté</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 44, lineHeight: 1,
                  fontVariationSettings: 'var(--display-var)' }} className="sy-num">€2 480</div>
                <div className="sy-h4 sy-muted">/ €4 000</div>
              </div>
              <Progress value={0.62} size="tall" style={{ marginTop: 16 }} />
              <div className="sy-small sy-num" style={{ marginTop: 8, color: 'var(--accent-deep)' }}>62% atteint</div>
            </Card>
            <Card>
              <div className="sy-mono">Soutiens</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 32, marginTop: 6,
                fontVariationSettings: 'var(--display-var)' }} className="sy-num">14</div>
              <div className="sy-small sy-muted" style={{ marginTop: 4 }}>réservations</div>
            </Card>
            <Card>
              <div className="sy-mono">Reste</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 32, marginTop: 6,
                color: 'var(--accent)', fontVariationSettings: 'var(--display-var)' }} className="sy-num">12 j</div>
              <div className="sy-small sy-muted" style={{ marginTop: 4 }}>avant clôture</div>
            </Card>
            <Card>
              <div className="sy-mono">Vues</div>
              <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 32, marginTop: 6,
                fontVariationSettings: 'var(--display-var)' }} className="sy-num">1 248</div>
              <div className="sy-small" style={{ marginTop: 4, color: 'var(--success)' }}>+22% sem.</div>
            </Card>
          </div>

          {/* Below: two columns */}
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
            {/* Linked prestations */}
            <Card>
              <div className="sy-mono">Prestations liées · 4</div>
              <h3 className="sy-h2" style={{ marginTop: 4 }}>Ce qui finance ce projet</h3>
              <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                {[
                  ['Barbecue convivial', 280, 8, '€2 240', 'green'],
                  ['Olympiades entreprise', 720, 1, '€720', 'orange'],
                  ['Buvette événement', 350, 2, '€700', 'teal'],
                  ['Initiation volley', 150, 3, '€450', 'yellow'],
                ].map(([t, price, count, total, hue]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px',
                    borderRadius: 12, background: 'var(--surface-2)' }}>
                    <div className="sy-img" style={{ width: 48, height: 48, flex: '0 0 auto',
                      background: { green: '#1f4b3f', orange: '#c0451f', yellow: '#b8861a', teal: '#1f5b58' }[hue],
                      borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <div className="sy-h4">{t}</div>
                      <div className="sy-mono" style={{ marginTop: 2 }}>€{price} · {count} résa</div>
                    </div>
                    <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18,
                      fontVariationSettings: 'var(--display-var)' }} className="sy-num">{total}</div>
                  </div>
                ))}
              </div>
              <Btn variant="outline" block style={{ marginTop: 14 }}
                icon={<Icon name="plus" size={13} />}>Lier une autre prestation</Btn>
            </Card>

            {/* Updates / timeline */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <div className="sy-mono">Mises à jour publiques</div>
                  <h3 className="sy-h2" style={{ marginTop: 4 }}>Journal du projet</h3>
                </div>
                <Btn variant="ghost" size="sm" icon={<Icon name="plus" size={13} />}>Poster</Btn>
              </div>
              <div style={{ marginTop: 16 }}>
                <ProjectTimeline items={[
                  { date: '22 mai · 14h', title: '€420 collectés cette semaine', body: 'Merci à tous nos soutiens — il nous reste 12 jours pour atteindre l\'objectif.', icon: 'check' },
                  { date: '14 mai', title: 'Choix de l\'hébergement à Alicante', body: 'Réservation confirmée — auberge centre-ville, à 800m de la salle.', icon: 'check' },
                  { date: '02 mai', title: 'Projet ouvert au financement', body: '4 prestations liées — objectif €4 000 sur 30 jours.' },
                ]} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN · Validation queue
// ============================================================
function AdminSidebar({ active = 'queue' }) {
  const items = [
    { id: 'queue', label: 'File de validation', icon: 'flag', badge: 7 },
    { id: 'assos', label: 'Associations', icon: 'users' },
    { id: 'presta', label: 'Prestations', icon: 'grid' },
    { id: 'projets', label: 'Projets', icon: 'trophy' },
    { id: 'paiements', label: 'Paiements', icon: 'euro' },
    { id: 'signal', label: 'Signalements', icon: 'bell' },
  ];
  return (
    <div style={{ width: 240, background: 'var(--ink)', height: '100%', padding: '22px 16px',
      display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
        <svg width="24" height="24" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="var(--accent)" />
          <circle cx="16" cy="16" r="6" fill="var(--ink)" />
        </svg>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18,
            color: 'var(--surface)' }}>Sociuly</div>
          <div className="sy-mono" style={{ color: 'var(--ink-3)' }}>Admin</div>
        </div>
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
    </div>
  );
}

function AdminQueueItem({ active, asso, type, date, city, doc }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: 12,
      background: active ? 'var(--surface-2)' : 'transparent',
      border: active ? '1.5px solid var(--ink)' : '1.5px solid transparent',
      cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Avatar initials={asso.split(' ').slice(0, 2).map(p => p[0]).join('').slice(0, 2)} tone="orange" />
        <div style={{ flex: 1 }}>
          <div className="sy-h4">{asso}</div>
          <div className="sy-mono" style={{ marginTop: 2 }}>{city} · {date}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <Chip size="sm" variant="outline">{type}</Chip>
        <Chip size="sm" variant="highlight">{doc}</Chip>
      </div>
    </div>
  );
}

function AdminDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden', display: 'flex' }}>
      <AdminSidebar />

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Queue */}
        <div style={{ width: 320, borderRight: '1px solid var(--line)', background: 'var(--surface)',
          display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h2 className="sy-h2">File · 7</h2>
              <div className="sy-mono">temps moy. 2j</div>
            </div>
            <div style={{ marginTop: 12 }}>
              <Tabs variant="pill" items={['Tout', 'Asso', 'Presta']} active="Tout" />
            </div>
          </div>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4, flex: 1, overflow: 'hidden' }}>
            <AdminQueueItem active asso="AS Saint-Brieuc" type="Nouvelle asso" city="Saint-Brieuc" date="il y a 2h" doc="✓ 4/5 docs" />
            <AdminQueueItem asso="JA Rennes Volley" type="Nouvelle asso" city="Rennes" date="il y a 5h" doc="⚠ 2/5 docs" />
            <AdminQueueItem asso="EC Bruz Foot" type="Prestation" city="Bruz" date="hier" doc="✓ complet" />
            <AdminQueueItem asso="Stade Pontivy" type="Nouvelle asso" city="Pontivy" date="hier" doc="✓ 5/5 docs" />
            <AdminQueueItem asso="USB Volley" type="Prestation" city="Rennes" date="2j" doc="✓ complet" />
          </div>
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '24px 32px' }}>
          {/* head */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar initials="AS" size="xl" tone="orange" />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 className="sy-h1" style={{ fontSize: 28 }}>AS Saint-Brieuc</h1>
                <Chip variant="highlight" size="sm">En attente</Chip>
              </div>
              <div className="sy-small sy-muted" style={{ marginTop: 4 }}>
                Football amateur · Saint-Brieuc (22) · soumis il y a 2h
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn variant="outline">Demander info</Btn>
              <Btn variant="dark">Rejeter</Btn>
              <Btn variant="brand" icon={<Icon name="check" size={14} color="#fff" />}>Approuver</Btn>
            </div>
          </div>

          {/* Below: 2 columns */}
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
            {/* Left: checklist + docs */}
            <div>
              <Card>
                <div className="sy-mono">Checklist conformité</div>
                <h3 className="sy-h2" style={{ marginTop: 4 }}>Validation associative</h3>
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    ['SIRET vérifié', true, 'INSEE'],
                    ['Statuts à jour (déposés en préfecture)', true, '2024'],
                    ['Compte bancaire au nom de l\'asso', true, 'Crédit Mutuel'],
                    ['Attestation d\'assurance RC', true, 'MAIF · valide 2026'],
                    ['Récépissé de déclaration ⓘ', false, 'manquant'],
                  ].map(([t, ok, meta], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)' }}>
                      <span style={{ width: 22, height: 22, borderRadius: 7,
                        background: ok ? 'var(--primary)' : 'var(--highlight-soft)',
                        color: ok ? '#fff' : '#6e5111',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ok ? <Icon name="check" size={13} color="#fff" /> : '!'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div className="sy-h4" style={{ fontSize: 13 }}>{t}</div>
                        <div className="sy-mono" style={{ marginTop: 2 }}>{meta}</div>
                      </div>
                      <Btn variant="ghost" size="sm">{ok ? 'Voir' : 'Demander'}</Btn>
                    </div>
                  ))}
                </div>
              </Card>

              <Card style={{ marginTop: 16 }}>
                <div className="sy-mono">Pièces jointes · 4</div>
                <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {['Statuts.pdf', 'RIB.pdf', 'Assurance.pdf', 'SIRET.png'].map(f => (
                    <div key={f} style={{ aspectRatio: '1', borderRadius: 10, background: 'var(--surface-2)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <Icon name="image" size={26} color="var(--ink-3)" />
                      <div className="sy-mono" style={{ fontSize: 9 }}>{f}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: meta + internal note */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <div className="sy-mono">Identité</div>
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    ['SIRET', '892 401 102 00018'],
                    ['Président', 'Jean-Marc Le Goff'],
                    ['Email', 'contact@as-stbrieuc.fr'],
                    ['Téléphone', '02 96 33 14 22'],
                    ['Adhérents', '184'],
                    ['Sport', 'Football'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="sy-mono">{k}</span>
                      <span className="sy-small" style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="sy-mono">Note interne</div>
                <Textarea defaultValue="OK pour validation — assurance valide, statuts à jour. Manque juste le récépissé de déclaration, à demander avant publication."
                  style={{ marginTop: 10, minHeight: 110 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Avatar initials="MD" tone="green" />
                  <span className="sy-small sy-muted" style={{ alignSelf: 'center' }}>Margaux D. · admin</span>
                  <Btn variant="ghost" size="sm" style={{ marginLeft: 'auto' }}>Sauver note</Btn>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProjectsDesktop, AdminDesktop, AdminSidebar });
