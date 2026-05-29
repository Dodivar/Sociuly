// Sociuly — Association profile screen

function AssoProfileDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <TopNav active="associations" />

      {/* Cover */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden',
        background: 'linear-gradient(135deg, #1f4b3f 0%, #14332b 100%)' }}>
        <svg viewBox="0 0 1440 220" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .35 }}>
          <circle cx="1200" cy="60" r="80" fill="#f1c14a" opacity=".7" />
          <path d="M0 170 Q 400 130 720 150 T 1440 130 L 1440 220 L 0 220 Z" fill="#e8623d" opacity=".5" />
          <path d="M0 200 Q 500 170 900 190 T 1440 180 L 1440 220 L 0 220 Z" fill="#14332b" />
        </svg>
      </div>

      <div style={{ padding: '0 48px', position: 'relative', marginTop: -60 }}>
        {/* identity */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginBottom: 28 }}>
          <div style={{ width: 120, height: 120, borderRadius: 24, background: 'var(--surface)',
            border: '4px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--display)', fontWeight: 700, fontSize: 44, color: 'var(--primary)',
            fontVariationSettings: 'var(--display-var)' }}>UV</div>
          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="sy-h1" style={{ fontSize: 36 }}>USB Volley · Union Sportive de Bréquigny</h1>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--primary)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="check" size={14} color="#fff" />
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
              <span className="sy-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="pin" size={13} /> Rennes (35200)
              </span>
              <span className="sy-small sy-muted">·</span>
              <Stars value={4.9} size={13} mono />
              <span className="sy-small sy-muted">·</span>
              <span className="sy-small">220 adhérents · 4 équipes</span>
              <Chip variant="primary" size="sm"><Icon name="check" size={10} /> vérifié</Chip>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
            <Btn variant="outline">Suivre</Btn>
            <Btn variant="dark">Contacter</Btn>
            <IconBtn><Icon name="share" size={16} /></IconBtn>
          </div>
        </div>

        {/* About + impact strap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28 }}>
          <div>
            <h2 className="sy-h2">À propos</h2>
            <p className="sy-body" style={{ marginTop: 10, fontSize: 16, color: 'var(--ink)' }}>
              Club de volley-ball amateur fondé en 1978, l'USB regroupe 4 équipes (loisirs, U13, U17, seniors).
              Nous proposons des prestations conviviales pour financer notre saison sportive et les déplacements
              de nos jeunes en compétition.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 18 }}>
              {[
                ['42', 'prestations', 'depuis 2024'],
                ['€18 400', 'reversés', 'à 7 projets'],
                ['4.9 / 5', 'satisfaction', '47 avis'],
              ].map((s, i) => (
                <Card key={i}>
                  <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 28,
                    fontVariationSettings: 'var(--display-var)' }} className="sy-num">{s[0]}</div>
                  <div className="sy-h4" style={{ marginTop: 4 }}>{s[1]}</div>
                  <div className="sy-mono" style={{ marginTop: 2 }}>{s[2]}</div>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <Card variant="accent" style={{ padding: 20, borderRadius: 'var(--radius-lg)' }}>
              <div className="sy-mono">projet phare en cours</div>
              <div className="sy-h2" style={{ marginTop: 6 }}>Tournoi national U17 · Espagne</div>
              <Progress value={0.62} size="tall" style={{ marginTop: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div className="sy-small sy-num">€2 480 / €4 000</div>
                <div className="sy-small sy-num">reste 12j</div>
              </div>
              <Btn variant="primary" block style={{ marginTop: 14 }}>Soutenir le projet</Btn>
            </Card>
          </div>
        </div>

        {/* Tabs to navigate club content */}
        <div style={{ marginTop: 32, borderBottom: '1px solid var(--line)' }}>
          <Tabs variant="underline" active="prestations"
            items={[
              { id: 'prestations', label: 'Prestations · 12' },
              { id: 'projets', label: 'Projets · 4' },
              { id: 'avis', label: 'Avis · 47' },
              { id: 'team', label: 'Équipe' },
            ]} />
        </div>

        {/* prestations grid */}
        <div style={{ marginTop: 20, paddingBottom: 36, display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          <PrestationCard hue="green" />
          <PrestationCard title="Olympiades en entreprise" price={720} hue="orange" goal={0.78} funds="Mini-bus du club" />
          <PrestationCard title="Anniversaire sportif" price={180} hue="yellow" goal={0.25} funds="Maillots saison" rating={4.6} />
          <PrestationCard title="Initiation volley" price={150} hue="teal" goal={0.5} funds="Tournoi Espagne" rating={4.9} />
        </div>
      </div>
    </div>
  );
}

function AssoProfileMobile() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <div style={{ position: 'relative', height: 130, overflow: 'hidden',
        background: 'linear-gradient(135deg, #1f4b3f 0%, #14332b 100%)' }}>
        <svg viewBox="0 0 380 130" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .35 }}>
          <circle cx="310" cy="35" r="36" fill="#f1c14a" opacity=".7" />
          <path d="M0 100 Q 100 80 180 90 T 380 75 L 380 130 L 0 130 Z" fill="#e8623d" opacity=".5" />
        </svg>
        <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between' }}>
          <IconBtn><Icon name="arrowLeft" size={16} /></IconBtn>
          <IconBtn><Icon name="share" size={16} /></IconBtn>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -36 }}>
        <div style={{ width: 76, height: 76, borderRadius: 18, background: 'var(--surface)',
          border: '3px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--display)', fontWeight: 700, fontSize: 28, color: 'var(--primary)' }}>UV</div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 className="sy-h1" style={{ fontSize: 22 }}>USB Volley</h1>
            <Icon name="check" size={16} color="var(--primary)" />
          </div>
          <div className="sy-small sy-muted" style={{ marginTop: 4 }}>Rennes · 220 adhérents · ★ 4.9</div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <Btn variant="dark" size="sm" block>Contacter</Btn>
          <Btn variant="outline" size="sm" block>Suivre</Btn>
        </div>

        <Card variant="accent" style={{ marginTop: 18, padding: 14 }}>
          <div className="sy-mono">Projet phare</div>
          <div className="sy-h4" style={{ marginTop: 4 }}>Tournoi national U17 · Espagne</div>
          <Progress value={0.62} style={{ marginTop: 10 }} />
          <div className="sy-small sy-num" style={{ marginTop: 6 }}>€2 480 / €4 000 · reste 12j</div>
        </Card>

        <div className="sy-h3" style={{ marginTop: 22 }}>Prestations · 12</div>
        <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
          <PrestationCard compact />
          <PrestationCard compact title="Olympiades" price={720} hue="orange" goal={0.78} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AssoProfileDesktop, AssoProfileMobile });
