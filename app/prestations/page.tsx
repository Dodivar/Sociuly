import { Avatar, Btn, Chip, IconBtn, SearchBar, Tabs } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { Logo, PrestationCard } from "@/components/ds/patterns";
import { MarketMap } from "@/components/ds/impact";

export default function MarketplacePage() {
  return (
    <main
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "14px 32px", borderBottom: "1px solid var(--line)",
          background: "var(--surface)", display: "flex", alignItems: "center", gap: 24,
        }}
      >
        <Logo />
        <SearchBar compact style={{ flex: 1, maxWidth: 720 }} />
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
          <IconBtn aria-label="Favoris"><Icon name="heart" size={16} /></IconBtn>
          <IconBtn aria-label="Notifications"><Icon name="bell" size={16} /></IconBtn>
          <Avatar initials="ML" tone="orange" />
        </div>
      </div>

      {/* Filter chip bar */}
      <div
        style={{
          padding: "14px 32px", borderBottom: "1px solid var(--line)",
          background: "var(--surface)", display: "flex", alignItems: "center", gap: 8,
          flexWrap: "wrap",
        }}
      >
        <Btn variant="outline" size="sm" icon={<Icon name="filter" size={13} />}>Filtres · 0</Btn>
        <div className="sy-divider-vert" style={{ height: 24, margin: "0 6px" }} />
        {["Toutes", "BBQ", "Animation", "Buvette", "Événement", "Initiation", "Tournoi", "Stage"].map((c, i) => (
          <Chip key={c} variant={i === 0 ? "solid" : "outline"}>{c}</Chip>
        ))}
        <div style={{ flex: 1 }} />
        <Tabs variant="pill" items={["Pertinence", "Prix ↑", "Note ★", "Distance"]} active="Pertinence" />
      </div>

      {/* Main split */}
      <div className="marketplace-split">
        {/* List side */}
        <div style={{ padding: "20px 32px", overflow: "auto" }}>
          <div
            style={{
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
              marginBottom: 16, flexWrap: "wrap", gap: 8,
            }}
          >
            <h2 className="sy-h1" style={{ fontSize: 26 }}>128 prestations près de Strasbourg</h2>
            <div className="sy-mono">★ 4.7 moyenne · €184 reversés cette semaine</div>
          </div>
          <div className="prestation-grid">
            <PrestationCard hue="green" />
            <PrestationCard
              title="Olympiades en entreprise" price={720} hue="orange"
              goal={0.78} funds="Mini-bus du club" rating={4.9} reviews={62}
              href="/prestations/olympiades-en-entreprise"
            />
            <PrestationCard
              title="Anniversaire sportif" price={180} hue="yellow"
              goal={0.25} funds="Maillots saison" rating={4.6} reviews={28}
              href="/prestations/anniversaire-sportif"
            />
            <PrestationCard
              title="Buvette événement" price={350} hue="teal"
              goal={0.55} funds="Vestiaires neufs" rating={4.7} reviews={41}
              href="/prestations/buvette-evenement"
            />
            <PrestationCard
              title="Initiation rugby U10" price={420} hue="rust"
              goal={0.85} funds="Stage été" rating={5.0} reviews={19}
              href="/prestations/initiation-rugby-u10"
            />
            <PrestationCard
              title="Tournoi pétanque inter-entreprises" price={220} hue="sand"
              goal={0.15} funds="Boules de compétition" rating={4.5} reviews={12}
              href="/prestations/tournoi-petanque-inter-entreprises"
            />
          </div>
        </div>

        {/* Map side */}
        <div className="marketplace-map">
          <MarketMap />
        </div>
      </div>

      <style>{`
        .marketplace-split {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          flex: 1;
          min-height: 0;
        }
        .marketplace-map { position: relative; min-height: 600px; }
        .prestation-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .marketplace-split { grid-template-columns: 1fr; }
          .marketplace-map { height: 420px; min-height: 420px; }
        }
        @media (max-width: 768px) {
          .prestation-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
