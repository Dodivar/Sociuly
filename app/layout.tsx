import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sociuly — Réservez près de chez vous. Financez le club d'à côté.",
  description:
    "Marketplace de prestations proposées par les associations sportives locales. Chaque réservation finance un projet de saison réel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Geist:wght@400..700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400..600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
