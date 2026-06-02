import { Avatar, IconBtn, SearchBar } from "@/components/ds/components";
import { Icon } from "@/components/ds/icon";
import { Logo, ExperienceCard, SiteFooter } from "@/components/ds/patterns";
import { MarketMap } from "@/components/ds/impact";
import { MarketplaceFilters } from "@/components/marketplace/filters";

export default function ExperiencesPage() {
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
          padding: "14px var(--page-pad)", borderBottom: "1px solid var(--line)",
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

      {/* Filter chip bar — interactive Client Component */}
      <MarketplaceFilters />

      {/* Main split */}
      <div className="marketplace-split">
        {/* List side */}
        <div style={{ padding: "20px var(--page-pad)", overflow: "auto" }}>
          <div
            style={{
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
              marginBottom: 16, flexWrap: "wrap", gap: 8,
            }}
          >
            <h2 className="sy-h1" style={{ fontSize: 26 }}>128 expériences près de Strasbourg</h2>
            <div className="sy-mono">★ 4.7 moyenne · €2 480 reversés aux clubs cette semaine</div>
          </div>
          <div className="experience-grid">
            <ExperienceCard hue="green" />
            <ExperienceCard
              title="Initiation rugby encadrée" price={900} hue="orange"
              goal={0.78} funds="Mini-bus du club" rating={4.9} reviews={62}
              category="Initiation · 15–30 pers."
              href="/experiences/initiation-rugby-encadree"
            />
            <ExperienceCard
              title="Mini-tournoi inter-équipes" price={1_500} hue="teal"
              goal={0.55} funds="Vestiaires neufs" rating={4.7} reviews={41}
              category="Tournoi · 20–80 pers."
              href="/experiences/mini-tournoi-inter-equipes"
            />
            <ExperienceCard
              title="Match VIP & hospitalités" price={2_400} hue="yellow"
              goal={0.25} funds="Maillots saison" rating={4.6} reviews={28}
              category="Match VIP · 20–60 pers."
              href="/experiences/match-vip-hospitalites"
            />
            <ExperienceCard
              title="Masterclass joueur pro" price={1_800} hue="rust"
              goal={0.85} funds="Stage été U13" rating={5.0} reviews={19}
              category="Masterclass · 10–40 pers."
              href="/experiences/masterclass-joueur-pro"
            />
            <ExperienceCard
              title="Cocktail & visite des coulisses" price={1_100} hue="sand"
              goal={0.15} funds="École de jeunes" rating={4.5} reviews={12}
              category="Coulisses · 15–50 pers."
              href="/experiences/cocktail-coulisses"
            />
          </div>
        </div>

        {/* Map side */}
        <div className="marketplace-map">
          <MarketMap />
        </div>
      </div>

      <SiteFooter />

      <style>{`
        .marketplace-split {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          flex: 1;
          min-height: 0;
        }
        .marketplace-map { position: relative; min-height: 600px; }
        .experience-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .marketplace-split { grid-template-columns: 1fr; }
          .marketplace-map { height: 420px; min-height: 420px; }
        }
        @media (max-width: 768px) {
          .experience-grid { grid-template-columns: 1fr; }
          .marketplace-map { display: none; }
        }
      `}</style>
    </main>
  );
}
