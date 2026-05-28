"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BookingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

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
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--primary-soft)", display: "flex",
          alignItems: "center", justifyContent: "center",
          marginBottom: 20, fontSize: 26,
        }}
      >
        📅
      </div>
      <h2 className="sy-h1" style={{ marginBottom: 10 }}>Réservation impossible</h2>
      <p className="sy-body" style={{ color: "var(--ink-2)", maxWidth: 420, marginBottom: 28 }}>
        Une erreur est survenue lors du chargement de votre réservation. Vos données n&apos;ont pas été perdues.
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 22px", borderRadius: "var(--radius-md)",
            background: "var(--primary)", color: "#fff", border: "none",
            fontFamily: "var(--sans)", fontWeight: 600, fontSize: 15, cursor: "pointer",
          }}
        >
          Réessayer
        </button>
        <Link
          href="/prestations"
          style={{
            padding: "10px 22px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--line-2)", color: "var(--ink-2)",
            fontFamily: "var(--sans)", fontWeight: 500, fontSize: 15,
            textDecoration: "none", display: "inline-flex", alignItems: "center",
          }}
        >
          Retour au marketplace
        </Link>
      </div>
    </main>
  );
}
