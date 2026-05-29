// Détail prestation wireframe variations

function StarRow() {
  return (
    <span style={{ display: 'inline-flex', gap: 2, fontSize: 12, color: WIRE.ink }}>
      ★★★★★ <span className="wf-mono" style={{ marginLeft: 4 }}>4.9 · 47 avis</span>
    </span>
  );
}

function BookingCard({ compact }) {
  return (
    <div className="wf-sticky" style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="wf-h1" style={{ fontSize: 22 }}>€280</div>
        <div className="wf-mono">/ prestation</div>
      </div>
      <div style={{ marginTop: 10, border: `1.3px solid ${WIRE.ink}`, borderRadius: 8 }}>
        <div style={{ display: 'flex', borderBottom: `1px solid ${WIRE.line}` }}>
          <div style={{ flex: 1, padding: '6px 8px', borderRight: `1px solid ${WIRE.line}` }}>
            <div className="wf-mono">DATE</div>
            <div className="wf-h3" style={{ fontSize: 12 }}>sam. 14 juin</div>
          </div>
          <div style={{ flex: 1, padding: '6px 8px' }}>
            <div className="wf-mono">HEURE</div>
            <div className="wf-h3" style={{ fontSize: 12 }}>16h00</div>
          </div>
        </div>
        <div style={{ padding: '6px 8px' }}>
          <div className="wf-mono">PARTICIPANTS</div>
          <div className="wf-h3" style={{ fontSize: 12 }}>24 personnes</div>
        </div>
      </div>
      <Btn primary block style={{ marginTop: 10 }}>Réserver →</Btn>
      <div className="wf-mono" style={{ textAlign: 'center', marginTop: 8 }}>
        ✓ Annulation gratuite J-7 · ✓ Stripe sécurisé
      </div>
      {!compact && (
        <div className="wf-divider-dashed" />
      )}
      {!compact && (
        <div>
          <div className="wf-mono">CETTE RÉSERVATION FINANCE</div>
          <div className="wf-h3" style={{ marginTop: 2 }}>Tournoi Espagne U17</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · +€84 avec votre résa</div>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ name = 'Camille L.', date = 'avril 2026', body = 'Super journée pour le BBQ de mon entreprise, équipe ultra réactive et on a fait avancer un projet local !' }) {
  return (
    <div className="wf-box" style={{ padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: WIRE.line, border: `1.2px solid ${WIRE.ink}` }} />
        <div>
          <div className="wf-h3" style={{ fontSize: 12 }}>{name}</div>
          <div className="wf-mono">{date} · ★★★★★</div>
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: WIRE.ink2 }}>“{body}”</div>
    </div>
  );
}

// ============================================================
// VARIATION A — Airbnb-like: gallery + sticky booking card right
// ============================================================
function DetailA_D() {
  return (
    <Frame kind="desktop" label="A · Détail — Gallery + sticky booking" tag="airbnb-like">
      <LandingNavD />
      <div style={{ padding: '14px 22px' }}>
        <div className="wf-mono" style={{ marginBottom: 6 }}>Marketplace › BBQ › Barbecue du club</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="wf-h1" style={{ fontSize: 24 }}>Barbecue convivial du club USB Volley</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn sm ghost>♡ Sauver</Btn>
            <Btn sm ghost>↗ Partager</Btn>
          </div>
        </div>
        <div style={{ marginTop: 4, fontSize: 12, color: WIRE.ink2, display: 'flex', gap: 10 }}>
          <StarRow /><span>·</span><span>Rennes (35)</span><span>·</span><Chip accent>✓ Asso vérifiée</Chip>
        </div>

        {/* gallery */}
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 6, height: 250 }}>
          <Img label="photo principale" h="100%" style={{ height: '100%' }} />
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 6 }}>
            <Img label="photo 2" h="100%" style={{ height: '100%' }} />
            <Img label="photo 3" h="100%" style={{ height: '100%' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 6 }}>
            <Img label="photo 4" h="100%" style={{ height: '100%' }} />
            <Img label="photo 5" h="100%" style={{ height: '100%' }} />
          </div>
        </div>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>
          {/* main col */}
          <div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', paddingBottom: 12, borderBottom: `1px solid ${WIRE.line2}` }}>
              <div className="wf-img" style={{ width: 36, height: 36, borderRadius: '50%' }}>logo</div>
              <div>
                <div className="wf-h3">Proposé par USB Volley</div>
                <div className="wf-mono">42 prestations · membre depuis 2024</div>
              </div>
              <div style={{ marginLeft: 'auto' }}><Btn sm ghost>Voir l'asso →</Btn></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 12 }}>
              <div className="wf-box" style={{ padding: 8 }}>
                <div className="wf-mono">CAPACITÉ</div>
                <div className="wf-h3">10–60 pers.</div>
              </div>
              <div className="wf-box" style={{ padding: 8 }}>
                <div className="wf-mono">DURÉE</div>
                <div className="wf-h3">3h env.</div>
              </div>
              <div className="wf-box" style={{ padding: 8 }}>
                <div className="wf-mono">LIEU</div>
                <div className="wf-h3">Chez vous</div>
              </div>
              <div className="wf-box" style={{ padding: 8 }}>
                <div className="wf-mono">INCLUS</div>
                <div className="wf-h3">Matériel + 6 bénévoles</div>
              </div>
            </div>

            <div className="wf-h2" style={{ marginTop: 16 }}>Description</div>
            <div className="wf-skel" style={{ height: 8, marginTop: 8, width: '90%' }} />
            <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '85%' }} />
            <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '70%' }} />
            <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '50%' }} />

            <div className="wf-h2" style={{ marginTop: 16 }}>Disponibilités</div>
            <div className="wf-box" style={{ marginTop: 6, padding: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 56, height: 56, border: `1.4px solid ${WIRE.ink}`, borderRadius: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: WIRE.accentSoft,
              }}>
                <div className="wf-mono" style={{ color: WIRE.accent }}>SAM</div>
                <div className="wf-h2" style={{ color: WIRE.accent, fontSize: 22, lineHeight: 1 }}>14</div>
                <div className="wf-mono" style={{ color: WIRE.accent }}>JUIN</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="wf-mono">PROCHAINE DATE DISPO</div>
                <div className="wf-h3" style={{ marginTop: 2 }}>Samedi 14 juin · 16h00</div>
                <div className="wf-mono" style={{ marginTop: 2 }}>+ 8 autres créneaux ce mois-ci</div>
              </div>
              <Btn ghost sm>Voir le calendrier ▾</Btn>
            </div>
            <Note style={{ marginTop: 6, display: 'block' }}>
              ↑ calendrier replié par défaut — première date de dispo mise en avant, drawer/modale au clic
            </Note>

            <div className="wf-h2" style={{ marginTop: 16 }}>Avis (47)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              <ReviewCard />
              <ReviewCard name="Hugo M." body="Excellent moment d'équipe, et le club a pu financer ses maillots." />
            </div>
          </div>

          {/* right rail */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'sticky', top: 12 }}>
              <BookingCard />
              <Note style={{ display: 'block', marginTop: 8 }}>
                ↑ encart "ce que vous financez" intégré dans la sticky card
              </Note>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DetailA_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile">
      <div style={{ position: 'relative' }}>
        <Img label="photo principale" h={210} style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }} />
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between' }}>
          <Btn sm>←</Btn>
          <div style={{ display: 'flex', gap: 6 }}><Btn sm>♡</Btn><Btn sm>↗</Btn></div>
        </div>
        <div style={{ position: 'absolute', bottom: 8, right: 12 }}><Chip solid>1 / 6</Chip></div>
      </div>
      <div style={{ padding: '12px 14px', paddingBottom: 90 }}>
        <div className="wf-h2">Barbecue convivial USB Volley</div>
        <div style={{ marginTop: 4 }}><StarRow /></div>
        <div style={{ marginTop: 6 }}><Chip accent>✓ vérifié</Chip> <Chip>10–60 pers.</Chip> <Chip>3h</Chip></div>

        <div className="wf-callout" style={{ marginTop: 12 }}>
          <div className="wf-mono">FINANCE</div>
          <div className="wf-h3">Tournoi Espagne U17</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000</div>
        </div>

        <div className="wf-h3" style={{ marginTop: 14 }}>Description</div>
        <div className="wf-skel" style={{ height: 6, marginTop: 6, width: '90%' }} />
        <div className="wf-skel" style={{ height: 6, marginTop: 3, width: '80%' }} />

        <div className="wf-box" style={{ marginTop: 14, padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 44, height: 44, border: `1.4px solid ${WIRE.ink}`, borderRadius: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: WIRE.accentSoft,
          }}>
            <div className="wf-mono" style={{ color: WIRE.accent, fontSize: 9 }}>SAM</div>
            <div className="wf-h3" style={{ color: WIRE.accent, fontSize: 16, lineHeight: 1 }}>14</div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="wf-mono">DISPO LE PLUS PROCHE</div>
            <div className="wf-h3">Sam. 14 juin · 16h</div>
          </div>
          <Btn sm ghost>Calendrier ▾</Btn>
        </div>
      </div>
      {/* sticky booking bar */}
      <div className="wf-sticky" style={{
        position: 'absolute', bottom: 8, left: 8, right: 8, padding: 10,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div>
          <div className="wf-h2">€280</div>
          <div className="wf-mono">sam. 14 juin</div>
        </div>
        <Btn primary block style={{ flex: 1 }}>Réserver</Btn>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — Impact hero: large project callout pinned, content below
// ============================================================
function DetailB_D() {
  return (
    <Frame kind="desktop" label="B · Détail — Projet en hero" tag="impact-first">
      <LandingNavD />
      <Img label="[ photo héro full-bleed · prestation in situ ]" h={260} style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none' }} />

      <div style={{ padding: '14px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
          <div>
            <div className="wf-h1" style={{ fontSize: 24 }}>Barbecue convivial du club USB Volley</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 10, alignItems: 'center' }}>
              <StarRow /><span>·</span><span style={{ fontSize: 12 }}>Rennes</span><Chip accent>✓ vérifié</Chip>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 12 }}>
              <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">CAPACITÉ</div><div className="wf-h3">10–60</div></div>
              <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">DURÉE</div><div className="wf-h3">3h</div></div>
              <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">LIEU</div><div className="wf-h3">Chez vous</div></div>
              <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">DEPUIS</div><div className="wf-h3">2024</div></div>
            </div>

            <div className="wf-h2" style={{ marginTop: 16 }}>Description</div>
            <div className="wf-skel" style={{ height: 8, marginTop: 8, width: '92%' }} />
            <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '85%' }} />
            <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '70%' }} />

            <div className="wf-h2" style={{ marginTop: 16 }}>Inclus / besoins</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              {['Matériel cuisson', 'Tables / nappes', '6 bénévoles', 'Service compris'].map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: 4, background: WIRE.accent, color: '#fff',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700,
                  }}>✓</span>{t}
                </div>
              ))}
            </div>

            <div className="wf-h2" style={{ marginTop: 16 }}>Avis (47)</div>
            <div style={{ display: 'grid', gap: 8, marginTop: 6 }}>
              <ReviewCard />
            </div>
          </div>

          {/* right: HUGE project block */}
          <div>
            {/* big impact card */}
            <div className="wf-callout" style={{ padding: 14 }}>
              <div className="wf-mono">CETTE PRESTATION FINANCE</div>
              <div className="wf-h2" style={{ marginTop: 4 }}>Tournoi Espagne U17</div>
              <Img label="photo du projet" h={130} style={{ marginTop: 10 }} />
              <div style={{ marginTop: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div className="wf-h1" style={{ fontSize: 22 }}>€2 480</div>
                  <div className="wf-mono">/ €4 000</div>
                </div>
                <Progress value={0.62} style={{ marginTop: 6 }} />
                <div className="wf-mono" style={{ marginTop: 4 }}>62% · 14 résa · reste 12j</div>
              </div>
              <Note ink style={{ display: 'block', marginTop: 8 }}>
                ↑ projet pinné, infos secondaires plus bas
              </Note>
            </div>

            {/* booking compact */}
            <div style={{ marginTop: 12 }}>
              <BookingCard compact />
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DetailB_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · impact-first">
      <Img label="photo prestation" h={150} style={{ borderRadius: 0, borderLeftWidth: 0, borderRightWidth: 0, borderTopWidth: 0 }} />
      <div style={{ padding: '12px 14px', paddingBottom: 90 }}>
        <div className="wf-callout" style={{ padding: 10 }}>
          <div className="wf-mono">VOUS FINANCEZ</div>
          <div className="wf-h2">Tournoi Espagne U17</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · reste 12j</div>
        </div>
        <div className="wf-h2" style={{ marginTop: 12 }}>Barbecue convivial USB Volley</div>
        <div style={{ marginTop: 4 }}><StarRow /></div>
        <div style={{ marginTop: 8 }}><Chip>10–60</Chip> <Chip>3h</Chip> <Chip accent>✓ vérifié</Chip></div>
        <div className="wf-h3" style={{ marginTop: 12 }}>Inclus</div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          <Chip>Matériel</Chip><Chip>6 bénévoles</Chip><Chip>Service</Chip>
        </div>
      </div>
      <div className="wf-sticky" style={{ position: 'absolute', bottom: 8, left: 8, right: 8, padding: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div>
          <div className="wf-h2">€280</div>
          <div className="wf-mono">avec impact +€84</div>
        </div>
        <Btn primary block style={{ flex: 1 }}>Réserver</Btn>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION C — Magazine: vertical narrative, impact in middle
// ============================================================
function DetailC_D() {
  return (
    <Frame kind="desktop" label="C · Détail — Magazine narratif" tag="long-form">
      <LandingNavD />
      <div style={{ padding: '24px 14%' }}>
        <Chip accent>BBQ · Rennes</Chip>
        <div className="wf-h1" style={{ fontSize: 32, lineHeight: 1.04, marginTop: 10, maxWidth: 700 }}>
          Un barbecue chez vous. Une saison de volley pour les U17.
        </div>
        <div className="wf-muted" style={{ fontSize: 13, marginTop: 8 }}>
          Proposé par <b>USB Volley</b> · ★ 4.9 · 47 avis · ✓ Asso vérifiée
        </div>

        <Img label="[ photo lifestyle pleine largeur ]" h={280} style={{ marginTop: 14 }} />

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">PRIX</div><div className="wf-h3">€280</div></div>
          <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">CAPACITÉ</div><div className="wf-h3">10–60</div></div>
          <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">DURÉE</div><div className="wf-h3">3h</div></div>
          <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">DISPO</div><div className="wf-h3">sam. 14/06</div></div>
        </div>

        {/* full-width impact band */}
        <div className="wf-callout" style={{ marginTop: 18, padding: 18, display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 16, alignItems: 'center' }}>
          <Img label="photo projet" h={140} />
          <div>
            <div className="wf-mono">VOTRE RÉSERVATION FINANCE</div>
            <div className="wf-h1" style={{ fontSize: 24, marginTop: 4 }}>Le tournoi national d'Espagne pour les U17</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <Progress value={0.62} />
                <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · 14 résa · reste 12j</div>
              </div>
              <Btn ghost sm>Voir le projet →</Btn>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <div>
            <div className="wf-h2">Comment ça se passe ?</div>
            <div className="wf-skel" style={{ height: 8, marginTop: 8, width: '95%' }} />
            <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '88%' }} />
            <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '75%' }} />

            <div className="wf-h2" style={{ marginTop: 14 }}>Calendrier</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginTop: 6 }}>
              {Array.from({ length: 21 }).map((_, i) => (
                <div key={i} className="wf-box" style={{
                  height: 24, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: [4, 5, 12].includes(i) ? WIRE.accent : WIRE.paper,
                  color: [4, 5, 12].includes(i) ? '#fff' : WIRE.ink,
                }}>{i + 1}</div>
              ))}
            </div>
          </div>
          <div>
            <BookingCard compact />
          </div>
        </div>
      </div>
    </Frame>
  );
}

function DetailC_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · magazine">
      <MobileNav title="" />
      <div style={{ padding: '10px 14px', paddingBottom: 90 }}>
        <Chip accent>BBQ · Rennes</Chip>
        <div className="wf-h1" style={{ fontSize: 22, marginTop: 8, lineHeight: 1.08 }}>
          Un BBQ chez vous. Une saison pour les U17.
        </div>
        <Img label="photo héro" h={150} style={{ marginTop: 10 }} />
        <div className="wf-callout" style={{ marginTop: 12, padding: 10 }}>
          <div className="wf-mono">VOTRE RÉSERVATION FINANCE</div>
          <div className="wf-h3">Tournoi Espagne U17</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000</div>
        </div>
        <div className="wf-h3" style={{ marginTop: 12 }}>Comment ça se passe ?</div>
        <div className="wf-skel" style={{ height: 6, marginTop: 6, width: '90%' }} />
        <div className="wf-skel" style={{ height: 6, marginTop: 3, width: '70%' }} />
      </div>
      <div className="wf-sticky" style={{ position: 'absolute', bottom: 8, left: 8, right: 8, padding: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div><div className="wf-h2">€280</div><div className="wf-mono">+€84 reversés</div></div>
        <Btn primary block style={{ flex: 1 }}>Réserver</Btn>
      </div>
    </Frame>
  );
}

Object.assign(window, {
  DetailA_D, DetailA_M, DetailB_D, DetailB_M, DetailC_D, DetailC_M, BookingCard, ReviewCard, StarRow,
});
