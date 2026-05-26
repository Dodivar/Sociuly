// Création de service — wizard 5 étapes

const SERVICE_STEPS = [
  'Infos générales',
  'Photos',
  'Disponibilités',
  'Prix',
  'Projet financé',
];

function StepperVertical({ current = 0 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {SERVICE_STEPS.map((s, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              width: 26, height: 26, borderRadius: '50%',
              border: `1.4px solid ${WIRE.ink}`,
              background: i < current ? WIRE.ink : i === current ? WIRE.accent : WIRE.paper,
              color: i <= current ? '#fff' : WIRE.ink,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 12,
            }}>{i < current ? '✓' : i + 1}</span>
            {i < SERVICE_STEPS.length - 1 && (
              <i style={{ width: 1.4, flex: 1, minHeight: 24, background: i < current ? WIRE.ink : WIRE.line, marginTop: 4, marginBottom: 4 }} />
            )}
          </div>
          <div style={{ paddingTop: 4, paddingBottom: 16 }}>
            <div className="wf-mono">ÉTAPE {i + 1}</div>
            <div className="wf-h3" style={{ fontSize: 12, color: i <= current ? WIRE.ink : WIRE.ink3 }}>{s}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FormField({ label, hint, children, style }) {
  return (
    <div style={{ marginBottom: 12, ...style }}>
      <div className="wf-mono" style={{ marginBottom: 4 }}>{label}</div>
      {children}
      {hint && <div className="wf-mono" style={{ marginTop: 3, color: WIRE.ink3 }}>{hint}</div>}
    </div>
  );
}

function FakeInput({ value, placeholder }) {
  return (
    <div className="wf-box" style={{ padding: '9px 12px', height: 34, display: 'flex', alignItems: 'center', fontSize: 12 }}>
      {value || <span style={{ color: WIRE.ink3 }}>{placeholder}</span>}
    </div>
  );
}

function FakeTextarea({ value }) {
  return (
    <div className="wf-box" style={{ padding: 10, minHeight: 70 }}>
      {value ? <span style={{ fontSize: 12 }}>{value}</span> : (
        <>
          <div className="wf-skel" style={{ height: 6, width: '90%' }} />
          <div className="wf-skel" style={{ height: 6, width: '80%', marginTop: 4 }} />
          <div className="wf-skel" style={{ height: 6, width: '60%', marginTop: 4 }} />
        </>
      )}
    </div>
  );
}

// ============================================================
// VARIATION A — Vertical stepper rail + content (full-width form)
// ============================================================
function CreateA_D() {
  return (
    <Frame kind="desktop" label="A · Création service — vertical stepper" tag="wizard étape 1" height={920}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
        <DashSidebar active={1} />
        <div style={{ padding: 20, overflow: 'hidden' }}>
          <div className="wf-mono">PRESTATIONS · NOUVELLE</div>
          <div className="wf-h1" style={{ fontSize: 22, marginTop: 4 }}>Créer une nouvelle prestation</div>

          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: 24, marginTop: 18 }}>
            <StepperVertical current={0} />

            <div>
              <div className="wf-h2">Infos générales</div>
              <div className="wf-mono" style={{ marginTop: 2 }}>Donnez envie en quelques mots</div>

              <div style={{ marginTop: 14 }}>
                <FormField label="NOM DE LA PRESTATION">
                  <FakeInput value="Barbecue convivial du club" />
                </FormField>
                <FormField label="CATÉGORIE">
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Chip solid>Repas / BBQ</Chip><Chip>Animation</Chip><Chip>Événement</Chip><Chip>Buvette</Chip><Chip>Initiation</Chip>
                  </div>
                </FormField>
                <FormField label="DESCRIPTION COURTE" hint="apparaît sur les cartes (max 140c)">
                  <FakeInput value="Notre équipe vient cuisiner chez vous, pour fêter ou rassembler." />
                </FormField>
                <FormField label="DESCRIPTION DÉTAILLÉE">
                  <FakeTextarea />
                </FormField>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <FormField label="CAPACITÉ">
                    <FakeInput value="10 — 60 personnes" />
                  </FormField>
                  <FormField label="DURÉE">
                    <FakeInput value="3 heures" />
                  </FormField>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18 }}>
                <Btn ghost>Brouillon</Btn>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn ghost>← Précédent</Btn>
                  <Btn primary>Suivant : Photos →</Btn>
                </div>
              </div>
            </div>

            {/* preview rail */}
            <div>
              <div className="wf-mono">APERÇU</div>
              <div className="wf-box" style={{ padding: 8, marginTop: 6 }}>
                <Img label="photo" h={70} />
                <div className="wf-h3" style={{ marginTop: 6 }}>Barbecue convivial</div>
                <div className="wf-mono">USB Volley · Rennes</div>
                <div className="wf-mono" style={{ marginTop: 4 }}>★ — · 10-60 pers.</div>
              </div>
              <Note ink style={{ display: 'block', marginTop: 8 }}>↑ aperçu live de la carte marketplace</Note>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function CreateA_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · wizard étape 1">
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${WIRE.line2}` }}>
        <div className="wf-mono">ÉTAPE 1 / 5</div>
        <div className="wf-h3">Infos générales</div>
        <Progress value={0.2} style={{ marginTop: 6 }} />
      </div>
      <div style={{ padding: '10px 14px', paddingBottom: 70 }}>
        <FormField label="NOM"><FakeInput value="Barbecue convivial" /></FormField>
        <FormField label="CATÉGORIE">
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Chip solid>BBQ</Chip><Chip>Animation</Chip><Chip>Buvette</Chip>
          </div>
        </FormField>
        <FormField label="DESCRIPTION"><FakeTextarea /></FormField>
        <FormField label="CAPACITÉ"><FakeInput value="10 — 60 pers." /></FormField>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, background: WIRE.paper, borderTop: `1px solid ${WIRE.line2}`, display: 'flex', gap: 8 }}>
        <Btn ghost sm>←</Btn>
        <Btn primary block style={{ flex: 1 }}>Suivant : Photos →</Btn>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — Horizontal stepper top + larger content
// ============================================================
function CreateB_D() {
  return (
    <Frame kind="desktop" label="B · Création service — horizontal stepper" tag="wizard étape 5" height={920}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
        <DashSidebar active={1} />
        <div style={{ padding: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="wf-mono">PRESTATIONS · NOUVELLE</div>
              <div className="wf-h1" style={{ fontSize: 22, marginTop: 4 }}>Quel projet du club cette presta finance ?</div>
            </div>
            <Btn sm ghost>Enregistrer brouillon</Btn>
          </div>

          {/* horizontal stepper */}
          <div className="wf-box" style={{ marginTop: 14, padding: '12px 14px' }}>
            <MiniStepper steps={SERVICE_STEPS} current={4} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 18 }}>
            <div>
              <div className="wf-h2">Lier un projet</div>
              <div className="wf-mono" style={{ marginTop: 2 }}>Les réservations vont alimenter ce projet jusqu'à son objectif.</div>

              <div className="wf-h3" style={{ marginTop: 14 }}>Projets actifs du club</div>
              <div className="wf-box" style={{ padding: 10, marginTop: 6, borderColor: WIRE.accent, background: WIRE.accentSoft }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Img label="proj" h={50} style={{ width: 60 }} />
                  <div style={{ flex: 1 }}>
                    <div className="wf-h3">Tournoi Espagne U17</div>
                    <Progress value={0.62} style={{ marginTop: 6 }} />
                    <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · reste 12j</div>
                  </div>
                  <span style={{ color: WIRE.accent, fontWeight: 700 }}>●</span>
                </div>
              </div>
              <div className="wf-box" style={{ padding: 10, marginTop: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Img label="proj" h={50} style={{ width: 60 }} />
                  <div style={{ flex: 1 }}>
                    <div className="wf-h3">Vestiaires neufs</div>
                    <Progress value={0.32} style={{ marginTop: 6 }} />
                  </div>
                </div>
              </div>

              <Btn ghost block style={{ marginTop: 12, borderStyle: 'dashed' }}>+ Créer un nouveau projet</Btn>

              <div className="wf-divider-dashed" />
              <FormField label="% DE LA PRESTATION REVERSÉ" hint="frais et coûts retirés automatiquement">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="wf-progress" style={{ flex: 1 }}><i style={{ width: '90%' }} /></div>
                  <span className="wf-h3">90%</span>
                </div>
              </FormField>
            </div>

            <div>
              <div className="wf-h3">Aperçu côté client</div>
              <Note ink style={{ display: 'block', marginTop: 4 }}>ce que verra l'utilisateur ↓</Note>
              <div className="wf-callout" style={{ marginTop: 8, padding: 12 }}>
                <div className="wf-mono">CETTE PRESTATION FINANCE</div>
                <div className="wf-h2">Tournoi Espagne U17</div>
                <Progress value={0.62} style={{ marginTop: 6 }} />
                <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000</div>
                <div className="wf-mono" style={{ marginTop: 8 }}>Pour chaque BBQ réservé → <b style={{ color: WIRE.accent }}>+ €252</b> reversés au projet</div>
              </div>

              <div className="wf-box" style={{ marginTop: 12, padding: 10 }}>
                <div className="wf-mono">SIMULATEUR</div>
                <div className="wf-h3" style={{ marginTop: 4 }}>10 BBQ vendus = €2 520 reversés</div>
                <div className="wf-mono" style={{ marginTop: 2 }}>= projet financé à 100% en 7 résa supplémentaires</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 18 }}>
            <Btn ghost>← Étape précédente</Btn>
            <Btn primary>Publier la prestation 🚀</Btn>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function CreateB_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · étape 5 (projet)">
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${WIRE.line2}` }}>
        <div className="wf-mono">ÉTAPE 5 / 5</div>
        <div className="wf-h3">Projet financé</div>
        <Progress value={1} style={{ marginTop: 6 }} />
      </div>
      <div style={{ padding: '10px 14px', paddingBottom: 70 }}>
        <div className="wf-h3">Choisir un projet</div>
        <div className="wf-box" style={{ padding: 10, marginTop: 6, borderColor: WIRE.accent, background: WIRE.accentSoft }}>
          <div className="wf-h3">● Tournoi Espagne U17</div>
          <Progress value={0.62} style={{ marginTop: 6 }} />
          <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000</div>
        </div>
        <div className="wf-box" style={{ padding: 10, marginTop: 6 }}>
          <div className="wf-h3">Vestiaires neufs</div>
        </div>
        <Btn ghost block style={{ marginTop: 8, borderStyle: 'dashed' }}>+ Nouveau projet</Btn>

        <div className="wf-callout" style={{ marginTop: 12, padding: 10 }}>
          <div className="wf-mono">APERÇU CLIENT</div>
          <div className="wf-h3">+ €252 / résa au projet</div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, background: WIRE.paper, borderTop: `1px solid ${WIRE.line2}`, display: 'flex', gap: 8 }}>
        <Btn ghost sm>←</Btn>
        <Btn primary block style={{ flex: 1 }}>Publier 🚀</Btn>
      </div>
    </Frame>
  );
}

Object.assign(window, { CreateA_D, CreateA_M, CreateB_D, CreateB_M, FormField, FakeInput, FakeTextarea, StepperVertical });
