import type { Metadata } from "next";
import "./globals.css";
import { BASE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  // metadataBase résout les URLs relatives dans tous les generateMetadata de l'app
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Sociuly — Réservez près de chez vous. Financez le club d'à côté.",
    template: "%s | Sociuly",
  },
  description:
    "Marketplace de prestations proposées par les associations sportives locales. Chaque réservation finance un projet de saison réel.",
  openGraph: {
    siteName: "Sociuly",
    locale: "fr_FR",
    type: "website",
  },
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
