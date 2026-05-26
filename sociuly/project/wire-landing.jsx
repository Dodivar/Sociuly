// Landing page wireframe variations

function LandingNavD() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 22px', borderBottom: `1px solid ${WIRE.line2}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="wf-h2" style={{ letterSpacing: '-0.02em' }}>Sociuly</div>
        <div className="wf-navtabs">
          <span className="on">Prestations</span>
          <span>Associations</span>
          <span>Carte</span>
          <span>Projets</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Btn sm ghost>Inscrire mon asso</Btn>
        <Btn sm>Se connecter</Btn>
      </div>
    </div>
  );
}

function MobileNav({ title = 'Sociuly' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderBottom: `1px solid ${WIRE.line2}`,
    }}>
      <span className="wf-h2">{title}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <i style={{ width: 18, height: 1.6, background: WIRE.ink }} />
        <i style={{ width: 18, height: 1.6, background: WIRE.ink }} />
        <i style={{ width: 12, height: 1.6, background: WIRE.ink }} />
      </div>
    </div>
  );
}

function StatStrip({ items, style }) {
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'baseline', ...style }}>
      {items.map((it, i) => (
        <div key={i}>
          <div className="wf-h1" style={{ color: WIRE.accent }}>{it[0]}</div>
          <div className="wf-mono">{it[1]}</div>
        </div>
      ))}
    </div>
  );
}

function PrestationCard({ title = 'Barbecue du club', price = '€280', loc = 'Rennes · 2km', goal = 0.4, h = 'auto' }) {
  return (
    <div className="wf-box" style={{ padding: 8, height: h }}>
      <Img label="photo prestation" h={86} />
      <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="wf-h3">{title}</div>
        <div className="wf-h3">{price}</div>
      </div>
      <div className="wf-mono" style={{ marginTop: 2 }}>{loc} · ★ 4.8</div>
      <div style={{ marginTop: 6 }}>
        <div className="wf-mono" style={{ marginBottom: 3 }}>FINANCE · maillots U15</div>
        <Progress value={goal} />
      </div>
    </div>
  );
}

function ProjectCard({ title = 'Voyage tournoi Espagne', value = 0.6, money = '€2 480 / €4 000', count = '14 résas' }) {
  return (
    <div className="wf-box" style={{ padding: 8 }}>
      <Img label="photo projet" h={70} />
      <div className="wf-h3" style={{ marginTop: 6 }}>{title}</div>
      <div style={{ marginTop: 6 }}>
        <Progress value={value} />
        <div className="wf-mono" style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span>{money}</span><span>{count}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VARIATION A — Airbnb-like: image right, copy left, impact strip below
// ============================================================
function LandingA_D() {
  return (
    <Frame kind="desktop" label="A · Landing — Hero classique" tag="desktop 1440">
      <LandingNavD />
      <div style={{ padding: '24px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'center' }}>
          <div>
            <Chip style={{ marginBottom: 12 }}>Marketplace solidaire · sport amateur</Chip>
            <div className="wf-h1" style={{ fontSize: 30, lineHeight: 1.05, marginBottom: 10 }}>
              Réservez des prestations locales qui financent le sport amateur.
            </div>
            <div className="wf-muted" style={{ fontSize: 13, marginBottom: 16 }}>
              Barbecues, animations sportives, événements et services proposés par les clubs de votre région.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn primary>Découvrir les prestations →</Btn>
              <Btn ghost>Inscrire mon association</Btn>
            </div>
            <Note style={{ marginTop: 14, display: 'block' }}>
              ↳ CTA principal large + primaire bleu
            </Note>
          </div>
          <Img label="[ photo lifestyle · BBQ club · jeunes sportifs ]" h={300} />
        </div>

        {/* impact strap */}
        <div className="wf-box" style={{ marginTop: 18, padding: 14, background: WIRE.paper2 }}>
          <StatStrip items={[['238', 'associations actives'], ['1 612', 'projets financés'], ['€184k', 'reversés aux clubs']]} />
        </div>

        {/* how it works */}
        <div style={{ marginTop: 22 }}>
          <div className="wf-h2" style={{ marginBottom: 10 }}>Comment ça marche</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[['Choisissez une prestation', 'parcourez les clubs proches'],
              ['Réservez en quelques clics', 'paiement sécurisé'],
              ['Financez un projet sportif', 'voyez l\u2019impact concret']].map(([t, s], i) => (
                <div key={i} className="wf-box" style={{ padding: 10 }}>
                  <div className="wf-numcircle">{i + 1}</div>
                  <div className="wf-h3" style={{ marginTop: 6 }}>{t}</div>
                  <div className="wf-mono" style={{ marginTop: 2 }}>{s}</div>
                </div>
            ))}
          </div>
        </div>

        {/* prestations populaires */}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="wf-h2">Prestations populaires</div>
          <Note ink>voir tout →</Note>
        </div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <PrestationCard title="Barbecue associatif" price="€280" />
          <PrestationCard title="Olympiades entreprise" price="€720" goal={0.7} />
          <PrestationCard title="Anniversaire sportif" price="€180" goal={0.25} />
          <PrestationCard title="Buvette événement" price="€350" goal={0.55} />
        </div>
      </div>
    </Frame>
  );
}

function LandingA_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile">
      <MobileNav />
      <div style={{ padding: '14px 14px', overflow: 'hidden' }}>
        <Chip style={{ marginBottom: 10 }}>marketplace solidaire</Chip>
        <div className="wf-h1" style={{ fontSize: 22, lineHeight: 1.1 }}>
          Réservez des prestations qui financent le sport amateur.
        </div>
        <div className="wf-muted" style={{ fontSize: 12, marginTop: 6 }}>
          Animations, événements, services proposés par les clubs près de chez vous.
        </div>
        <Img label="photo lifestyle" h={150} style={{ marginTop: 12 }} />
        <Btn primary block style={{ marginTop: 12 }}>Découvrir les prestations</Btn>
        <Btn ghost block style={{ marginTop: 6 }}>Inscrire mon association</Btn>

        <div className="wf-box" style={{ marginTop: 14, padding: 10 }}>
          <StatStrip items={[['238', 'assos'], ['1.6k', 'projets'], ['€184k', 'reversés']]} style={{ gap: 12 }} />
        </div>

        <div className="wf-h3" style={{ marginTop: 14 }}>Près de vous</div>
        <div style={{ marginTop: 6, display: 'grid', gap: 8 }}>
          <PrestationCard />
          <PrestationCard title="Olympiades entreprise" goal={0.7} />
        </div>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — Impact-first: stats above headline, prestations integrated into hero
// ============================================================
function LandingB_D() {
  return (
    <Frame kind="desktop" label="B · Landing — Impact en premier" tag="emotion-first">
      <LandingNavD />
      <div style={{ padding: '22px 22px' }}>
        {/* impact bar above headline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Chip accent>● en direct</Chip>
          <span className="wf-mono">€184 230 reversés · 238 clubs actifs · 1 612 projets financés</span>
          <Note style={{ marginLeft: 'auto' }}>info-bar qui rappelle l'impact</Note>
        </div>

        <div className="wf-h1" style={{ fontSize: 44, lineHeight: 1.02, letterSpacing: '-0.02em' }}>
          Réservez près de chez vous.<br />
          <span style={{ color: WIRE.accent }}>Financez le club d'à côté.</span>
        </div>
        <div className="wf-muted" style={{ fontSize: 14, marginTop: 10, maxWidth: 540 }}>
          Barbecues, animations, événements proposés par les associations sportives locales — chaque réservation finance un projet réel.
        </div>

        {/* search-style bar */}
        <div className="wf-sticky" style={{ marginTop: 16, padding: 8, display: 'flex', gap: 6, alignItems: 'center', maxWidth: 760 }}>
          <div style={{ flex: 1, padding: '6px 10px' }}>
            <div className="wf-mono">QUOI</div>
            <div className="wf-h3">Barbecue associatif</div>
          </div>
          <div style={{ width: 1, height: 30, background: WIRE.line }} />
          <div style={{ flex: 1, padding: '6px 10px' }}>
            <div className="wf-mono">OÙ</div>
            <div className="wf-h3">Rennes · 10km</div>
          </div>
          <div style={{ width: 1, height: 30, background: WIRE.line }} />
          <div style={{ flex: 1, padding: '6px 10px' }}>
            <div className="wf-mono">QUAND</div>
            <div className="wf-h3">Samedi 14 juin</div>
          </div>
          <Btn primary>Rechercher</Btn>
        </div>

        {/* image + 3 popular cards inline */}
        <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 10 }}>
          <Img label="photo héro · scène conviviale" h={220} />
          <PrestationCard title="Barbecue club" price="€280" goal={0.4} h={220} />
          <PrestationCard title="Anniversaire sportif" price="€180" goal={0.25} h={220} />
        </div>

        {/* projets financés strip */}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="wf-h2">Projets financés grâce à vous</div>
          <Note ink>3 derniers projets aboutis →</Note>
        </div>
        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <ProjectCard title="Tournoi Espagne U17" value={1} money="€4 000 atteint" count="✓ financé" />
          <ProjectCard title="Maillots saison" value={0.7} money="€1 050 / €1 500" />
          <ProjectCard title="Rénovation vestiaires" value={0.32} money="€3 200 / €10 000" />
        </div>
      </div>
    </Frame>
  );
}

function LandingB_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile">
      <MobileNav />
      <div style={{ padding: '12px 14px' }}>
        <div className="wf-callout" style={{ padding: 8 }}>
          <div className="wf-mono">EN DIRECT</div>
          <div className="wf-h3">€184k reversés aux clubs locaux</div>
        </div>
        <div className="wf-h1" style={{ fontSize: 24, marginTop: 14, lineHeight: 1.05 }}>
          Réservez près de chez vous.<br />
          <span style={{ color: WIRE.accent }}>Financez le club d'à côté.</span>
        </div>

        <div className="wf-sticky" style={{ marginTop: 12, padding: 10 }}>
          <div className="wf-mono">QUOI · OÙ · QUAND</div>
          <div className="wf-h3" style={{ marginTop: 2 }}>Barbecue · Rennes · 14 juin</div>
          <Btn primary block style={{ marginTop: 8 }}>Rechercher</Btn>
        </div>

        <div className="wf-h3" style={{ marginTop: 14 }}>Projets en cours</div>
        <div style={{ marginTop: 6, display: 'grid', gap: 8 }}>
          <ProjectCard title="Maillots saison" value={0.7} money="€1 050 / €1 500" />
          <ProjectCard title="Vestiaires" value={0.32} money="€3.2k / €10k" />
        </div>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION C — Editorial / story: emotional carousel, project front and center
// ============================================================
function LandingC_D() {
  return (
    <Frame kind="desktop" label="C · Landing — Éditorial émotionnel" tag="story-led">
      <LandingNavD />
      <div style={{ padding: '24px 22px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>
          {/* left: project as hero */}
          <div className="wf-box" style={{ padding: 12, display: 'flex', flexDirection: 'column' }}>
            <Chip accent style={{ alignSelf: 'flex-start' }}>● Projet en cours · USB Volley</Chip>
            <Img label="[ photo équipe · vestiaires actuels ]" h={210} style={{ marginTop: 10 }} />
            <div className="wf-h2" style={{ marginTop: 10 }}>
              Aidez les U17 à partir au tournoi national d'Espagne.
            </div>
            <div className="wf-mono" style={{ marginTop: 4 }}>Reste 12 jours · €2 480 / €4 000</div>
            <Progress value={0.62} style={{ marginTop: 6 }} />
            <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
              <Btn primary>Réserver une prestation du club →</Btn>
              <Btn ghost sm>Voir l'asso</Btn>
            </div>
          </div>
          {/* right: emotional copy */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="wf-h1" style={{ fontSize: 36, lineHeight: 1.04 }}>
                Chaque BBQ, chaque buvette, chaque animation —
                <span style={{ color: WIRE.accent }}> finance un projet réel.</span>
              </div>
              <div className="wf-muted" style={{ fontSize: 13, marginTop: 10 }}>
                Sociuly relie les particuliers et entreprises aux associations sportives qui proposent des prestations locales. Vous réservez. Le club encaisse. Un projet avance.
              </div>
            </div>
            <div className="wf-box-soft" style={{ padding: 12, marginTop: 14 }}>
              <div className="wf-mono">DEPUIS LE LANCEMENT</div>
              <StatStrip style={{ marginTop: 6 }}
                items={[['€184k', 'reversés'], ['238', 'clubs'], ['1 612', 'projets']]} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <Btn primary>Découvrir les prestations</Btn>
              <Btn ghost>Inscrire mon asso</Btn>
            </div>
          </div>
        </div>

        {/* 3 étapes minimal */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="wf-numcircle">1</span>
          <div className="wf-h3">Choisissez</div>
          <i style={{ flex: 1, borderTop: `1.4px dashed ${WIRE.line}` }} />
          <span className="wf-numcircle">2</span>
          <div className="wf-h3">Réservez</div>
          <i style={{ flex: 1, borderTop: `1.4px dashed ${WIRE.line}` }} />
          <span className="wf-numcircle">3</span>
          <div className="wf-h3">Financez</div>
        </div>

        {/* prestations populaires */}
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          <PrestationCard title="Barbecue associatif" />
          <PrestationCard title="Olympiades" goal={0.7} />
          <PrestationCard title="Anniversaire sportif" goal={0.25} />
          <PrestationCard title="Buvette événement" goal={0.55} />
        </div>
      </div>
    </Frame>
  );
}

function LandingC_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile">
      <MobileNav />
      <div style={{ padding: '12px 14px' }}>
        <Chip accent>● Projet en cours</Chip>
        <Img label="photo équipe USB Volley" h={130} style={{ marginTop: 8 }} />
        <div className="wf-h2" style={{ marginTop: 8 }}>
          Aidez les U17 à partir au tournoi.
        </div>
        <Progress value={0.62} style={{ marginTop: 8 }} />
        <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · reste 12j</div>
        <Btn primary block style={{ marginTop: 10 }}>Réserver une prestation du club</Btn>

        <div className="wf-h3" style={{ marginTop: 16 }}>Comment ça marche</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <span className="wf-numcircle">1</span><span style={{ fontSize: 11 }}>Choisissez</span>
          <i style={{ flex: 1, borderTop: `1.4px dashed ${WIRE.line}` }} />
          <span className="wf-numcircle">2</span><span style={{ fontSize: 11 }}>Réservez</span>
          <i style={{ flex: 1, borderTop: `1.4px dashed ${WIRE.line}` }} />
          <span className="wf-numcircle">3</span><span style={{ fontSize: 11 }}>Financez</span>
        </div>

        <div className="wf-h3" style={{ marginTop: 16 }}>Près de vous</div>
        <PrestationCard />
      </div>
    </Frame>
  );
}

Object.assign(window, {
  LandingA_D, LandingA_M, LandingB_D, LandingB_M, LandingC_D, LandingC_M,
  PrestationCard, ProjectCard, LandingNavD, MobileNav, StatStrip,
});
