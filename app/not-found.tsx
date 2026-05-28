import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        background: "var(--bg)", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px 24px", textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--display)", fontWeight: 800,
          fontSize: 120, lineHeight: 1, color: "var(--surface-3)",
          fontVariationSettings: "'wdth' 110",
          userSelect: "none", marginBottom: 16,
        }}
      >
        404
      </div>
      <h1 className="sy-h1" style={{ marginBottom: 10 }}>Page introuvable</h1>
      <p className="sy-body" style={{ color: "var(--ink-2)", maxWidth: 400, marginBottom: 32 }}>
        Cette page n&apos;existe pas ou a été déplacée. Explorez les prestations disponibles près de chez vous.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <Link
          href="/prestations"
          style={{
            padding: "10px 22px", borderRadius: "var(--radius-md)",
            background: "var(--primary)", color: "#fff",
            fontFamily: "var(--sans)", fontWeight: 600, fontSize: 15,
            textDecoration: "none",
          }}
        >
          Voir les prestations
        </Link>
        <Link
          href="/"
          style={{
            padding: "10px 22px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--line-2)", color: "var(--ink-2)",
            fontFamily: "var(--sans)", fontWeight: 500, fontSize: 15,
            textDecoration: "none",
          }}
        >
          Accueil
        </Link>
      </div>
    </main>
  );
}
