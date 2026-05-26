// Sociuly — Booking flow (single page progressive, with impact preview right rail)

function BookingStepDot({ n, label, state }) {
  // state: 'done' | 'active' | 'upcoming'
  const colors = {
    done:    { bg: 'var(--primary)',  fg: '#fff',           bd: 'var(--primary)' },
    active:  { bg: 'var(--ink)',      fg: 'var(--surface)', bd: 'var(--ink)' },
    upcoming:{ bg: 'var(--surface)',  fg: 'var(--ink-3)',   bd: 'var(--line-2)' },
  };
  const c = colors[state];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.bg, color: c.fg,
        border: `1.5px solid ${c.bd}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 13 }}>
        {state === 'done' ? <Icon name="check" size={14} color="#fff" /> : n}
      </div>
      <div className="sy-small" style={{ fontWeight: state === 'active' ? 600 : 500,
        color: state === 'upcoming' ? 'var(--ink-3)' : 'var(--ink)' }}>{label}</div>
    </div>
  );
}

function BookingStepper({ active = 2 }) {
  const steps = ['Détails', 'Message', 'Paiement', 'Confirmation'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
      {steps.map((s, i) => {
        const state = i < active ? 'done' : i === active ? 'active' : 'upcoming';
        return (
          <React.Fragment key={s}>
            <BookingStepDot n={i + 1} label={s} state={state} />
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 1.5, background: i < active ? 'var(--primary)' : 'var(--line-2)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Reusable: section header inside the booking flow
function BookSection({ n, title, state, open, children, summary }) {
  const isActive = state === 'active';
  return (
    <Card style={{
      padding: 0, overflow: 'hidden',
      border: isActive ? '1.5px solid var(--ink)' : '1px solid var(--line)',
      background: 'var(--surface)',
    }}>
      <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: open ? '1px solid var(--line)' : 'none' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%',
          background: state === 'done' ? 'var(--primary)' : isActive ? 'var(--ink)' : 'var(--surface-2)',
          color: state === 'done' ? '#fff' : isActive ? 'var(--surface)' : 'var(--ink-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
          {state === 'done' ? <Icon name="check" size={14} color="#fff" /> : n}
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="sy-h3">{title}</h3>
          {!open && summary && <div className="sy-small sy-muted" style={{ marginTop: 2 }}>{summary}</div>}
        </div>
        {state === 'done' && !open && (
          <Btn variant="ghost" size="sm">Modifier</Btn>
        )}
      </div>
      {open && <div style={{ padding: '20px 22px' }}>{children}</div>}
    </Card>
  );
}

// Right-rail summary visible at every step
function BookingSummary() {
  return (
    <Card variant="elevated" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', gap: 12, padding: 18, borderBottom: '1px solid var(--line)' }}>
        <div className="sy-img" style={{ width: 80, height: 80, flex: '0 0 auto', borderRadius: 12,
          background: 'linear-gradient(135deg, #1f4b3f 0%, #14332b 100%)' }} />
        <div style={{ flex: 1 }}>
          <div className="sy-mono">USB Volley</div>
          <div className="sy-h4" style={{ marginTop: 2 }}>Barbecue convivial</div>
          <div className="sy-small sy-muted" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Stars value={4.9} size={11} /> 4.9 (47)
          </div>
        </div>
      </div>
      <div style={{ padding: 18 }}>
        <div className="sy-small" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="sy-muted">Date</span><span style={{ fontWeight: 500 }}>sam. 14 juin · 16h00</span>
        </div>
        <div className="sy-small" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="sy-muted">Participants</span><span style={{ fontWeight: 500 }}>24 personnes</span>
        </div>
        <div className="sy-small" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="sy-muted">Lieu</span><span style={{ fontWeight: 500 }}>12 rue de Vannes</span>
        </div>
        <hr className="sy-divider" style={{ margin: '14px 0' }} />
        <div className="sy-small" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="sy-muted">Prestation</span><span className="sy-num">€280,00</span>
        </div>
        <div className="sy-small" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="sy-muted">Frais Sociuly (3%)</span><span className="sy-num">€8,40</span>
        </div>
        <hr className="sy-divider" style={{ margin: '14px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div className="sy-h3">Total</div>
          <div style={{ fontFamily: 'var(--display)', fontWeight: 700, fontSize: 28,
            fontVariationSettings: 'var(--display-var)' }} className="sy-num">€288,40</div>
        </div>
      </div>
      <div style={{ padding: 18, background: 'var(--accent-soft)' }}>
        <ImpactBlock variant="mini" delta={84} />
      </div>
    </Card>
  );
}

function BookingDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      {/* slim top bar */}
      <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--surface)' }}>
        <Logo />
        <BookingStepper active={1} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="lock" size={14} color="var(--ink-3)" />
          <span className="sy-mono">paiement sécurisé Stripe</span>
        </div>
      </div>

      <div style={{ padding: '28px 48px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
        <div>
          <h1 className="sy-h1" style={{ marginBottom: 6 }}>Finalisez votre réservation</h1>
          <p className="sy-small sy-muted" style={{ marginBottom: 22 }}>
            Plus que quelques étapes — votre soutien ira directement au tournoi U17 d'USB Volley.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BookSection n={1} state="done" title="Détails de la prestation"
              summary="sam. 14 juin · 16h00 · 24 personnes · 12 rue de Vannes" />
            <BookSection n={2} state="active" open title="Message à l'association">
              <Field label="Votre nom">
                <Input defaultValue="Camille Léger" />
              </Field>
              <div style={{ height: 14 }} />
              <Field label="Téléphone (optionnel)" hint="Pour faciliter la coordination le jour J">
                <Input defaultValue="06 12 34 56 78" />
              </Field>
              <div style={{ height: 14 }} />
              <Field label="Message au club"
                hint="Précisez vos attentes, allergies, contraintes d'accès…">
                <Textarea defaultValue="Bonjour, c'est pour l'anniversaire de mon père (65 ans). On sera plutôt 22 adultes + 2 enfants. Pas d'allergies particulières, mais on aimerait des merguez et des saucisses végé." />
              </Field>
              <div style={{ height: 14 }} />
              {/* pourboire / coup de pouce */}
              <Card variant="accent" style={{ padding: 16, borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Icon name="sparkle" size={16} color="var(--accent-deep)" />
                  <div className="sy-h4">Ajouter un coup de pouce au projet ?</div>
                </div>
                <div className="sy-small" style={{ color: 'var(--ink-2)' }}>
                  100% reversé au tournoi U17. Optionnel et déductible d'impôts.
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                  {[0, 5, 10, 20].map((v, i) => (
                    <Btn key={v} variant={i === 2 ? 'primary' : 'soft'} size="sm">
                      {v === 0 ? 'aucun' : `+€${v}`}
                    </Btn>
                  ))}
                  <Btn variant="soft" size="sm">autre</Btn>
                </div>
              </Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <Btn variant="ghost">← Étape précédente</Btn>
                <Btn variant="dark" iconRight={<Icon name="arrow" size={14} color="#fff" />}>
                  Continuer vers le paiement
                </Btn>
              </div>
            </BookSection>
            <BookSection n={3} state="upcoming" title="Paiement" />
          </div>
        </div>

        <div>
          <div style={{ position: 'sticky', top: 16 }}>
            <BookingSummary />
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingConfirmDesktop() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--line)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <BookingStepper active={4} />
        <div className="sy-mono">✓ confirmation</div>
      </div>
      <div style={{ padding: '60px 48px', maxWidth: 920, margin: '0 auto' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
          <Icon name="check" size={36} color="#fff" />
        </div>
        <h1 className="sy-display-sm" style={{ textAlign: 'center', maxWidth: 620, margin: '0 auto', fontSize: 48 }}>
          C'est réservé. Et grâce à vous, <span style={{ color: 'var(--accent)' }}>le projet U17 avance.</span>
        </h1>
        <p className="sy-body-l" style={{ textAlign: 'center', marginTop: 14, color: 'var(--ink-2)' }}>
          Confirmation envoyée à <b style={{ color: 'var(--ink)' }}>camille.l@example.com</b>.
          USB Volley vous contactera sous 24h pour caler les détails.
        </p>

        <div style={{ marginTop: 36 }}>
          <ImpactHero />
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Btn variant="primary" size="lg" icon={<Icon name="download" size={15} color="#fff" />}>
            Télécharger le reçu
          </Btn>
          <Btn variant="outline" size="lg" icon={<Icon name="share" size={15} />}>
            Partager le projet
          </Btn>
        </div>
      </div>
    </div>
  );
}

function BookingMobile() {
  return (
    <div className="sy" style={{ background: 'var(--bg)', height: '100%', overflow: 'hidden',
      display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', gap: 14, background: 'var(--surface)' }}>
        <IconBtn size="sm"><Icon name="arrowLeft" size={16} /></IconBtn>
        <div style={{ flex: 1 }}>
          <div className="sy-h4">Réservation</div>
          <div className="sy-mono">Étape 2 / 4</div>
        </div>
        <div className="sy-mono">2/4</div>
      </div>

      {/* progress segments */}
      <div style={{ padding: '0 16px', display: 'flex', gap: 4, marginTop: 12 }}>
        {[true, true, false, false].map((on, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 4,
            background: on ? 'var(--primary)' : 'var(--surface-2)' }} />
        ))}
      </div>

      <div style={{ padding: '20px 16px 120px', flex: 1, overflow: 'hidden' }}>
        <h1 className="sy-h1" style={{ fontSize: 24 }}>Votre message au club</h1>
        <p className="sy-small sy-muted" style={{ marginTop: 4 }}>USB Volley vous contactera sous 24h.</p>

        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nom">
            <Input defaultValue="Camille Léger" />
          </Field>
          <Field label="Message">
            <Textarea defaultValue="Anniversaire de mon père (65 ans). On sera 22 adultes + 2 enfants…" />
          </Field>
        </div>

        <Card variant="accent" style={{ marginTop: 18, padding: 14 }}>
          <div className="sy-h4">Ajouter un coup de pouce ?</div>
          <div className="sy-small sy-muted" style={{ marginTop: 4 }}>100% reversé au tournoi U17.</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[0, 5, 10, 20].map((v, i) => (
              <Btn key={v} variant={i === 2 ? 'primary' : 'soft'} size="sm">
                {v === 0 ? 'aucun' : `+€${v}`}
              </Btn>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 14,
        background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
        <Btn variant="dark" size="lg" block iconRight={<Icon name="arrow" size={14} color="#fff" />}>
          Continuer · €288,40
        </Btn>
      </div>
    </div>
  );
}

Object.assign(window, { BookingDesktop, BookingConfirmDesktop, BookingMobile });
