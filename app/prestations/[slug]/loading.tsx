export default function DetailLoading() {
  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* TopNav skeleton */}
      <div
        style={{
          padding: "14px 32px", borderBottom: "1px solid var(--line)",
          background: "var(--surface)", display: "flex", alignItems: "center", gap: 24,
        }}
      >
        <div className="sy-skel" style={{ width: 96, height: 28 }} />
        <div style={{ display: "flex", gap: 20, marginLeft: 16 }}>
          {[70, 90, 80].map((w, i) => (
            <div key={i} className="sy-skel" style={{ width: w, height: 16 }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
          <div className="sy-skel" style={{ width: 80, height: 34, borderRadius: "var(--radius-md)" }} />
          <div className="sy-skel" style={{ width: 32, height: 32, borderRadius: "50%" }} />
        </div>
      </div>

      <div style={{ padding: "20px 48px 40px", maxWidth: 1440, margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div className="sy-skel" style={{ width: 260, height: 12, marginBottom: 16 }} />

        {/* Title block */}
        <div style={{ marginBottom: 18 }}>
          <div className="sy-skel" style={{ width: "55%", height: 38, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="sy-skel" style={{ width: 90, height: 16 }} />
            <div className="sy-skel" style={{ width: 60, height: 16 }} />
            <div className="sy-skel" style={{ width: 110, height: 16 }} />
            <div className="sy-skel" style={{ width: 90, height: 24, borderRadius: 999 }} />
          </div>
        </div>

        {/* Gallery */}
        <div className="detail-skel-gallery">
          <div className="sy-skel gallery-skel-hero" style={{ borderRadius: 0 }} />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="sy-skel" style={{ borderRadius: 0 }} />
          ))}
        </div>

        {/* Main grid */}
        <div className="detail-skel-grid">
          {/* Left column */}
          <div>
            {/* Asso strip */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 14,
                paddingBottom: 22, borderBottom: "1px solid var(--line)",
              }}
            >
              <div className="sy-skel" style={{ width: 48, height: 48, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="sy-skel" style={{ width: "40%", height: 16 }} />
                <div className="sy-skel" style={{ width: "65%", height: 12 }} />
              </div>
              <div className="sy-skel" style={{ width: 100, height: 34, borderRadius: "var(--radius-md)" }} />
            </div>

            {/* Facts grid */}
            <div className="facts-skel-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="sy-skel" style={{ height: 84, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>

            {/* Description */}
            <div className="sy-skel" style={{ width: 130, height: 22, marginTop: 28, marginBottom: 12 }} />
            {[100, 95, 88, 80].map((w, i) => (
              <div key={i} className="sy-skel" style={{ width: `${w}%`, height: 14, marginBottom: 8 }} />
            ))}

            {/* Included grid */}
            <div className="included-skel-grid" style={{ marginTop: 18 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div className="sy-skel" style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0 }} />
                  <div className="sy-skel" style={{ flex: 1, height: 12 }} />
                </div>
              ))}
            </div>

            {/* Availability */}
            <div className="sy-skel" style={{ width: 150, height: 22, marginTop: 28, marginBottom: 12 }} />
            <div className="sy-skel" style={{ height: 88, borderRadius: "var(--radius-md)" }} />

            {/* Reviews */}
            <div
              style={{
                marginTop: 28, display: "flex", alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <div className="sy-skel" style={{ width: 120, height: 22 }} />
              <div className="sy-skel" style={{ width: 60, height: 16 }} />
            </div>
            <div className="reviews-skel-grid">
              {[0, 1].map((i) => (
                <div key={i} className="sy-skel" style={{ height: 130, borderRadius: "var(--radius-md)" }} />
              ))}
            </div>
          </div>

          {/* Right rail */}
          <aside>
            <div style={{ position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="sy-skel" style={{ height: 320, borderRadius: "var(--radius-lg)" }} />
              <div className="sy-skel" style={{ height: 180, borderRadius: "var(--radius-lg)" }} />
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .detail-skel-gallery {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
          height: 380px;
          border-radius: var(--radius-lg);
          overflow: hidden;
        }
        .gallery-skel-hero { grid-row: 1 / 3; }
        .detail-skel-grid {
          margin-top: 28px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 36px;
        }
        .facts-skel-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-top: 22px;
        }
        .included-skel-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .reviews-skel-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 14px;
        }
        @media (max-width: 1024px) {
          .detail-skel-grid { grid-template-columns: 1fr; }
          .facts-skel-grid { grid-template-columns: repeat(2, 1fr); }
          .detail-skel-gallery { height: 320px; }
        }
        @media (max-width: 768px) {
          .detail-skel-gallery {
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 220px 100px;
            height: auto;
          }
          .gallery-skel-hero { grid-row: 1 / 2; grid-column: 1 / 3; }
          .reviews-skel-grid { grid-template-columns: 1fr; }
          .included-skel-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
