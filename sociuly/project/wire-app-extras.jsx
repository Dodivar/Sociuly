// Sociuly wireframes — extras (flow réservation, création service, projets, admin)

const W2 = 1640;
const H2 = 940;
const H_DESK = 920;
const H_FLOW_A_ARTBOARD_W = 1740;
const H_FLOW_A_ARTBOARD_H = 1640;

function PairX({ desktop, mobile }) {
  return (
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start', padding: '40px 28px 24px', width: '100%', height: '100%' }}>
      {desktop}{mobile}
    </div>
  );
}

function App() {
  return (
    <DesignCanvas
      title="Sociuly — Wireframes extras · v1"
      subtitle="Flow réservation · création service · gestion projets · dashboard admin"
    >
      <DCSection
        id="resa"
        title="⑥ Flow réservation"
        subtitle="A) 4 écrans séparés (linéaire) vs B) page unique en accordéon — quelle friction préférée ?"
      >
        <DCArtboard id="resa-a" label="A · 4 écrans linéaires (mobile) + paiement desktop"
          width={H_FLOW_A_ARTBOARD_W} height={H_FLOW_A_ARTBOARD_H}>
          <FlowA_Strip />
        </DCArtboard>
        <DCArtboard id="resa-b" label="B · Page unique progressive" width={W2} height={H_DESK + 20}>
          <PairX desktop={<FlowB_Desktop />} mobile={<FlowB_Mobile />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="create"
        title="⑦ Création de service"
        subtitle="Wizard 5 étapes : A) stepper vertical · B) stepper horizontal"
      >
        <DCArtboard id="create-a" label="A · Stepper vertical · étape 1" width={W2} height={H_DESK + 20}>
          <PairX desktop={<CreateA_D />} mobile={<CreateA_M />} />
        </DCArtboard>
        <DCArtboard id="create-b" label="B · Stepper horizontal · étape 5 (projet financé)" width={W2} height={H_DESK + 20}>
          <PairX desktop={<CreateB_D />} mobile={<CreateB_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="projects"
        title="⑧ Gestion des projets (club)"
        subtitle="A) liste + détail · B) kanban par statut"
      >
        <DCArtboard id="projects-a" label="A · Liste + détail" width={W2} height={H_DESK + 20}>
          <PairX desktop={<ProjectsA_D />} mobile={<ProjectsA_M />} />
        </DCArtboard>
        <DCArtboard id="projects-b" label="B · Kanban statut" width={W2} height={H_DESK + 20}>
          <PairX desktop={<ProjectsB_D />} mobile={<ProjectsB_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="admin"
        title="⑨ Dashboard admin"
        subtitle="A) vue globale classique · B) validation-first (file d'attente en hero)"
      >
        <DCArtboard id="admin-a" label="A · Vue globale" width={W2} height={H_DESK + 20}>
          <PairX desktop={<AdminA_D />} mobile={<AdminA_M />} />
        </DCArtboard>
        <DCArtboard id="admin-b" label="B · Validation en hero" width={W2} height={H_DESK + 20}>
          <PairX desktop={<AdminB_D />} mobile={<AdminB_M />} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
