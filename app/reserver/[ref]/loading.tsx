export default function BookingLoading() {
  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Slim top bar */}
      <div
        style={{
          padding: "14px 32px", borderBottom: "1px solid var(--line)",
          background: "var(--surface)", display: "flex", alignItems: "center", gap: 24,
        }}
      >
        <div className="sy-skel" style={{ width: 96, height: 28 }} />
        <div className="sy-skel" style={{ flex: 1, maxWidth: 480, height: 20, margin: "0 auto" }} />
        <div className="sy-skel" style={{ width: 120, height: 14 }} />
      </div>

      {/* Booking content */}
      <div className="booking-skel-grid" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", width: "100%" }}>
        {/* Form side */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="sy-skel"
              style={{ height: 72, borderRadius: "var(--radius-md)", animationDelay: `${i * 0.1}s` }}
            />
          ))}
          <div className="sy-skel" style={{ height: 200, borderRadius: "var(--radius-md)", marginTop: 4 }} />
          <div className="sy-skel" style={{ height: 100, borderRadius: "var(--radius-md)" }} />
          <div className="sy-skel" style={{ width: "100%", height: 52, borderRadius: "var(--radius-md)", marginTop: 8 }} />
        </div>

        {/* Summary card */}
        <div>
          <div style={{ position: "sticky", top: 16 }}>
            <div className="sy-skel" style={{ height: 420, borderRadius: "var(--radius-lg)" }} />
          </div>
        </div>
      </div>

      <style>{`
        .booking-skel-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 32px;
        }
        @media (max-width: 768px) {
          .booking-skel-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
