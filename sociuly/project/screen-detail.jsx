// Sociuly — Prestation detail screen

function DetailDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <TopNav active="prestations" />

      <div style={{ padding: '20px 48px 40px' }}>
        {/* breadcrumb + title */}
        <div className="sy-mono" style={{ marginBottom: 8 }}>
          Marketplace › BBQ › <span style={{ color: 'var(--ink)' }}>Barbecue convivial USB Volley</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 18 }}>
          <div>
            <h1 className="sy-h1" style={{ fontSize: 36 }}>Barbecue convivial du club USB Volley</h1>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <Stars value={4.9} />
              <span className="sy-small" style={{ color: 'var(--ink)' }}>4.9 · 47 avis</span>
              <span className="sy-small sy-muted">·</span>
              <span className="sy-small" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="pin" size={13} /> Rennes (35)
              </span>
              <Chip variant="primary"><Icon name="check" size={11} /> Asso vérifiée</Chip>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="ghost" size="sm" icon={<Icon name="heart" size={14} />}>Sauver</Btn>
            <Btn variant="ghost" size="sm" icon={<Icon name="share" size={14} />}>Partager</Btn>
          </div>
        </div>

        {/* gallery */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr', gap: 8, height: 380, borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div className="sy-img" style={{ gridRow: '1 / 3', borderRadius: 0,
            background: 'linear-gradient(165deg, #1f4b3f 0%, #14332b 100%)' }}>
            <svg viewBox="0 0 220 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4 }}>
              <circle cx="160" cy="60" r="36" fill="#f1c14a" opacity=".7" />
              <path d="M0 170 Q 60 130 110 150 T 220 130 L 220 220 L 0 220 Z" fill="#e8623d" opacity=".55" />
              <path d="M0 200 Q 80 175 130 195 T 220 185 L 220 220 L 0 220 Z" fill="#14332b" />
            </svg>
            <span className="sy-img-label" style={{ position: 'absolute', bottom: 16, left: 16 }}>Photo principale · scène BBQ</span>
          </div>
          <div className="sy-img" style={{ borderRadius: 0,
            background: 'linear-gradient(135deg, #e8623d 0%, #c0451f 100%)' }} />
          <div className="sy-img" style={{ borderRadius: 0,
            background: 'linear-gradient(135deg, #f1c14a 0%, #b8861a 100%)' }} />
          <div className="sy-img" style={{ borderRadius: 0,
            background: 'linear-gradient(135deg, #1f5b58 0%, #14332b 100%)' }} />
          <div className="sy-img" style={{ borderRadius: 0, position: 'relative',
            background: 'linear-gradient(135deg, #8a6b3e 0%, #5a4525 100%)' }}>
            <Btn variant="dark" size="sm" style={{ position: 'absolute', bottom: 12, right: 12 }}
              icon={<Icon name="grid" size={13} color="#fff" />}>
              Voir 12 photos
            </Btn>
          </div>
        </div>

        {/* Main grid: content + right rail */}
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 36 }}>
          {/* MAIN */}
          <div>
            {/* asso strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 22,
              borderBottom: '1px solid var(--line)' }}>
              <Avatar initials="UV" size="lg" tone="green" />
              <div style={{ flex: 1 }}>
                <div className="sy-h3">Proposé par USB Volley</div>
                <div className="sy-small sy-muted">42 prestations · membre depuis 2024 · répond en 2h</div>
              </div>
              <Btn variant="outline" size="sm" iconRight={<Icon name="arrow" size={13} />}>Voir l'asso</Btn>
            </div>

            {/* facts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 22 }}>
              {[
                ['Capacité', '10–60 pers.', 'users'],
                ['Durée', '≈ 3 heures', 'calendar'],
                ['Lieu', 'Chez vous', 'pin'],
                ['Inclus', 'Matériel + 6 bénévoles', 'check'],
              ].map(([k, v, ic]) => (
                <Card key={k}>
                  <Icon name={ic} size={18} color="var(--primary)" />
                  <div className="sy-mono" style={{ marginTop: 8 }}>{k}</div>
                  <div className="sy-h4" style={{ marginTop: 2 }}>{v}</div>
                </Card>
              ))}
            </div>

            {/* description */}
            <h2 className="sy-h2" style={{ marginTop: 28 }}>L'expérience</h2>
            <p className="sy-body" style={{ marginTop: 10, fontSize: 16, color: 'var(--ink)' }}>
              Notre équipe de bénévoles vient cuisiner chez vous : grillades préparées sur place,
              salades de saison, ambiance conviviale assurée. Idéal pour les anniversaires, les
              événements d'entreprise ou les fêtes de quartier.
            </p>
            <p className="sy-body" style={{ marginTop: 8 }}>
              Tout le matériel est fourni, les bénévoles s'occupent du service du début à la fin.
              Vous profitez, on s'occupe du reste — et chaque réservation finance directement notre projet de saison.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 18 }}>
              {['Matériel de cuisson', 'Tables et nappes', '6 bénévoles', 'Service de A à Z',
                'Vaisselle compostable', 'Boissons sur option'].map(t => (
                <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: 'var(--primary)',
                    color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                    <Icon name="check" size={13} color="#fff" />
                  </span>
                  <span className="sy-small" style={{ color: 'var(--ink)' }}>{t}</span>
                </div>
              ))}
            </div>

            {/* calendar */}
            <h2 className="sy-h2" style={{ marginTop: 28 }}>Disponibilités</h2>
            <Card style={{ marginTop: 12, padding: 18, display: 'flex', gap: 18, alignItems: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 12, background: 'var(--accent-soft)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="sy-mono" style={{ color: 'var(--accent-deep)' }}>SAM</div>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 30, lineHeight: 1,
                  color: 'var(--accent-deep)', fontVariationSettings: 'var(--display-var)' }} className="sy-num">14</div>
                <div className="sy-mono" style={{ color: 'var(--accent-deep)' }}>JUIN</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="sy-mono">Prochaine date</div>
                <div className="sy-h3" style={{ marginTop: 4 }}>Samedi 14 juin · 16h00</div>
                <div className="sy-small sy-muted" style={{ marginTop: 4 }}>+ 8 autres créneaux ce mois-ci</div>
              </div>
              <Btn variant="outline" iconRight={<Icon name="chevron" size={14} />}>Voir le calendrier</Btn>
            </Card>

            {/* reviews */}
            <div style={{ marginTop: 28, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h2 className="sy-h2">Avis (47)</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stars value={4.9} size={14} />
                <span className="sy-h3">4.9</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
              <ReviewCard />
              <ReviewCard name="Hugo M." tone="green" rating={5} body="Excellent moment d'équipe, et le club a pu financer ses maillots. Service nickel, ambiance au top." />
            </div>
          </div>

          {/* RIGHT RAIL */}
          <div>
            <div style={{ position: 'sticky', top: 16 }}>
              <BookingCard />
              <div style={{ marginTop: 16 }}>
                <ImpactHero />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailMobile() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* hero photo */}
      <div style={{ position: 'relative', height: 260 }}>
        <div className="sy-img" style={{ borderRadius: 0, width: '100%', height: '100%',
          background: 'linear-gradient(165deg, #1f4b3f 0%, #14332b 100%)' }}>
          <svg viewBox="0 0 380 260" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4 }}>
            <circle cx="290" cy="80" r="44" fill="#f1c14a" opacity=".7" />
            <path d="M0 200 Q 100 160 180 180 T 380 160 L 380 260 L 0 260 Z" fill="#e8623d" opacity=".55" />
          </svg>
        </div>
        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between' }}>
          <IconBtn><Icon name="arrowLeft" size={16} /></IconBtn>
          <div style={{ display: 'flex', gap: 8 }}>
            <IconBtn><Icon name="heart" size={16} /></IconBtn>
            <IconBtn><Icon name="share" size={16} /></IconBtn>
          </div>
        </div>
        <Chip variant="solid" size="sm" style={{ position: 'absolute', bottom: 14, right: 16 }}>1 / 12</Chip>
      </div>

      <div style={{ padding: '18px 16px 110px' }}>
        <h1 className="sy-h1" style={{ fontSize: 24 }}>Barbecue convivial USB Volley</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <Stars value={4.9} size={12} />
          <span className="sy-small">4.9 (47)</span>
          <span className="sy-small sy-muted">· Rennes</span>
          <Chip size="sm" variant="primary">vérifié</Chip>
        </div>

        {/* impact */}
        <div style={{ marginTop: 18 }}>
          <ImpactHero />
        </div>

        {/* facts */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Capacité', '10–60'], ['Durée', '3h'], ['Lieu', 'Chez vous'], ['Depuis', '2024']].map(([k, v]) => (
            <Card key={k} style={{ padding: 12 }}>
              <div className="sy-mono">{k}</div>
              <div className="sy-h4" style={{ marginTop: 2 }}>{v}</div>
            </Card>
          ))}
        </div>

        <h2 className="sy-h2" style={{ marginTop: 22, fontSize: 18 }}>L'expérience</h2>
        <p className="sy-body" style={{ marginTop: 8 }}>
          Notre équipe vient cuisiner chez vous : grillades, salades, ambiance conviviale. Tout le matériel est fourni.
        </p>

        {/* asso */}
        <Card style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar initials="UV" tone="green" />
          <div style={{ flex: 1 }}>
            <div className="sy-h4">USB Volley</div>
            <div className="sy-mono">42 prestations · ✓ vérifié</div>
          </div>
          <Btn variant="ghost" size="sm" iconRight={<Icon name="chevron" size={13} />}>Voir</Btn>
        </Card>
      </div>

      {/* sticky booking bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14,
        background: 'var(--surface)', borderTop: '1px solid var(--line)',
        boxShadow: '0 -8px 24px rgba(20,36,31,.08)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 24, lineHeight: 1 }} className="sy-num">€280</div>
          <div className="sy-mono" style={{ marginTop: 2 }}>+€84 reversés</div>
        </div>
        <Btn variant="primary" size="lg" block style={{ flex: 1 }} iconRight={<Icon name="arrow" size={15} color="#fff" />}>
          Réserver
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { DetailDesktop, DetailMobile });
