export default function ConfirmationLoading() {
  return (
    <main
      style={{
        background: "var(--bg)", minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "48px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div className="sy-skel" style={{ width: 72, height: 72, borderRadius: "50%" }} />
        <div className="sy-skel" style={{ width: "70%", height: 36 }} />
        <div className="sy-skel" style={{ width: "85%", height: 16 }} />
        <div className="sy-skel" style={{ width: "60%", height: 16 }} />
        <div className="sy-skel" style={{ width: "100%", height: 200, borderRadius: "var(--radius-lg)", marginTop: 12 }} />
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <div className="sy-skel" style={{ width: 150, height: 44, borderRadius: "var(--radius-md)" }} />
          <div className="sy-skel" style={{ width: 120, height: 44, borderRadius: "var(--radius-md)" }} />
        </div>
      </div>
    </main>
  );
}
