// Sociuly wireframes v2 — directions retenues

const W = 1640;
const H_L = 1020;
const H = 940;
const H_D = 1080;

function PairV2({ desktop, mobile }) {
  return (
    <div style={{ display: 'flex', gap: 56, alignItems: 'flex-start', padding: '40px 28px 24px', width: '100%', height: '100%' }}>
      {desktop}{mobile}
    </div>
  );
}

function App() {
  return (
    <DesignCanvas
      title="Sociuly — Wireframes · v2"
      subtitle="Directions retenues après revue · raffinements côté détail + marketplace"
    >
      <DCSection
        id="landing"
        title="① Landing Page"
        subtitle="Éditorial / projet en cours mis en hero (variante C retenue)"
      >
        <DCArtboard id="landing-c" label="Landing — éditorial" width={W} height={H_L}>
          <PairV2 desktop={<LandingC_D />} mobile={<LandingC_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="market"
        title="② Marketplace"
        subtitle="Affichage liste par défaut (C) + bascule vue carte (B) sur la même URL"
      >
        <DCArtboard id="market-c" label="Marketplace — liste (par défaut)" width={W} height={H}>
          <PairV2 desktop={<MarketC_D />} mobile={<MarketC_M />} />
        </DCArtboard>
        <DCArtboard id="market-b" label="Marketplace — vue carte" width={W} height={H}>
          <PairV2 desktop={<MarketB_D />} mobile={<MarketB_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="detail"
        title="③ Détail prestation"
        subtitle="Layout A retenu · calendrier replié, prochaine date dispo mise en avant"
      >
        <DCArtboard id="detail-a" label="Détail prestation" width={W} height={H_D}>
          <PairV2 desktop={<DetailA_D />} mobile={<DetailA_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="asso"
        title="④ Page association"
        subtitle="Cover + tabs (variante A retenue)"
      >
        <DCArtboard id="asso-a" label="Page association" width={W} height={H}>
          <PairV2 desktop={<AssoA_D />} mobile={<AssoA_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="dash"
        title="⑤ Dashboard association — 3 pages"
        subtitle="Les 3 directions deviennent 3 pages distinctes du back-office club"
      >
        <DCArtboard id="dash-a" label="Vue d'ensemble (home)" width={W} height={H}>
          <PairV2 desktop={<DashA_D />} mobile={<DashA_M />} />
        </DCArtboard>
        <DCArtboard id="dash-b" label="Page Projets" width={W} height={H}>
          <PairV2 desktop={<DashB_D />} mobile={<DashB_M />} />
        </DCArtboard>
        <DCArtboard id="dash-c" label="Page Aujourd'hui / agenda" width={W} height={H}>
          <PairV2 desktop={<DashC_D />} mobile={<DashC_M />} />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="next"
        title="↗ À ajouter ensuite"
        subtitle="Si vous voulez aller plus loin sur le même canvas"
      >
        <DCArtboard id="next-todo" label="Pour la prochaine passe" width={760} height={420}>
          <div style={{ padding: 28, fontFamily: WIRE.sans, color: WIRE.ink }}>
            <div className="wf-h2" style={{ marginBottom: 10 }}>Pas encore wireframé</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.7, fontSize: 13 }}>
              <li>Flow de réservation 4 étapes (infos → récap → paiement → confirmation émotionnelle)</li>
              <li>Création de service — form wizard 5 étapes</li>
              <li>Gestion des projets financés (vue club)</li>
              <li>Dashboard admin + validation associations</li>
            </ul>
            <div className="wf-note" style={{ marginTop: 14, fontFamily: WIRE.hand, color: WIRE.accent }}>
              dites-moi lesquels vous voulez en priorité →
            </div>
          </div>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
