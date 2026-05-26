// Sociuly wireframes — directions choisies (consolidé)
// Flow réservation B (single-page progressive) · Création service B (stepper horizontal)
// Gestion projets A (master/detail) · Admin B (validation-first)

const W_SEL = 1640;
const H_SEL = 940;

function PairSel({ desktop, mobile }) {
  return (
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start', padding: '40px 28px 24px', width: '100%', height: '100%' }}>
      {desktop}{mobile}
    </div>
  );
}

function App() {
  return (
    <DesignCanvas
      title="Sociuly — Directions choisies"
      subtitle="Flow réservation B · Création service B · Gestion projets A · Admin B"
    >
      <DCSection
        id="resa"
        title="⑥ Flow réservation — B · page unique progressive"
        subtitle="Toutes les sections sur une seule page, avec accordéon par étape. Le récap reste visible à droite à chaque étape."
      >
        <DCArtboard id="resa-b-1" label="État 1 · section Détails ouverte" width={W_SEL} height={H_SEL}>
          <PairSel desktop={<FlowB_Desktop />} mobile={<FlowB_Mobile />} />
        </DCArtboard>
        <DCArtboard id="resa-b-2" label="État 2 · Confirmation (message + pourboire)" width={W_SEL} height={H_SEL}>
          <PairSel desktop={<FlowB_Desktop_Step2 />} mobile={<FlowB_Mobile_Step2 />} />
        </DCArtboard>
        <DCArtboard id="resa-b-3" label="État 3 · Paiement" width={W_SEL} height={H_SEL}>
          <PairSel desktop={<FlowB_Desktop_Step3 />} mobile={<FlowA_Mobile3 />} />
        </DCArtboard>
        <DCArtboard id="resa-b-4" label="Confirmation finale" width={W_SEL} height={H_SEL}>
          <PairSel desktop={<FlowB_Desktop_Confirmation />} mobile={<FlowB_Mobile_Success />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="create"
        title="⑦ Création de service — B · stepper horizontal"
        subtitle="5 étapes : Infos générales · Photos · Disponibilités · Prix · Projet financé."
      >
        <DCArtboard id="create-b" label="Étape 5 · Projet financé (avec aperçu côté client + simulateur)" width={W_SEL} height={H_SEL}>
          <PairSel desktop={<CreateB_D />} mobile={<CreateB_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="projects"
        title="⑧ Gestion des projets — A · liste + détail"
        subtitle="Master/detail classique : liste filtrable à gauche, fiche projet riche à droite (galerie, presta liées, mises à jour publiques)."
      >
        <DCArtboard id="projects-a" label="Liste + détail projet sélectionné" width={W_SEL} height={H_SEL}>
          <PairSel desktop={<ProjectsA_D />} mobile={<ProjectsA_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="admin"
        title="⑨ Dashboard admin — B · validation-first"
        subtitle="File d'attente en hero, panneau de revue à droite avec checklist + pièces jointes + note interne."
      >
        <DCArtboard id="admin-b" label="Validation associations · revue de l'AS Saint-Brieuc" width={W_SEL} height={H_SEL}>
          <PairSel desktop={<AdminB_D />} mobile={<AdminB_M />} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
