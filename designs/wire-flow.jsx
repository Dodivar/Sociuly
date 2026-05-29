// Flow réservation — 4 étapes (variations)

function MiniStepper({ steps, current, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, ...style }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              border: `1.4px solid ${WIRE.ink}`,
              background: i < current ? WIRE.ink : i === current ? WIRE.accent : WIRE.paper,
              color: i <= current ? '#fff' : WIRE.ink,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: WIRE.sans, fontWeight: 700, fontSize: 11,
            }}>{i < current ? '✓' : i + 1}</span>
            <span style={{ fontSize: 11, color: i <= current ? WIRE.ink : WIRE.ink3, fontWeight: i === current ? 700 : 500 }}>{s}</span>
          </div>
          {i < steps.length - 1 && <i style={{ flex: 1, height: 1.4, background: i < current ? WIRE.ink : WIRE.line }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function RecapBlock() {
  return (
    <div className="wf-box" style={{ padding: 12 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <Img label="presta" h={56} style={{ width: 70 }} />
        <div style={{ flex: 1 }}>
          <div className="wf-h3">Barbecue club USB Volley</div>
          <div className="wf-mono">sam. 14 juin · 16h · 24 pers.</div>
        </div>
      </div>
      <div className="wf-divider-dashed" />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
        <span>Prestation</span><span>€280</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
        <span>Frais service</span><span>€8</span>
      </div>
      <div className="wf-divider-dashed" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="wf-h3">Total</div>
        <div className="wf-h2">€288</div>
      </div>
      <div className="wf-callout" style={{ marginTop: 10, padding: 8 }}>
        <div className="wf-mono">DONT REVERSÉS AU CLUB</div>
        <div className="wf-h3">€252 → Tournoi Espagne U17</div>
      </div>
    </div>
  );
}

// --- mobile step screens (helpers) ---
function MobileStep({ step, label, children }) {
  return (
    <Frame kind="mobile" label="" tag={`étape ${step + 1}/4`}>
      <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${WIRE.line2}` }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>←</span>
        <div style={{ flex: 1 }}>
          <div className="wf-mono">ÉTAPE {step + 1} / 4</div>
          <div className="wf-h3">{label}</div>
        </div>
      </div>
      <div style={{ padding: '12px 14px' }}>
        {children}
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION A — Linéaire : 4 écrans séparés (un step = un écran)
// ============================================================
function FlowA_Mobile1() {
  return (
    <MobileStep step={0} label="Informations">
      <div className="wf-mono">DATE & HEURE</div>
      <div className="wf-box" style={{ padding: 10, marginTop: 4 }}>
        <div className="wf-h3">Sam. 14 juin · 16h00</div>
        <div className="wf-mono" style={{ marginTop: 2 }}>changer ↓</div>
      </div>

      <div className="wf-mono" style={{ marginTop: 12 }}>ADRESSE</div>
      <div className="wf-box" style={{ padding: 10, marginTop: 4 }}>
        <div className="wf-skel" style={{ height: 6, width: '70%' }} />
        <div className="wf-skel" style={{ height: 6, width: '50%', marginTop: 4 }} />
      </div>

      <div className="wf-mono" style={{ marginTop: 12 }}>PARTICIPANTS</div>
      <div className="wf-box" style={{ padding: 10, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="wf-h3">24 personnes</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <Btn sm>−</Btn><Btn sm>+</Btn>
        </div>
      </div>

      <div className="wf-mono" style={{ marginTop: 12 }}>MESSAGE AU CLUB (optionnel)</div>
      <div className="wf-box" style={{ padding: 10, marginTop: 4, height: 60 }}>
        <div className="wf-skel" style={{ height: 6, width: '60%' }} />
      </div>
    </MobileStep>
  );
}

function FlowA_Mobile2() {
  return (
    <MobileStep step={1} label="Récapitulatif">
      <RecapBlock />
      <Note style={{ marginTop: 10, display: 'block' }}>l'utilisateur voit clairement où va l'argent ↑</Note>
    </MobileStep>
  );
}

function FlowA_Mobile3() {
  return (
    <MobileStep step={2} label="Paiement">
      <div className="wf-mono">MOYEN DE PAIEMENT</div>
      <div className="wf-box" style={{ padding: 10, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Chip solid>VISA</Chip>
        <div style={{ flex: 1 }} className="wf-h3">•••• 4242</div>
        <span style={{ color: WIRE.accent, fontWeight: 700 }}>✓</span>
      </div>
      <div className="wf-box" style={{ padding: 10, marginTop: 6 }}>
        <div className="wf-h3" style={{ color: WIRE.ink3 }}>+ Apple Pay</div>
      </div>
      <div className="wf-box" style={{ padding: 10, marginTop: 6 }}>
        <div className="wf-h3" style={{ color: WIRE.ink3 }}>+ Nouvelle carte</div>
      </div>

      <div className="wf-divider-dashed" />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="wf-h3">À payer</div>
        <div className="wf-h2">€288</div>
      </div>
      <div className="wf-mono" style={{ marginTop: 2 }}>dont €252 reversés au club</div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'flex', gap: 6, fontSize: 11, color: WIRE.ink2 }}>
          <span style={{ width: 14, height: 14, background: WIRE.accent, border: `1.3px solid ${WIRE.ink}`, borderRadius: 3 }} />
          J'accepte les CGV et la politique d'annulation
        </label>
      </div>
      <Btn primary block style={{ marginTop: 10 }}>Payer €288 →</Btn>
      <div className="wf-mono" style={{ textAlign: 'center', marginTop: 6 }}>🔒 Stripe sécurisé</div>
    </MobileStep>
  );
}

function FlowA_Mobile4() {
  return (
    <Frame kind="mobile" label="" tag="confirmation">
      <div style={{ padding: '40px 18px 14px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: WIRE.accentSoft, border: `1.5px solid ${WIRE.accent}`,
          color: WIRE.accent, fontSize: 32, fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>✓</div>
        <div className="wf-h1" style={{ fontSize: 22, marginTop: 14, lineHeight: 1.1 }}>
          Merci !<br />
          <span style={{ color: WIRE.accent }}>Vous aidez le club à financer le tournoi Espagne U17.</span>
        </div>
      </div>
      <div style={{ padding: '0 14px' }}>
        <div className="wf-callout">
          <div className="wf-mono">VOTRE CONTRIBUTION</div>
          <div className="wf-h2">+ €252 → projet</div>
          <Progress value={0.69} style={{ marginTop: 8 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 732 / €4 000 — vous avez fait avancer la jauge de 6 % 🎉</div>
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <Btn block sm>📅 Ajouter à mon calendrier</Btn>
        </div>
        <Btn primary block style={{ marginTop: 6 }}>Partager le projet du club</Btn>
        <Btn ghost block style={{ marginTop: 6 }}>Voir ma réservation</Btn>
      </div>
    </Frame>
  );
}

function FlowA_Desktop3_Payment() {
  return (
    <Frame kind="desktop" label="" tag="desktop · étape 3 (paiement)" height={H_FLOW_DESK}>
      <LandingNavD />
      <div style={{ padding: '20px 22px' }}>
        <MiniStepper steps={['Infos', 'Récap', 'Paiement', 'Confirmation']} current={2} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 18 }}>
          <div>
            <div className="wf-h2">Paiement sécurisé</div>
            <div className="wf-mono" style={{ marginTop: 2 }}>Stripe · vos données ne transitent pas par Sociuly</div>

            <div className="wf-h3" style={{ marginTop: 16 }}>Moyen de paiement</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
              <div className="wf-box" style={{ padding: 12, borderColor: WIRE.accent, background: WIRE.accentSoft }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip solid>VISA</Chip>
                  <span style={{ color: WIRE.accent, fontWeight: 700 }}>● sélectionné</span>
                </div>
                <div className="wf-h3" style={{ marginTop: 8 }}>•••• 4242</div>
                <div className="wf-mono">exp. 04/29</div>
              </div>
              <div className="wf-box" style={{ padding: 12 }}>
                <div className="wf-h3" style={{ color: WIRE.ink3 }}>+ Apple / Google Pay</div>
              </div>
              <div className="wf-box" style={{ padding: 12 }}>
                <div className="wf-h3" style={{ color: WIRE.ink3 }}>+ Nouvelle carte</div>
              </div>
              <div className="wf-box" style={{ padding: 12 }}>
                <div className="wf-h3" style={{ color: WIRE.ink3 }}>+ Virement SEPA</div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ display: 'flex', gap: 8, fontSize: 12, color: WIRE.ink2 }}>
                <span style={{ width: 16, height: 16, background: WIRE.accent, border: `1.3px solid ${WIRE.ink}`, borderRadius: 3 }} />
                J'accepte les <u>CGV</u> et la <u>politique d'annulation</u>
              </label>
              <label style={{ display: 'flex', gap: 8, fontSize: 12, color: WIRE.ink2, marginTop: 6 }}>
                <span style={{ width: 16, height: 16, background: WIRE.paper, border: `1.3px solid ${WIRE.ink}`, borderRadius: 3 }} />
                Recevoir les nouvelles du projet par e-mail
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <Btn ghost>← Retour récap</Btn>
              <Btn primary>Payer €288 →</Btn>
              <span className="wf-mono" style={{ alignSelf: 'center', marginLeft: 'auto' }}>🔒 paiement chiffré</span>
            </div>
          </div>

          <div>
            <RecapBlock />
            <Note style={{ marginTop: 8, display: 'block' }}>récap visible à droite à chaque étape ↑</Note>
          </div>
        </div>
      </div>
    </Frame>
  );
}

const H_FLOW_DESK = 760;

function FlowA_Strip() {
  return (
    <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', padding: '40px 28px 24px', width: '100%', height: '100%', flexWrap: 'wrap' }}>
      <FlowA_Desktop3_Payment />
      <div style={{ display: 'flex', gap: 22 }}>
        <FlowA_Mobile1 />
        <FlowA_Mobile2 />
        <FlowA_Mobile3 />
        <FlowA_Mobile4 />
      </div>
    </div>
  );
}

// ============================================================
// VARIATION B — Single-page progressive disclosure (toutes les sections sur 1 page)
// ============================================================
function FlowB_Desktop() {
  return (
    <Frame kind="desktop" label="B · Réservation — single page" tag="progressive disclosure" height={920}>
      <LandingNavD />
      <div style={{ padding: '20px 22px' }}>
        <MiniStepper steps={['Détails', 'Confirmation', 'Paiement']} current={0} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* section 1 expanded */}
            <div className="wf-box" style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="wf-mono">1 · DÉTAILS DE LA PRESTATION</div>
                  <div className="wf-h2" style={{ marginTop: 2 }}>Quand et pour combien de monde ?</div>
                </div>
                <span style={{ color: WIRE.accent, fontWeight: 700 }}>▾</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
                <div className="wf-box" style={{ padding: 10 }}>
                  <div className="wf-mono">DATE</div>
                  <div className="wf-h3">Sam. 14 juin</div>
                </div>
                <div className="wf-box" style={{ padding: 10 }}>
                  <div className="wf-mono">HEURE</div>
                  <div className="wf-h3">16h00</div>
                </div>
                <div className="wf-box" style={{ padding: 10 }}>
                  <div className="wf-mono">PERSONNES</div>
                  <div className="wf-h3">24</div>
                </div>
              </div>
              <div className="wf-box" style={{ padding: 10, marginTop: 10 }}>
                <div className="wf-mono">ADRESSE</div>
                <div className="wf-h3">12 rue des Acacias, Rennes</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <Btn primary>Continuer →</Btn>
              </div>
            </div>
            {/* section 2 collapsed */}
            <div className="wf-box" style={{ padding: 14, opacity: 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="wf-mono">2 · CONFIRMATION</div>
                  <div className="wf-h2" style={{ marginTop: 2 }}>Vérification et message au club</div>
                </div>
                <span style={{ color: WIRE.ink3 }}>▸</span>
              </div>
            </div>
            <div className="wf-box" style={{ padding: 14, opacity: 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="wf-mono">3 · PAIEMENT</div>
                  <div className="wf-h2" style={{ marginTop: 2 }}>Carte ou Apple Pay · Stripe</div>
                </div>
                <span style={{ color: WIRE.ink3 }}>▸</span>
              </div>
            </div>
          </div>

          {/* sticky right rail */}
          <div>
            <RecapBlock />
            <Note style={{ marginTop: 8, display: 'block' }}>
              accordéon vs steps séparés ↑
            </Note>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function FlowB_Mobile() {
  return (
    <Frame kind="mobile" label="" tag="mobile · accordéon">
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${WIRE.line2}` }}>
        <MiniStepper steps={['Détails', 'Confirm', 'Payer']} current={0} />
      </div>
      <div style={{ padding: '10px 14px' }}>
        <div className="wf-box" style={{ padding: 12 }}>
          <div className="wf-mono">1 · DÉTAILS</div>
          <div className="wf-h3" style={{ marginTop: 4 }}>Quand & combien</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 8 }}>
            <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">DATE</div><div className="wf-h3">14 juin</div></div>
            <div className="wf-box" style={{ padding: 8 }}><div className="wf-mono">PERS.</div><div className="wf-h3">24</div></div>
          </div>
          <Btn primary block style={{ marginTop: 10 }}>Continuer →</Btn>
        </div>
        <div className="wf-box" style={{ padding: 12, marginTop: 8, opacity: 0.6 }}>
          <div className="wf-mono">2 · CONFIRMATION</div><div className="wf-h3" style={{ marginTop: 2 }}>Récap & message</div>
        </div>
        <div className="wf-box" style={{ padding: 12, marginTop: 8, opacity: 0.6 }}>
          <div className="wf-mono">3 · PAIEMENT</div><div className="wf-h3" style={{ marginTop: 2 }}>Carte · Apple Pay</div>
        </div>
      </div>
      <div className="wf-sticky" style={{ position: 'absolute', bottom: 8, left: 8, right: 8, padding: 10, display: 'flex', gap: 10 }}>
        <div>
          <div className="wf-h2">€288</div>
          <div className="wf-mono">€252 au club</div>
        </div>
        <Btn primary block style={{ flex: 1 }}>Suivant →</Btn>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — états supplémentaires : progressive disclosure
// step 2 (confirmation), step 3 (paiement), step 4 (succès)
// ============================================================

// Reusable sections — collapsed (done), expanded, locked
function SectionRow({ n, label, title, state, children }) {
  // state: 'done' | 'active' | 'locked'
  const isDone = state === 'done';
  const isActive = state === 'active';
  const opacity = state === 'locked' ? 0.55 : 1;
  return (
    <div className="wf-box" style={{
      padding: 14,
      opacity,
      borderColor: isActive ? WIRE.accent : WIRE.ink,
      background: isActive ? WIRE.paper : isDone ? WIRE.paper2 : WIRE.paper,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            border: `1.4px solid ${WIRE.ink}`,
            background: isDone ? WIRE.ink : isActive ? WIRE.accent : WIRE.paper,
            color: isDone || isActive ? '#fff' : WIRE.ink,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: WIRE.sans, fontWeight: 700, fontSize: 11,
          }}>{isDone ? '✓' : n}</span>
          <div>
            <div className="wf-mono">{label}</div>
            <div className="wf-h2" style={{ marginTop: 2 }}>{title}</div>
          </div>
        </div>
        {isDone && <Btn sm ghost>Modifier</Btn>}
        {isActive && <span style={{ color: WIRE.accent, fontWeight: 700 }}>▾</span>}
        {state === 'locked' && <span style={{ color: WIRE.ink3 }}>▸</span>}
      </div>
      {children}
    </div>
  );
}

function FlowB_Desktop_Step2() {
  return (
    <Frame kind="desktop" label="" tag="état · étape 2 (confirmation)" height={920}>
      <LandingNavD />
      <div style={{ padding: '20px 22px' }}>
        <MiniStepper steps={['Détails', 'Confirmation', 'Paiement']} current={1} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* 1 done collapsed */}
            <SectionRow n={1} state="done" label="1 · DÉTAILS DE LA PRESTATION" title="Sam. 14 juin · 16h · 24 pers.">
              <div className="wf-mono" style={{ marginTop: 8 }}>12 rue des Acacias, Rennes</div>
            </SectionRow>

            {/* 2 active expanded */}
            <SectionRow n={2} state="active" label="2 · CONFIRMATION" title="Vérification et message au club">
              <div className="wf-divider-dashed" />
              <div className="wf-mono">MESSAGE AU CLUB (optionnel)</div>
              <div className="wf-box" style={{ padding: 10, marginTop: 4, minHeight: 70 }}>
                <span style={{ fontSize: 12 }}>“Hâte de soutenir les U17 — bon courage pour l’Espagne !”</span>
              </div>

              <div className="wf-mono" style={{ marginTop: 12 }}>POURBOIRE AU CLUB (optionnel)</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                <Chip>€0</Chip><Chip>€5</Chip><Chip solid>€10</Chip><Chip>€20</Chip><Chip>Autre…</Chip>
              </div>
              <div className="wf-mono" style={{ marginTop: 6 }}>100% du pourboire est reversé au projet du club.</div>

              <div className="wf-divider-dashed" />
              <label style={{ display: 'flex', gap: 8, fontSize: 12, color: WIRE.ink2 }}>
                <span style={{ width: 16, height: 16, background: WIRE.accent, border: `1.3px solid ${WIRE.ink}`, borderRadius: 3 }} />
                Recevoir les nouvelles du projet par e-mail
              </label>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
                <Btn ghost>← Modifier détails</Btn>
                <Btn primary>Continuer vers le paiement →</Btn>
              </div>
            </SectionRow>

            {/* 3 locked */}
            <SectionRow n={3} state="locked" label="3 · PAIEMENT" title="Carte ou Apple Pay · Stripe" />
          </div>

          <div>
            <RecapBlock />
            <Note style={{ marginTop: 8, display: 'block' }}>récap mis à jour avec le pourboire ↑</Note>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function FlowB_Desktop_Step3() {
  return (
    <Frame kind="desktop" label="" tag="état · étape 3 (paiement)" height={920}>
      <LandingNavD />
      <div style={{ padding: '20px 22px' }}>
        <MiniStepper steps={['Détails', 'Confirmation', 'Paiement']} current={2} />

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, marginTop: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SectionRow n={1} state="done" label="1 · DÉTAILS" title="Sam. 14 juin · 16h · 24 pers." />
            <SectionRow n={2} state="done" label="2 · CONFIRMATION" title="Message + pourboire €10" />

            <SectionRow n={3} state="active" label="3 · PAIEMENT" title="Paiement sécurisé · Stripe">
              <div className="wf-divider-dashed" />
              <div className="wf-mono">MOYEN DE PAIEMENT</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
                <div className="wf-box" style={{ padding: 12, borderColor: WIRE.accent, background: WIRE.accentSoft }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Chip solid>VISA</Chip>
                    <span style={{ color: WIRE.accent, fontWeight: 700 }}>● sélectionné</span>
                  </div>
                  <div className="wf-h3" style={{ marginTop: 8 }}>•••• 4242</div>
                  <div className="wf-mono">exp. 04/29</div>
                </div>
                <div className="wf-box" style={{ padding: 12 }}>
                  <div className="wf-h3" style={{ color: WIRE.ink3 }}>+ Apple / Google Pay</div>
                </div>
                <div className="wf-box" style={{ padding: 12 }}>
                  <div className="wf-h3" style={{ color: WIRE.ink3 }}>+ Nouvelle carte</div>
                </div>
                <div className="wf-box" style={{ padding: 12 }}>
                  <div className="wf-h3" style={{ color: WIRE.ink3 }}>+ Virement SEPA</div>
                </div>
              </div>

              <div className="wf-divider-dashed" />
              <label style={{ display: 'flex', gap: 8, fontSize: 12, color: WIRE.ink2 }}>
                <span style={{ width: 16, height: 16, background: WIRE.accent, border: `1.3px solid ${WIRE.ink}`, borderRadius: 3 }} />
                J'accepte les <u>CGV</u> et la <u>politique d'annulation</u>
              </label>

              <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center' }}>
                <Btn ghost>← Modifier</Btn>
                <Btn primary>Payer €298 →</Btn>
                <span className="wf-mono" style={{ marginLeft: 'auto' }}>🔒 paiement chiffré Stripe</span>
              </div>
            </SectionRow>
          </div>

          <div>
            <RecapBlock />
            <div className="wf-box" style={{ padding: 10, marginTop: 8, background: WIRE.accentSoft, borderColor: WIRE.accent }}>
              <div className="wf-mono">+ POURBOIRE</div>
              <div className="wf-h3">€10 → club</div>
            </div>
            <Note style={{ marginTop: 8, display: 'block' }}>même page, sections empilées → moins de friction perçue ↑</Note>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function FlowB_Desktop_Confirmation() {
  return (
    <Frame kind="desktop" label="" tag="confirmation" height={920}>
      <LandingNavD />
      <div style={{ padding: '40px 22px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: WIRE.accentSoft, border: `1.5px solid ${WIRE.accent}`,
          color: WIRE.accent, fontSize: 40, fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>✓</div>
        <div className="wf-h1" style={{ fontSize: 28, marginTop: 16, lineHeight: 1.15 }}>
          Réservation confirmée — merci !
        </div>
        <div style={{ fontSize: 14, color: WIRE.ink2, marginTop: 6 }}>
          USB Volley a été notifié. Un mail récap vient de partir vers vous.
        </div>
      </div>
      <div style={{ padding: '0 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        <div className="wf-callout" style={{ padding: 14 }}>
          <div className="wf-mono">VOTRE CONTRIBUTION AU CLUB</div>
          <div className="wf-h1" style={{ fontSize: 26, marginTop: 4 }}>+ €262</div>
          <div className="wf-mono" style={{ marginTop: 2 }}>(€252 sur la presta + €10 de pourboire)</div>
          <div className="wf-divider-dashed" />
          <div className="wf-mono">PROJET FINANCÉ : TOURNOI ESPAGNE U17</div>
          <Progress value={0.69} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 742 / €4 000 — vous avez fait +6% 🎉</div>
        </div>

        <div className="wf-box" style={{ padding: 14 }}>
          <div className="wf-h3">Récap de la réservation</div>
          <div className="wf-divider-dashed" />
          <div style={{ display: 'flex', gap: 10 }}>
            <Img label="presta" h={60} style={{ width: 76 }} />
            <div style={{ flex: 1 }}>
              <div className="wf-h3">Barbecue club USB Volley</div>
              <div className="wf-mono">sam. 14 juin · 16h · 24 pers.</div>
              <div className="wf-mono" style={{ marginTop: 2 }}>12 rue des Acacias, Rennes</div>
            </div>
          </div>
          <div className="wf-divider-dashed" />
          <div className="wf-mono">N° RÉSA</div>
          <div className="wf-h3" style={{ fontFamily: WIRE.mono }}>SC-2026-04812</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <Btn sm ghost block style={{ flex: 1 }}>📅 Calendrier</Btn>
            <Btn sm ghost block style={{ flex: 1 }}>📧 Re-envoyer</Btn>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 80px 0', textAlign: 'center' }}>
        <Btn primary>Partager le projet du club ↗</Btn>
        <Btn ghost style={{ marginLeft: 8 }}>Voir d'autres prestations</Btn>
      </div>
    </Frame>
  );
}

function FlowB_Mobile_Step2() {
  return (
    <Frame kind="mobile" label="" tag="mobile · état 2/3">
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${WIRE.line2}` }}>
        <MiniStepper steps={['Détails', 'Confirm', 'Payer']} current={1} />
      </div>
      <div style={{ padding: '10px 14px', paddingBottom: 88 }}>
        <div className="wf-box" style={{ padding: 10, background: WIRE.paper2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="wf-mono">✓ 1 · DÉTAILS</div>
              <div className="wf-h3" style={{ marginTop: 2 }}>14 juin · 24 pers.</div>
            </div>
            <Btn sm ghost>Mod.</Btn>
          </div>
        </div>
        <div className="wf-box" style={{ padding: 12, marginTop: 8, borderColor: WIRE.accent }}>
          <div className="wf-mono" style={{ color: WIRE.accent }}>2 · CONFIRMATION</div>
          <div className="wf-h3" style={{ marginTop: 2 }}>Message au club</div>
          <div className="wf-box" style={{ padding: 8, marginTop: 6, minHeight: 50 }}>
            <span style={{ fontSize: 11 }}>“Hâte de soutenir les U17 !”</span>
          </div>
          <div className="wf-mono" style={{ marginTop: 8 }}>POURBOIRE</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
            <Chip>€0</Chip><Chip>€5</Chip><Chip solid>€10</Chip><Chip>€20</Chip>
          </div>
        </div>
        <div className="wf-box" style={{ padding: 12, marginTop: 8, opacity: 0.55 }}>
          <div className="wf-mono">3 · PAIEMENT</div>
        </div>
      </div>
      <div className="wf-sticky" style={{ position: 'absolute', bottom: 8, left: 8, right: 8, padding: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div>
          <div className="wf-h2">€298</div>
          <div className="wf-mono">€262 au club</div>
        </div>
        <Btn primary block style={{ flex: 1 }}>Payer →</Btn>
      </div>
    </Frame>
  );
}

function FlowB_Mobile_Success() {
  return (
    <Frame kind="mobile" label="" tag="confirmation">
      <div style={{ padding: '40px 18px 14px', textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: WIRE.accentSoft, border: `1.5px solid ${WIRE.accent}`,
          color: WIRE.accent, fontSize: 32, fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>✓</div>
        <div className="wf-h1" style={{ fontSize: 20, marginTop: 14, lineHeight: 1.15 }}>
          Merci !<br />
          <span style={{ color: WIRE.accent }}>+€262 pour le tournoi U17.</span>
        </div>
      </div>
      <div style={{ padding: '0 14px' }}>
        <div className="wf-callout">
          <div className="wf-mono">PROJET FINANCÉ</div>
          <div className="wf-h3">Tournoi Espagne U17</div>
          <Progress value={0.69} style={{ marginTop: 8 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 742 / €4 000 — vous avez fait +6% 🎉</div>
        </div>
        <Btn primary block style={{ marginTop: 10 }}>Partager le projet ↗</Btn>
        <Btn ghost block style={{ marginTop: 6 }}>📅 Calendrier · Voir ma résa</Btn>
      </div>
    </Frame>
  );
}

Object.assign(window, {
  FlowA_Strip, FlowB_Desktop, FlowB_Mobile,
  FlowB_Desktop_Step2, FlowB_Desktop_Step3, FlowB_Desktop_Confirmation,
  FlowB_Mobile_Step2, FlowB_Mobile_Success,
  FlowA_Mobile1, FlowA_Mobile2, FlowA_Mobile3, FlowA_Mobile4,
  MiniStepper, RecapBlock, SectionRow,
});
