export default function MarketplaceLoading() {
  return (
    <main
      style={{
        background: "var(--bg)", minHeight: "100vh",
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
        <div className="sy-skel" style={{ width: 96, height: 28, borderRadius: "var(--radius-sm)" }} />
        <div className="sy-skel" style={{ flex: 1, maxWidth: 720, height: 40, borderRadius: "var(--radius-md)" }} />
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
          <div className="sy-skel" style={{ width: 36, height: 36, borderRadius: "50%" }} />
          <div className="sy-skel" style={{ width: 36, height: 36, borderRadius: "50%" }} />
          <div className="sy-skel" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        </div>
      </div>

      {/* Filter chip bar */}
      <div
        style={{
          padding: "12px 32px", borderBottom: "1px solid var(--line)",
          background: "var(--surface)", display: "flex", gap: 8, flexWrap: "wrap",
        }}
      >
        {[90, 110, 80, 130, 95, 75].map((w, i) => (
          <div key={i} className="sy-skel" style={{ width: w, height: 32, borderRadius: 999 }} />
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <div className="sy-skel" style={{ width: 80, height: 32, borderRadius: 999 }} />
          <div className="sy-skel" style={{ width: 80, height: 32, borderRadius: 999 }} />
        </div>
      </div>

      {/* Main split */}
      <div className="skel-split">
        {/* List side */}
        <div style={{ padding: "20px 32px", overflow: "auto" }}>
          <div
            style={{
              display: "flex", alignItems: "baseline", justifyContent: "space-between",
              marginBottom: 16, gap: 8,
            }}
          >
            <div className="sy-skel" style={{ width: 300, height: 30 }} />
            <div className="sy-skel" style={{ width: 160, height: 14 }} />
          </div>
          <div className="skel-card-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="sy-skel" style={{ height: 210, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        </div>

        {/* Map side */}
        <div className="sy-skel skel-map" />
      </div>

      <style>{`
        .skel-split {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          flex: 1;
          min-height: 0;
        }
        .skel-map {
          min-height: 600px;
          border-radius: 0;
          animation-delay: 0.2s;
        }
        .skel-card-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .skel-split { grid-template-columns: 1fr; }
          .skel-map { height: 420px; min-height: 420px; }
        }
        @media (max-width: 768px) {
          .skel-card-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
