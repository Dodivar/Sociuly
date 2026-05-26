// Gestion projets financés (vue club)

function ProjectFullCard({ title, value, money, photo = 'photo projet', dueLabel, contribs }) {
  return (
    <div className="wf-box" style={{ padding: 12 }}>
      <Img label={photo} h={110} />
      <div className="wf-h3" style={{ marginTop: 8 }}>{title}</div>
      <Progress value={value} style={{ marginTop: 8 }} />
      <div className="wf-mono" style={{ marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
        <span>{money}</span><span>{contribs}</span>
      </div>
      <div className="wf-mono" style={{ marginTop: 2, color: WIRE.accent }}>{dueLabel}</div>
      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
        <Btn sm ghost>Modifier</Btn>
        <Btn sm>Partager</Btn>
      </div>
    </div>
  );
}

// ============================================================
// VARIATION A — Liste + détail (master/detail layout)
// ============================================================
function ProjectsA_D() {
  return (
    <Frame kind="desktop" label="A · Projets — Liste + détail" tag="master / detail" height={920}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
        <DashSidebar active={4} />
        <div style={{ padding: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="wf-mono">USB VOLLEY · PROJETS</div>
              <div className="wf-h1" style={{ fontSize: 22, marginTop: 4 }}>Projets financés</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn sm ghost>Exporter</Btn>
              <Btn sm primary>+ Nouveau projet</Btn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16, marginTop: 14 }}>
            {/* list */}
            <div className="wf-box" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 10, borderBottom: `1px solid ${WIRE.line2}`, display: 'flex', gap: 6 }}>
                <span className="wf-tab on">Tous</span>
                <span className="wf-tab">En cours · 3</span>
                <span className="wf-tab">Atteints · 2</span>
              </div>
              {[
                ['Tournoi Espagne U17', 0.62, '€2 480 / €4 000', 'en cours', true],
                ['Vestiaires neufs', 0.32, '€3.2k / €10k', 'en cours', false],
                ['Mini-bus 9 places', 0.55, '€5.5k / €10k', 'en cours', false],
                ['Maillots saison 24/25', 1, '€1.5k atteint ✓', 'atteint', false],
                ['Stage Brest U15', 1, '€800 atteint ✓', 'atteint', false],
              ].map(([t, v, m, s, sel], i) => (
                <div key={i} style={{
                  padding: 10, borderBottom: `1px solid ${WIRE.line2}`, cursor: 'default',
                  background: sel ? WIRE.accentSoft : 'transparent',
                  borderLeft: sel ? `3px solid ${WIRE.accent}` : '3px solid transparent',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="wf-h3" style={{ fontSize: 12 }}>{t}</div>
                    <Chip accent={s === 'en cours'}>{s}</Chip>
                  </div>
                  <Progress value={v} style={{ marginTop: 6 }} />
                  <div className="wf-mono" style={{ marginTop: 4 }}>{m}</div>
                </div>
              ))}
            </div>

            {/* detail */}
            <div>
              <div className="wf-box" style={{ padding: 14 }}>
                <div style={{ display: 'flex', gap: 14 }}>
                  <Img label="photo projet" h={130} style={{ width: 200 }} />
                  <div style={{ flex: 1 }}>
                    <Chip accent>● en cours</Chip>
                    <div className="wf-h1" style={{ fontSize: 22, marginTop: 6 }}>Tournoi Espagne U17</div>
                    <div className="wf-mono" style={{ marginTop: 4 }}>Échéance : 26 juin · objectif €4 000</div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
                      <Progress value={0.62} style={{ flex: 1 }} />
                      <span className="wf-h3">62%</span>
                    </div>
                    <div className="wf-mono" style={{ marginTop: 4 }}>€2 480 / €4 000 · reste €1 520</div>
                  </div>
                </div>

                <div className="wf-divider-dashed" />
                <div className="wf-mono">DESCRIPTION</div>
                <div className="wf-skel" style={{ height: 8, marginTop: 6, width: '95%' }} />
                <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '88%' }} />
                <div className="wf-skel" style={{ height: 8, marginTop: 4, width: '70%' }} />

                <div className="wf-divider-dashed" />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div className="wf-h3">Galerie</div>
                  <Btn sm ghost>+ Ajouter photo</Btn>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 6 }}>
                  <Img label="img 1" h={64} /><Img label="img 2" h={64} /><Img label="img 3" h={64} /><Img label="+" h={64} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                <div className="wf-box" style={{ padding: 12 }}>
                  <div className="wf-h3">Prestations qui le financent</div>
                  <div style={{ marginTop: 6 }}>
                    {['Barbecue club · 8 résas', 'Olympiades · 4 résas', 'Buvette · 2 résas'].map((p, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: i < 2 ? `1px dashed ${WIRE.line}` : 'none' }}>
                        <span>{p}</span><span style={{ fontWeight: 700 }}>€{[672, 864, 210][i]}</span>
                      </div>
                    ))}
                  </div>
                  <Btn sm ghost block style={{ marginTop: 8 }}>+ Lier une autre prestation</Btn>
                </div>

                <div className="wf-box" style={{ padding: 12 }}>
                  <div className="wf-h3">Mises à jour publiques</div>
                  <div style={{ marginTop: 6 }}>
                    {[
                      ['12 mai', '“Maillots commandés, merci !”'],
                      ['28 avril', '“On a réservé les billets d\u2019avion.”'],
                    ].map((u, i) => (
                      <div key={i} style={{ padding: '6px 0', borderBottom: `1px dashed ${WIRE.line}` }}>
                        <div className="wf-mono">{u[0]}</div>
                        <div style={{ fontSize: 12 }}>{u[1]}</div>
                      </div>
                    ))}
                  </div>
                  <Btn sm primary block style={{ marginTop: 8 }}>+ Nouvelle mise à jour</Btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ProjectsA_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · liste projets">
      <MobileNav title="Mes projets" />
      <div style={{ padding: '10px 14px', paddingBottom: 60 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="wf-tab on">Tous</span><span className="wf-tab">En cours</span><span className="wf-tab">Atteints</span>
        </div>
        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
          <ProjectCard title="Tournoi Espagne U17" value={0.62} money="€2.5k / €4k" count="14 résas" />
          <ProjectCard title="Vestiaires neufs" value={0.32} money="€3.2k / €10k" count="12 résas" />
          <ProjectCard title="Mini-bus 9 places" value={0.55} money="€5.5k / €10k" count="32 résas" />
        </div>
      </div>
      <div className="wf-sticky" style={{ position: 'absolute', bottom: 8, left: 8, right: 8, padding: 10 }}>
        <Btn primary block>+ Nouveau projet</Btn>
      </div>
    </Frame>
  );
}

// ============================================================
// VARIATION B — Kanban par statut
// ============================================================
function ProjectsB_D() {
  return (
    <Frame kind="desktop" label="B · Projets — Kanban par statut" tag="board" height={920}>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', height: '100%' }}>
        <DashSidebar active={4} />
        <div style={{ padding: 20, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div className="wf-mono">USB VOLLEY · PROJETS</div>
              <div className="wf-h1" style={{ fontSize: 22, marginTop: 4 }}>Tableau des projets</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn sm ghost>Liste</Btn>
              <Btn sm primary>+ Nouveau projet</Btn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
            {[
              ['À VENIR', '1', WIRE.ink3, [
                { title: 'Rénovation vestiaires', value: 0.02, money: '€200 / €10k', contribs: '1 résa', dueLabel: 'lance le 1er juil.' },
              ]],
              ['EN COURS', '3', WIRE.accent, [
                { title: 'Tournoi Espagne U17', value: 0.62, money: '€2.5k / €4k', contribs: '14 résas', dueLabel: '⏰ reste 12j' },
                { title: 'Mini-bus 9 places', value: 0.55, money: '€5.5k / €10k', contribs: '32 résas', dueLabel: 'reste 45j' },
                { title: 'Maillots U13', value: 0.18, money: '€270 / €1.5k', contribs: '4 résas', dueLabel: 'reste 60j' },
              ]],
              ['BIENTÔT ATTEINT', '1', '#0c8a4a', [
                { title: 'Stage U15 Brest', value: 0.92, money: '€736 / €800', contribs: '11 résas', dueLabel: '🎉 plus que €64' },
              ]],
              ['ATTEINTS', '2', WIRE.ink, [
                { title: 'Maillots 24/25', value: 1, money: '€1.5k ✓', contribs: '18 résas', dueLabel: 'clos le 12 mars' },
                { title: 'Filets & ballons', value: 1, money: '€420 ✓', contribs: '6 résas', dueLabel: 'clos le 8 fév.' },
              ]],
            ].map(([title, count, color, items], i) => (
              <div key={i} className="wf-box" style={{ padding: 10, background: WIRE.paper2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div className="wf-h3" style={{ color, fontSize: 12 }}>{title}</div>
                  <span className="wf-mono">· {count}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((it, j) => (
                    <ProjectFullCard key={j} {...it} />
                  ))}
                  <Btn sm ghost block style={{ borderStyle: 'dashed' }}>+ Ajouter</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

function ProjectsB_M() {
  return (
    <Frame kind="mobile" label="" tag="mobile · onglets statut">
      <MobileNav title="Projets" />
      <div style={{ padding: '10px 14px', paddingBottom: 60 }}>
        <div style={{ display: 'flex', gap: 4, overflow: 'hidden' }}>
          <Chip>À venir · 1</Chip>
          <Chip solid>En cours · 3</Chip>
          <Chip>Atteints · 2</Chip>
        </div>
        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
          <ProjectFullCard title="Tournoi Espagne U17" value={0.62} money="€2.5k / €4k" contribs="14 résas" dueLabel="⏰ reste 12j" />
          <ProjectFullCard title="Mini-bus 9 places" value={0.55} money="€5.5k / €10k" contribs="32 résas" dueLabel="reste 45j" />
        </div>
      </div>
      <div className="wf-sticky" style={{ position: 'absolute', bottom: 8, left: 8, right: 8, padding: 10 }}>
        <Btn primary block>+ Nouveau projet</Btn>
      </div>
    </Frame>
  );
}

Object.assign(window, { ProjectsA_D, ProjectsA_M, ProjectsB_D, ProjectsB_M, ProjectFullCard });
