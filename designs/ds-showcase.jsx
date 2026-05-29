// Sociuly — Foundations + Components showcase
// One big artboard per: Foundations, Components, Patterns, Signature.

const FOUND_W = 1640;

// Common: section heading inside an artboard
function Sect({ title, kicker, children, style }) {
  return (
    <div style={{ marginBottom: 36, ...style }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
        <div>
          {kicker && <div className="sy-mono">{kicker}</div>}
          <h3 className="sy-h2" style={{ marginTop: kicker ? 4 : 0 }}>{title}</h3>
        </div>
      </div>
      {children}
    </div>
  );
}

function Page({ title, sub, children }) {
  return (
    <div className="sy" style={{ background: 'var(--bg)', padding: '40px 48px',
      width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1480, margin: '0 auto' }}>
        <div className="sy-mono" style={{ marginBottom: 6 }}>Sociuly Design System · v1</div>
        <h1 className="sy-display" style={{ marginBottom: 8 }}>{title}</h1>
        {sub && <p className="sy-body-l" style={{ maxWidth: 700, marginBottom: 36 }}>{sub}</p>}
        {children}
      </div>
    </div>
  );
}

// ============================================================
// FOUNDATIONS
// ============================================================
function FoundationsPage() {
  const swatches = [
    { name: 'bg', token: '--bg' },
    { name: 'surface', token: '--surface' },
    { name: 'surface-2', token: '--surface-2' },
    { name: 'ink', token: '--ink' },
    { name: 'ink-2', token: '--ink-2' },
    { name: 'ink-3', token: '--ink-3' },
    { name: 'line', token: '--line' },
    { name: 'primary', token: '--primary', brand: true },
    { name: 'primary-deep', token: '--primary-deep' },
    { name: 'primary-soft', token: '--primary-soft' },
    { name: 'accent', token: '--accent', brand: true },
    { name: 'accent-deep', token: '--accent-deep' },
    { name: 'accent-soft', token: '--accent-soft' },
    { name: 'highlight', token: '--highlight', brand: true },
    { name: 'highlight-soft', token: '--highlight-soft' },
    { name: 'success', token: '--success' },
  ];

  const radii = [
    { name: 'xs', token: '--radius-xs' },
    { name: 'sm', token: '--radius-sm' },
    { name: 'md', token: '--radius-md' },
    { name: 'lg', token: '--radius-lg' },
    { name: 'xl', token: '--radius-xl' },
    { name: 'pill', val: '999px' },
  ];

  return (
    <Page title="Foundations" sub="Sociuly est un marketplace solidaire local. Le langage visuel est sportif, généreux, ancré dans la nature et l'idée d'un effort partagé. Les jaunes-orangés sont l'énergie ; le vert profond est la confiance.">

      {/* Color */}
      <Sect kicker="01" title="Couleur">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12 }}>
          {swatches.map(sw => (
            <div key={sw.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                aspectRatio: '1.1', borderRadius: 'var(--radius-md)',
                background: `var(${sw.token})`,
                border: sw.name.startsWith('surface') || sw.name === 'bg' || sw.name === 'highlight-soft' ? '1px solid var(--line)' : 'none',
                position: 'relative',
              }}>
                {sw.brand && (
                  <div style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: '50%',
                    background: '#fff', border: '1px solid rgba(0,0,0,.1)' }} />
                )}
              </div>
              <div>
                <div className="sy-h4">{sw.name}</div>
                <div className="sy-mono" style={{ fontSize: 10 }}>{sw.token}</div>
              </div>
            </div>
          ))}
        </div>
      </Sect>

      {/* Typography */}
      <Sect kicker="02" title="Typographie">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div className="sy-mono" style={{ marginBottom: 12 }}>Display · Bricolage Grotesque</div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 110, lineHeight: 0.9,
              letterSpacing: '-0.04em', fontVariationSettings: "'wdth' 88" }}>
              Local.
            </div>
            <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 110, lineHeight: 0.9,
              letterSpacing: '-0.04em', fontVariationSettings: "'wdth' 88", color: 'var(--accent)', marginTop: -10 }}>
              Sportif.
            </div>
            <div className="sy-mono" style={{ marginTop: 14 }}>variable · wdth 88 → 110 · opsz</div>
          </div>
          <div>
            <div className="sy-mono" style={{ marginBottom: 12 }}>Sans · Geist</div>
            <div className="sy-h1" style={{ marginBottom: 6 }}>H1 · 32 / -2% / 1.06</div>
            <div className="sy-h2" style={{ marginBottom: 6 }}>H2 · 22 / 1.18</div>
            <div className="sy-h3" style={{ marginBottom: 6 }}>H3 · 16 / 600 / 1.3</div>
            <div className="sy-body-l" style={{ marginBottom: 6 }}>Body L · 17. Réservez près de chez vous, financez le club d'à côté.</div>
            <div className="sy-body" style={{ marginBottom: 6 }}>Body · 15. Réservez des prestations locales qui financent le sport amateur.</div>
            <div className="sy-small" style={{ marginBottom: 6 }}>Small · 13. Annulation gratuite J-7 · Stripe sécurisé.</div>
            <div className="sy-mono">Mono · 11 · 0.08em · uppercase · meta tags</div>
          </div>
        </div>
      </Sect>

      {/* Radius */}
      <Sect kicker="03" title="Forme · rayon">
        <div style={{ display: 'flex', gap: 22, alignItems: 'flex-end' }}>
          {radii.map(r => (
            <div key={r.name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ width: 110, height: 110, background: 'var(--ink)',
                borderRadius: r.val || `var(${r.token})` }} />
              <div>
                <div className="sy-h4">{r.name}</div>
                <div className="sy-mono" style={{ fontSize: 10 }}>{r.token || r.val}</div>
              </div>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', maxWidth: 320 }}>
            <div className="sy-mono">Usage</div>
            <p className="sy-small" style={{ marginTop: 6 }}>
              <b>pill</b> pour boutons et chips (sporty);<br />
              <b>md/lg</b> pour cartes et conteneurs;<br />
              <b>xl</b> sur les blocs hero / impact / callouts émotionnels.
            </p>
          </div>
        </div>
      </Sect>

      {/* Spacing & shadow */}
      <Sect kicker="04" title="Espace · ombre">
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40 }}>
          <div>
            <div className="sy-mono" style={{ marginBottom: 10 }}>échelle d'espacement · base 4 px</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
              {[4, 8, 12, 16, 20, 24, 32, 48, 64, 96].map(n => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{ width: 22, height: n, background: 'var(--primary)' }} />
                  <div className="sy-mono" style={{ marginTop: 6 }}>{n}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="sy-mono" style={{ marginBottom: 10 }}>élévations</div>
            <div style={{ display: 'flex', gap: 18 }}>
              {[
                { name: 'sm', sh: 'var(--shadow-sm)' },
                { name: 'md', sh: 'var(--shadow-md)' },
                { name: 'lg', sh: 'var(--shadow-lg)' },
              ].map(s => (
                <div key={s.name} style={{ textAlign: 'center' }}>
                  <div style={{ width: 80, height: 80, background: 'var(--surface)',
                    borderRadius: 'var(--radius-md)', boxShadow: s.sh }} />
                  <div className="sy-mono" style={{ marginTop: 8 }}>{s.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Sect>
    </Page>
  );
}

// ============================================================
// COMPONENTS
// ============================================================
function ComponentsPage() {
  return (
    <Page title="Composants" sub="Bibliothèque atomique : boutons, chips, inputs, cartes, progress, avatars, tabs. Tout dérive des tokens — changer un thème met tout à jour.">
      <Sect kicker="01" title="Boutons">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn variant="primary">Réserver →</Btn>
          <Btn variant="dark">Voir l'asso</Btn>
          <Btn variant="brand">Inscrire mon club</Btn>
          <Btn variant="outline">Filtres</Btn>
          <Btn variant="soft">Annuler</Btn>
          <Btn variant="ghost">En savoir plus</Btn>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
          <Btn variant="primary" size="xl">Découvrir les prestations</Btn>
          <Btn variant="primary" size="lg">Réserver maintenant</Btn>
          <Btn variant="primary">Réserver</Btn>
          <Btn variant="primary" size="sm">Voir</Btn>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14 }}>
          <Btn variant="primary" icon={<Icon name="search" size={15} color="#fff" />}>Rechercher</Btn>
          <Btn variant="outline" iconRight={<Icon name="arrow" size={14} />}>Voir tout</Btn>
          <Btn variant="dark" icon={<Icon name="heart" size={15} color="#fff" />}>Sauver</Btn>
          <IconBtn><Icon name="share" size={16} /></IconBtn>
          <IconBtn><Icon name="heart" size={16} /></IconBtn>
        </div>
      </Sect>

      <Sect kicker="02" title="Chips & tags">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Chip>BBQ</Chip>
          <Chip variant="outline">Animation</Chip>
          <Chip variant="solid">Événement</Chip>
          <Chip variant="accent">+ filtres</Chip>
          <Chip variant="primary"><Icon name="check" size={11} color="currentColor" /> vérifié</Chip>
          <Chip variant="highlight">★ 4.9</Chip>
          <Chip size="sm">Rennes</Chip>
          <Chip size="lg">Repas / BBQ</Chip>
        </div>
      </Sect>

      <Sect kicker="03" title="Inputs">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          <Field label="Nom de la prestation">
            <Input defaultValue="Barbecue convivial du club" />
          </Field>
          <Field label="Ville" hint="Recherche dans un rayon de 30 km">
            <Input defaultValue="Rennes" icon={<Icon name="pin" size={15} />} />
          </Field>
          <Field label="Description">
            <Textarea defaultValue="Une équipe de bénévoles vient cuisiner chez vous..." />
          </Field>
        </div>
        <div style={{ marginTop: 18, maxWidth: 980 }}>
          <SearchBar />
        </div>
      </Sect>

      <Sect kicker="04" title="Surfaces · cartes">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <Card>
            <div className="sy-mono">Default</div>
            <div className="sy-h3" style={{ marginTop: 4 }}>Card</div>
            <div className="sy-small sy-muted" style={{ marginTop: 4 }}>Surface + line border.</div>
          </Card>
          <Card variant="elevated">
            <div className="sy-mono">Elevated</div>
            <div className="sy-h3" style={{ marginTop: 4 }}>Card</div>
            <div className="sy-small sy-muted" style={{ marginTop: 4 }}>Shadow, no border.</div>
          </Card>
          <Card variant="flat">
            <div className="sy-mono">Flat</div>
            <div className="sy-h3" style={{ marginTop: 4 }}>Card</div>
            <div className="sy-small sy-muted" style={{ marginTop: 4 }}>Surface-2, blend.</div>
          </Card>
          <Card variant="ink">
            <div className="sy-mono" style={{ color: 'var(--ink-3)' }}>Ink</div>
            <div className="sy-h3" style={{ marginTop: 4, color: 'var(--surface)' }}>Card</div>
            <div className="sy-small" style={{ marginTop: 4, color: 'var(--ink-3)' }}>Dark surface for contrast.</div>
          </Card>
        </div>
      </Sect>

      <Sect kicker="05" title="Tabs · avatars · stars · progress">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div className="sy-mono" style={{ marginBottom: 10 }}>Tabs</div>
            <Tabs items={['Pertinence', 'Prix', 'Note', 'Distance']} active="Pertinence" />
            <div style={{ marginTop: 14 }}>
              <Tabs variant="underline" items={['Prestations', 'Associations', 'Carte', 'Projets']} active="Prestations" />
            </div>
          </div>
          <div>
            <div className="sy-mono" style={{ marginBottom: 10 }}>Avatars · stars · progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar initials="UV" tone="green" />
              <Avatar initials="AS" tone="orange" />
              <Avatar initials="JA" tone="yellow" size="lg" />
              <Avatar initials="SR" tone="ink" size="xl" />
              <AvatarStack items={[
                { initials: 'CL', tone: 'orange' },
                { initials: 'HM', tone: 'green' },
                { initials: 'LP', tone: 'yellow' },
              ]} extra={42} />
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 16 }}>
              <Stars value={4.9} mono /> <Stars value={4.2} mono /> <Stars value={3.5} mono />
            </div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320 }}>
              <Progress value={0.32} />
              <Progress value={0.62} size="tall" />
              <Progress value={0.85} size="xl" variant="primary" />
            </div>
          </div>
        </div>
      </Sect>

      <Sect kicker="06" title="Navigation">
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <TopNav active="prestations" />
        </Card>
      </Sect>
    </Page>
  );
}

// ============================================================
// PATTERNS — domain composites
// ============================================================
function PatternsPage() {
  return (
    <Page title="Patterns" sub="Composants composés spécifiques à Sociuly : carte prestation, carte projet, fiche association, bloc impact, avis client, encart de réservation.">

      <Sect kicker="01" title="Carte prestation">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          <PrestationCard hue="green" />
          <PrestationCard title="Olympiades en entreprise" price={720} hue="orange" goal={0.78} funds="Mini-bus du club" />
          <PrestationCard title="Anniversaire sportif" price={180} hue="yellow" goal={0.25} funds="Maillots saison" rating={4.6} />
          <PrestationCard title="Buvette événement" price={350} hue="teal" goal={0.55} funds="Vestiaires neufs" />
        </div>
      </Sect>

      <Sect kicker="02" title="Carte projet">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          <ProjectCard hue="orange" />
          <ProjectCard title="Maillots saison 2026" asso="AS Saint-Brieuc" hue="green" value={0.7} collected={1050} target={1500} bookings={9} days={20} />
          <ProjectCard title="Rénovation vestiaires" asso="JA Rennes" hue="yellow" value={0.32} collected={3200} target={10000} bookings={18} days={42} />
          <ProjectCard title="Tournoi national U13" asso="EC Bruz" hue="teal" value={1} collected={3500} target={3500} status="funded" />
        </div>
      </Sect>

      <Sect kicker="03" title="Fiche association · bloc impact · avis">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: 18 }}>
          <AssoCard />
          <ImpactBlock />
          <ReviewCard />
        </div>
      </Sect>

      <Sect kicker="04" title="Encart de réservation">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18 }}>
          <BookingCard />
          <BookingCard withImpact={false} />
          <ImpactBlock variant="mini" />
          <ImpactRibbon />
        </div>
      </Sect>
    </Page>
  );
}

// ============================================================
// SIGNATURE
// ============================================================
function SignaturePage() {
  return (
    <Page title="Signature · Impact" sub="Le moment distinctif de Sociuly : visualiser, à chaque réservation, à quel point votre geste fait avancer un projet réel. Trois variations selon le contexte (hero, ruban, carte territoire).">
      <Sect kicker="01" title="Impact Hero — détail prestation, confirmation">
        <div style={{ maxWidth: 720 }}>
          <ImpactHero />
        </div>
      </Sect>

      <Sect kicker="02" title="Impact Ribbon — listes, cards horizontales">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
          <ImpactRibbon title="Tournoi Espagne U17" value={0.62} delta={0.06} />
          <ImpactRibbon title="Maillots saison · AS Saint-Brieuc" value={0.7} delta={0.04} />
          <ImpactRibbon title="Vestiaires neufs · JA Rennes" value={0.32} delta={0.08} />
        </div>
      </Sect>

      <Sect kicker="03" title="Impact Map — carte territoire d'impact">
        <ImpactMap />
      </Sect>
    </Page>
  );
}

Object.assign(window, { FoundationsPage, ComponentsPage, PatternsPage, SignaturePage });
