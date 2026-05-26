// Sociuly — Landing screen (desktop + mobile)

function LandingDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <TopNav active="prestations" />

      {/* HERO */}
      <div style={{ padding: '36px 48px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 36, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <Chip variant="primary" leadingDot>en direct</Chip>
              <span className="sy-mono sy-num">€184 230 reversés · 238 clubs · 1 612 projets</span>
            </div>
            <h1 className="sy-display" style={{ fontSize: 84, letterSpacing: '-0.038em', lineHeight: 0.93 }}>
              Réservez<br />près de chez vous.<br />
              <span style={{ color: 'var(--accent)' }}>Financez le club d'à côté.</span>
            </h1>
            <p className="sy-body-l" style={{ maxWidth: 480, marginTop: 18 }}>
              Barbecues, animations, événements proposés par les associations sportives locales.
              Chaque réservation finance un projet réel d'un club près de chez vous.
            </p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Btn variant="primary" size="lg" iconRight={<Icon name="arrow" size={16} color="#fff" />}>
                Découvrir les prestations
              </Btn>
              <Btn variant="outline" size="lg">Inscrire mon association</Btn>
            </div>
          </div>

          {/* hero image collage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gridTemplateRows: '1fr 1fr',
            gap: 12, height: 480 }}>
            <div className="sy-img" style={{ gridRow: '1 / 3',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(165deg, #1f4b3f 0%, #14332b 100%)',
              position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="0 0 220 320" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4 }}>
                <circle cx="160" cy="80" r="50" fill="#f1c14a" opacity=".7" />
                <path d="M0 240 Q 60 200 110 220 T 220 200 L 220 320 L 0 320 Z" fill="#e8623d" opacity=".55" />
                <path d="M0 280 Q 80 250 130 270 T 220 260 L 220 320 L 0 320 Z" fill="#14332b" />
              </svg>
              <span className="sy-img-label" style={{ position: 'absolute', bottom: 16, left: 16,
                background: 'rgba(252,249,241,.95)' }}>Scène lifestyle · BBQ équipe sportive</span>
            </div>
            <div className="sy-img" style={{ borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(165deg, #e8623d 0%, #c0451f 100%)', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .5 }}>
                <circle cx="50" cy="50" r="22" fill="#fff" />
                <path d="M30 80 L 70 80 M40 60 L 60 60" stroke="#fff" strokeWidth="3" />
              </svg>
              <span className="sy-img-label" style={{ position: 'absolute', bottom: 12, left: 12,
                background: 'rgba(252,249,241,.95)' }}>Animation sportive</span>
            </div>
            <div className="sy-img" style={{ borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(165deg, #b8861a 0%, #8a6b3e 100%)', position: 'relative', overflow: 'hidden' }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .35 }}>
                <path d="M0 70 L 30 50 L 60 65 L 100 40 L 100 100 L 0 100 Z" fill="#fff" />
              </svg>
              <span className="sy-img-label" style={{ position: 'absolute', bottom: 12, left: 12,
                background: 'rgba(252,249,241,.95)' }}>Événement</span>
            </div>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div style={{ marginTop: 36 }}>
          <SearchBar />
        </div>
      </div>

      {/* HOW IT WORKS strap */}
      <div style={{ padding: '40px 48px 0' }}>
        <div className="sy-card" style={{ background: 'var(--ink)', border: 'none',
          borderRadius: 'var(--radius-xl)', padding: '28px 32px', display: 'grid',
          gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'center' }}>
          <div>
            <div className="sy-mono" style={{ color: 'var(--highlight)' }}>Comment ça marche</div>
            <h2 className="sy-h1" style={{ color: 'var(--surface)', marginTop: 6, fontSize: 32 }}>
              Réserver, c'est<br />financer un projet local.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, alignItems: 'flex-start' }}>
            {[
              ['01', 'Choisissez une prestation', 'BBQ, animation, événement — proposés par les clubs proches.'],
              ['02', 'Réservez en ligne', 'Paiement sécurisé Stripe. Annulation J-7 gratuite.'],
              ['03', 'Le club encaisse', 'Un projet réel avance — vous voyez l\'impact concret.'],
            ].map(([n, t, d]) => (
              <div key={n}>
                <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 32, lineHeight: 1,
                  color: 'var(--accent)', fontVariationSettings: 'var(--display-var)' }}>{n}</div>
                <div className="sy-h3" style={{ color: 'var(--surface)', marginTop: 6 }}>{t}</div>
                <div className="sy-small" style={{ color: 'var(--ink-3)', marginTop: 4 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingDesktop2() {
  // Second scroll: featured prestations + impact projects
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden', padding: '36px 48px 0' }}>
      {/* Featured prestations */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div className="sy-mono">Prestations populaires · Rennes</div>
          <h2 className="sy-h1" style={{ marginTop: 6 }}>Près de chez vous, cette semaine.</h2>
        </div>
        <Btn variant="ghost" iconRight={<Icon name="arrow" size={14} />}>Voir tout</Btn>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
        <PrestationCard hue="green" />
        <PrestationCard title="Olympiades en entreprise" price={720} hue="orange" goal={0.78} funds="Mini-bus du club" />
        <PrestationCard title="Anniversaire sportif" price={180} hue="yellow" goal={0.25} funds="Maillots saison" rating={4.6} />
        <PrestationCard title="Buvette événement" price={350} hue="teal" goal={0.55} funds="Vestiaires neufs" />
      </div>

      {/* Impact section */}
      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 36, alignItems: 'center' }}>
        <div>
          <div className="sy-mono">Notre impact</div>
          <h2 className="sy-display-sm" style={{ marginTop: 8, fontSize: 56, lineHeight: 1 }}>
            €184k<br />pour <span style={{ color: 'var(--accent)' }}>238 clubs</span> en 12 mois.
          </h2>
          <p className="sy-body-l" style={{ marginTop: 14, maxWidth: 400 }}>
            Sociuly relie particuliers et entreprises aux associations sportives qui proposent des services locaux.
            Chaque euro reversé reste sur le territoire.
          </p>
          <div style={{ marginTop: 24, paddingTop: 22, borderTop: '1px solid var(--line)',
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            <div>
              <div className="sy-display-sm sy-num" style={{ fontSize: 32 }}>238</div>
              <div className="sy-mono" style={{ marginTop: 4 }}>clubs actifs</div>
            </div>
            <div>
              <div className="sy-display-sm sy-num" style={{ fontSize: 32 }}>1 612</div>
              <div className="sy-mono" style={{ marginTop: 4 }}>projets financés</div>
            </div>
            <div>
              <div className="sy-display-sm sy-num" style={{ fontSize: 32, color: 'var(--accent)' }}>92%</div>
              <div className="sy-mono" style={{ marginTop: 4 }}>reste local</div>
            </div>
          </div>
        </div>
        <ImpactMap style={{ aspectRatio: '4/3' }} />
      </div>

      {/* CTA strip */}
      <div style={{ marginTop: 48, paddingBottom: 36 }}>
        <Card variant="accent" style={{ padding: 36, borderRadius: 'var(--radius-xl)',
          display: 'flex', alignItems: 'center', gap: 36, justifyContent: 'space-between' }}>
          <div>
            <h2 className="sy-h1" style={{ fontSize: 40, lineHeight: 1.05 }}>
              Vous êtes un club ?<br />
              <span style={{ color: 'var(--accent-deep)' }}>Inscrivez-le en 5 minutes.</span>
            </h2>
            <p className="sy-body-l" style={{ marginTop: 10, maxWidth: 480 }}>
              Proposez vos prestations, liez-les à vos projets de saison. Sociuly s'occupe de tout le reste.
            </p>
          </div>
          <Btn variant="primary" size="xl">Inscrire mon association →</Btn>
        </Card>
      </div>
    </div>
  );
}

function LandingDesktop3() {
  // Third scroll: categories, testimonials, FAQ, footer
  const cats = [
    { id: 'bbq',       label: 'BBQ & buvettes',       count: 84,  hue: 'orange' },
    { id: 'anim',      label: 'Animation enfants',    count: 121, hue: 'yellow' },
    { id: 'olym',      label: 'Olympiades entreprise',count: 47,  hue: 'green' },
    { id: 'event',     label: 'Événements & soirées', count: 62,  hue: 'teal' },
    { id: 'coach',     label: 'Coaching sportif',     count: 38,  hue: 'green' },
    { id: 'tournoi',   label: 'Tournois & cup',       count: 19,  hue: 'orange' },
  ];

  const hueBg = {
    orange: 'linear-gradient(160deg, #e8623d 0%, #c0451f 100%)',
    yellow: 'linear-gradient(160deg, #f1c14a 0%, #b8861a 100%)',
    green:  'linear-gradient(160deg, #1f4b3f 0%, #14332b 100%)',
    teal:   'linear-gradient(160deg, #2a6f5c 0%, #14332b 100%)',
  };

  const reviews = [
    {
      who: 'Camille R.',
      role: 'Présidente · US Cesson Handball',
      quote: 'En six mois on a financé les maillots U13 + un tournoi régional. Le tunnel de réservation est tellement clair que mes bénévoles n\'ont rien à gérer.',
    },
    {
      who: 'Thomas M.',
      role: 'Office Manager · Klaxoon',
      quote: 'On a remplacé notre traiteur séminaire par un BBQ d\'un club du quartier. Coût identique, impact local visible, équipe ravie.',
    },
    {
      who: 'Sophie L.',
      role: 'Trésorière · RC Rennes XV',
      quote: 'Le suivi des projets par prestation change tout : on voit exactement combien il reste à financer pour le mini-bus.',
    },
  ];

  const faq = [
    {
      q: 'Comment Sociuly se rémunère ?',
      a: 'Une commission de 6% sur chaque réservation, prélevée sur les frais Stripe. Le club reçoit 94% du montant. Aucun coût d\'inscription.',
    },
    {
      q: 'Qui propose les prestations ?',
      a: 'Uniquement des associations sportives loi 1901 vérifiées. Nous validons leur SIRET, leur affiliation fédérale et leur identité bancaire avant publication.',
    },
    {
      q: 'Et si la prestation est annulée ?',
      a: 'Annulation gratuite jusqu\'à 7 jours avant. Au-delà, le montant reste acquis au club pour le projet financé. Vous recevez un avoir d\'un an.',
    },
    {
      q: 'Comment le club lie une prestation à un projet ?',
      a: 'Depuis la console club, chaque prestation est rattachée à un projet de saison (équipement, déplacement, formation). Le compteur se met à jour à chaque réservation encaissée.',
    },
    {
      q: 'Couvrez-vous toute la France ?',
      a: 'Aujourd\'hui Rennes, Nantes, Brest, Saint-Brieuc. Déploiement national prévu printemps 2027.',
    },
  ];

  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>

      {/* CATEGORIES */}
      <div style={{ padding: '36px 48px 0' }}>
        <SectionHeader
          kicker="Par type d'expérience"
          title="Quel moment cherchez-vous ?"
          action={<Btn variant="ghost" iconRight={<Icon name="arrow" size={14} />}>Toutes les catégories</Btn>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {cats.map(c => (
            <a key={c.id} href="#/marketplace" style={{ textDecoration: 'none' }}>
              <div className="sy-card" style={{
                background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
                padding: 18, display: 'flex', gap: 18, alignItems: 'stretch',
                transition: 'transform 160ms ease, box-shadow 160ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <div className="sy-img" style={{
                  width: 96, height: 96, borderRadius: 'var(--radius-lg)',
                  background: hueBg[c.hue], flexShrink: 0, position: 'relative', overflow: 'hidden',
                }}>
                  <svg viewBox="0 0 96 96" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .45 }}>
                    <circle cx="68" cy="32" r="18" fill="#fff" opacity=".55" />
                    <path d="M0 70 Q 30 55 50 65 T 96 60 L 96 96 L 0 96 Z" fill="#fff" opacity=".2" />
                  </svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                  <div>
                    <div className="sy-h3" style={{ color: 'var(--ink)' }}>{c.label}</div>
                    <div className="sy-mono" style={{ marginTop: 4 }}>
                      <span className="sy-num">{c.count}</span> prestations
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="sy-small" style={{ color: 'var(--ink-3)' }}>Toute l'année</span>
                    <Icon name="arrow" size={16} color="var(--ink)" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ padding: '64px 48px 0' }}>
        <SectionHeader
          kicker="Témoignages"
          title="Clubs et entreprises en parlent."
          action={<span className="sy-mono">+ 2 100 avis · 4,8 ★</span>}
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {reviews.map((r, i) => (
            <Card key={i} variant="flat" style={{
              padding: 24, borderRadius: 'var(--radius-xl)',
              display: 'flex', flexDirection: 'column', gap: 18,
              background: i === 1 ? 'var(--ink)' : 'var(--surface)',
              color: i === 1 ? 'var(--surface)' : 'var(--ink)',
              border: i === 1 ? 'none' : '1px solid var(--line)',
            }}>
              <svg width="28" height="22" viewBox="0 0 28 22" style={{ flexShrink: 0 }}>
                <path d="M0 22 L 0 12 Q 0 0 12 0 L 12 6 Q 6 6 6 12 L 12 12 L 12 22 Z M 16 22 L 16 12 Q 16 0 28 0 L 28 6 Q 22 6 22 12 L 28 12 L 28 22 Z"
                  fill={i === 1 ? 'var(--highlight)' : 'var(--accent)'} />
              </svg>
              <p className="sy-body-l" style={{
                color: i === 1 ? 'var(--surface)' : 'var(--ink)',
                textWrap: 'pretty', flex: 1,
              }}>"{r.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12,
                paddingTop: 14, borderTop: `1px solid ${i === 1 ? 'rgba(252,249,241,.14)' : 'var(--line)'}` }}>
                <Avatar initials={r.who.split(' ').map(w => w[0]).join('')} size="md"
                  tone={i === 1 ? 'yellow' : 'green'} />
                <div style={{ minWidth: 0 }}>
                  <div className="sy-h4" style={{ color: i === 1 ? 'var(--surface)' : 'var(--ink)' }}>{r.who}</div>
                  <div className="sy-mono" style={{ marginTop: 2,
                    color: i === 1 ? 'var(--ink-3)' : 'var(--ink-3)' }}>{r.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: '64px 48px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, alignItems: 'flex-start' }}>
          <div style={{ position: 'sticky', top: 24 }}>
            <div className="sy-mono">Questions fréquentes</div>
            <h2 className="sy-h1" style={{ marginTop: 6 }}>Tout ce qu'il faut<br />savoir avant de réserver.</h2>
            <p className="sy-body" style={{ marginTop: 14, maxWidth: 320 }}>
              Vous ne trouvez pas votre réponse ?
            </p>
            <div style={{ marginTop: 14 }}>
              <Btn variant="outline" size="md" iconRight={<Icon name="arrow" size={14} />}>
                Contacter l'équipe
              </Btn>
            </div>
          </div>
          <div>
            {faq.map((it, i) => (
              <details key={i} style={{
                borderTop: i === 0 ? '1px solid var(--line)' : 'none',
                borderBottom: '1px solid var(--line)',
                padding: '20px 0',
              }}>
                <summary style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  listStyle: 'none', cursor: 'pointer',
                  fontFamily: 'var(--display)', fontWeight: 600, fontSize: 22,
                  letterSpacing: '-0.015em', color: 'var(--ink)',
                  fontVariationSettings: 'var(--display-var)',
                }}>
                  <span style={{ textWrap: 'pretty', paddingRight: 20 }}>{it.q}</span>
                  <span style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--surface)', border: '1px solid var(--line)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 18, lineHeight: 1,
                    color: 'var(--ink)', flexShrink: 0,
                  }}>+</span>
                </summary>
                <p className="sy-body-l" style={{ marginTop: 14, maxWidth: 640, textWrap: 'pretty' }}>{it.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* PARTNERS / TRUST */}
      <div style={{ padding: '64px 48px 0' }}>
        <div className="sy-card" style={{
          background: 'var(--surface)', border: '1px solid var(--line)',
          borderRadius: 'var(--radius-xl)', padding: '32px 36px',
          display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: 32, alignItems: 'center',
        }}>
          <div>
            <div className="sy-mono">Ils nous soutiennent</div>
            <div className="sy-h3" style={{ marginTop: 4 }}>Fédérations, collectivités, partenaires institutionnels.</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24, alignItems: 'center' }}>
            {['FFF', 'FFR', 'FFHB', 'Rennes Métropole', 'CROS Bretagne'].map(p => (
              <div key={p} style={{
                fontFamily: 'var(--display)', fontWeight: 700, fontSize: 18,
                letterSpacing: '-0.01em', color: 'var(--ink-3)',
                textAlign: 'center', padding: '14px 8px',
                border: '1px dashed var(--line-2)', borderRadius: 'var(--radius-md)',
                fontVariationSettings: 'var(--display-var)',
              }}>{p}</div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <SiteFooter />
    </div>
  );
}

function SiteFooter() {
  const cols = [
    {
      title: 'Sociuly',
      links: [
        ['Comment ça marche', '#/'],
        ['Marketplace',       '#/marketplace'],
        ['Projets financés',  '#/projets'],
        ['Notre impact',      '#/'],
      ],
    },
    {
      title: 'Clubs & assos',
      links: [
        ['Inscrire mon club',  '#/club'],
        ['Console club',       '#/club'],
        ['Tarification',       '#/'],
        ['Guide démarrage',    '#/'],
      ],
    },
    {
      title: 'Entreprises',
      links: [
        ['Séminaires d\'équipe', '#/marketplace'],
        ['Mécénat sportif',      '#/'],
        ['Devis sur mesure',     '#/'],
        ['Études de cas',        '#/'],
      ],
    },
    {
      title: 'Légal',
      links: [
        ['Conditions générales', '#/'],
        ['Confidentialité',      '#/'],
        ['Mentions légales',     '#/'],
        ['Cookies',              '#/'],
      ],
    },
  ];

  return (
    <footer style={{
      marginTop: 64,
      background: 'var(--ink)', color: 'var(--surface)',
      padding: '56px 48px 28px',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr repeat(4, 1fr)', gap: 36 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <svg width="28" height="28" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="var(--primary)" />
              <circle cx="16" cy="16" r="6" fill="var(--accent)" />
            </svg>
            <span style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 24,
              letterSpacing: '-0.02em', color: 'var(--surface)',
              fontVariationSettings: "'wdth' 95" }}>Sociuly</span>
          </div>
          <p className="sy-body" style={{ marginTop: 14, maxWidth: 320, color: 'var(--ink-2)' }}>
            La plateforme qui finance le sport amateur local, une réservation à la fois.
          </p>
          <div style={{ marginTop: 22 }}>
            <div className="sy-mono" style={{ color: 'var(--ink-3)' }}>Restez au courant</div>
            <div style={{
              marginTop: 10, display: 'flex',
              background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
              padding: 4, gap: 4, maxWidth: 340,
            }}>
              <input
                type="email"
                placeholder="vous@asso.fr"
                style={{
                  flex: 1, border: 'none', background: 'transparent', outline: 'none',
                  padding: '8px 12px', fontSize: 14, fontFamily: 'var(--sans)',
                  color: 'var(--ink)',
                }}
              />
              <button style={{
                background: 'var(--accent)', color: 'var(--surface)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                padding: '8px 16px', fontSize: 13, fontWeight: 600,
                fontFamily: 'var(--sans)', cursor: 'pointer',
              }}>S'abonner</button>
            </div>
            <div className="sy-small" style={{ marginTop: 8, color: 'var(--ink-3)' }}>
              Une newsletter mensuelle. Pas de spam.
            </div>
          </div>
        </div>

        {cols.map(col => (
          <div key={col.title}>
            <div className="sy-mono" style={{ color: 'var(--ink-3)' }}>{col.title}</div>
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map(([label, href]) => (
                <a key={label} href={href} style={{
                  color: 'var(--surface)', textDecoration: 'none',
                  fontSize: 14, fontFamily: 'var(--sans)',
                }}>{label}</a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 56, paddingTop: 22,
        borderTop: '1px solid rgba(252,249,241,.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 18, flexWrap: 'wrap',
      }}>
        <div className="sy-mono" style={{ color: 'var(--ink-3)' }}>
          © 2026 Sociuly SAS · Rennes · RCS B 924 318 027
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <span className="sy-mono" style={{ color: 'var(--ink-3)' }}>Suivez-nous</span>
          {['IG', 'LI', 'X', 'YT'].map(s => (
            <a key={s} href="#/" style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid rgba(252,249,241,.18)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
              color: 'var(--surface)', textDecoration: 'none',
              letterSpacing: '0.04em',
            }}>{s}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function LandingMobile() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <MobileTopNav />

      <div style={{ padding: '20px 18px' }}>
        <Chip variant="primary" leadingDot>en direct · €184k reversés</Chip>
        <h1 className="sy-display-sm" style={{ marginTop: 14, fontSize: 40, lineHeight: 0.96 }}>
          Réservez<br />près de chez vous.<br />
          <span style={{ color: 'var(--accent)' }}>Financez le club d'à côté.</span>
        </h1>
        <p className="sy-body" style={{ marginTop: 12 }}>
          Animations et événements proposés par les clubs locaux. Chaque réservation finance un projet réel.
        </p>

        <div className="sy-img" style={{ height: 220, marginTop: 18,
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(165deg, #1f4b3f 0%, #14332b 100%)', position: 'relative', overflow: 'hidden' }}>
          <svg viewBox="0 0 220 220" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .4 }}>
            <circle cx="160" cy="60" r="36" fill="#f1c14a" opacity=".7" />
            <path d="M0 170 Q 60 130 110 150 T 220 130 L 220 220 L 0 220 Z" fill="#e8623d" opacity=".55" />
            <path d="M0 200 Q 80 175 130 195 T 220 185 L 220 220 L 0 220 Z" fill="#14332b" />
          </svg>
        </div>

        <Btn variant="primary" size="lg" block style={{ marginTop: 16 }}>
          Découvrir les prestations
        </Btn>
        <Btn variant="outline" block style={{ marginTop: 8 }}>Inscrire mon association</Btn>

        <Card variant="flat" style={{ marginTop: 24, padding: 16, borderRadius: 'var(--radius-lg)' }}>
          <div className="sy-mono">Près de vous · Rennes</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', marginTop: 8 }}>
            <div>
              <div className="sy-display-sm sy-num" style={{ fontSize: 28 }}>12</div>
              <div className="sy-mono" style={{ marginTop: 2 }}>clubs actifs</div>
            </div>
            <div>
              <div className="sy-display-sm sy-num" style={{ fontSize: 28 }}>€8 320</div>
              <div className="sy-mono" style={{ marginTop: 2 }}>cette semaine</div>
            </div>
          </div>
        </Card>

        <div className="sy-h3" style={{ marginTop: 24, marginBottom: 12 }}>Populaires cette semaine</div>
        <div style={{ display: 'grid', gap: 12 }}>
          <PrestationCard compact />
          <PrestationCard compact title="Olympiades entreprise" price={720} hue="orange" goal={0.78} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LandingDesktop, LandingDesktop2, LandingDesktop3, SiteFooter, LandingMobile });
