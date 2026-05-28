// Sociuly wireframes — main canvas

const ARTBOARD_W = 1640;
const ARTBOARD_H_LANDING = 1020;
const ARTBOARD_H = 940;
const ARTBOARD_H_DETAIL = 1080;

function Pair({ desktop, mobile }) {
  return (
    <div style={{
      display: 'flex', gap: 56, alignItems: 'flex-start',
      padding: '40px 28px 24px',
      width: '100%', height: '100%',
      background: 'transparent',
    }}>
      {desktop}
      {mobile}
    </div>
  );
}

function SectionIntro({ children }) {
  return (
    <div style={{
      fontFamily: WIRE.hand, fontSize: 16, color: WIRE.ink2,
      maxWidth: 720, lineHeight: 1.3, marginTop: -6, marginBottom: 4,
    }}>
      {children}
    </div>
  );
}

function App() {
  return (
    <DesignCanvas
      title="Sociuly — Wireframes"
      subtitle="5 écrans × 3 variations · desktop + mobile · low-fi avec accent bleu sport"
    >
      <DCSection
        id="landing"
        title="① Landing Page"
        subtitle="Hero classique vs impact-first vs éditorial narratif — où placer l'émotion ?"
      >
        <DCArtboard id="landing-a" label="A · Airbnb-like" width={ARTBOARD_W} height={ARTBOARD_H_LANDING}>
          <Pair desktop={<LandingA_D />} mobile={<LandingA_M />} />
        </DCArtboard>
        <DCArtboard id="landing-b" label="B · Impact-first" width={ARTBOARD_W} height={ARTBOARD_H_LANDING}>
          <Pair desktop={<LandingB_D />} mobile={<LandingB_M />} />
        </DCArtboard>
        <DCArtboard id="landing-c" label="C · Éditorial / projet en hero" width={ARTBOARD_W} height={ARTBOARD_H_LANDING}>
          <Pair desktop={<LandingC_D />} mobile={<LandingC_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="market"
        title="② Marketplace / Recherche"
        subtitle="Sidebar Airbnb · split map · faceted avec projets à compléter en tête"
      >
        <DCArtboard id="market-a" label="A · Sidebar filtres" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<MarketA_D />} mobile={<MarketA_M />} />
        </DCArtboard>
        <DCArtboard id="market-b" label="B · Split map" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<MarketB_D />} mobile={<MarketB_M />} />
        </DCArtboard>
        <DCArtboard id="market-c" label="C · Projets en tête" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<MarketC_D />} mobile={<MarketC_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="detail"
        title="③ Page détail prestation"
        subtitle="Trois manières d'attacher le projet financé à la réservation"
      >
        <DCArtboard id="detail-a" label="A · Sticky booking + projet" width={ARTBOARD_W} height={ARTBOARD_H_DETAIL}>
          <Pair desktop={<DetailA_D />} mobile={<DetailA_M />} />
        </DCArtboard>
        <DCArtboard id="detail-b" label="B · Projet pinné rail droite" width={ARTBOARD_W} height={ARTBOARD_H_DETAIL}>
          <Pair desktop={<DetailB_D />} mobile={<DetailB_M />} />
        </DCArtboard>
        <DCArtboard id="detail-c" label="C · Magazine narratif" width={ARTBOARD_W} height={ARTBOARD_H_DETAIL}>
          <Pair desktop={<DetailC_D />} mobile={<DetailC_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="asso"
        title="④ Page association"
        subtitle="Cover + tabs · profil-rail · story timeline projets"
      >
        <DCArtboard id="asso-a" label="A · Cover + tabs" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<AssoA_D />} mobile={<AssoA_M />} />
        </DCArtboard>
        <DCArtboard id="asso-b" label="B · Profil rail gauche" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<AssoB_D />} mobile={<AssoB_M />} />
        </DCArtboard>
        <DCArtboard id="asso-c" label="C · Story / timeline" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<AssoC_D />} mobile={<AssoC_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="dash"
        title="⑤ Dashboard association"
        subtitle="SaaS classique · projet en hero · agenda du jour — éviter le sentiment d'intranet"
      >
        <DCArtboard id="dash-a" label="A · SaaS classique" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<DashA_D />} mobile={<DashA_M />} />
        </DCArtboard>
        <DCArtboard id="dash-b" label="B · Projet en hero" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<DashB_D />} mobile={<DashB_M />} />
        </DCArtboard>
        <DCArtboard id="dash-c" label="C · Agenda du jour" width={ARTBOARD_W} height={ARTBOARD_H}>
          <Pair desktop={<DashC_D />} mobile={<DashC_M />} />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
