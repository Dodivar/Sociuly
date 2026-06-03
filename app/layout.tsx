import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sociuly — Des expériences sportives premium pour vos équipes.",
  description:
    "Sociuly conçoit et opère des expériences sportives sur mesure pour les entreprises, délivrées par des clubs sportifs locaux. Demandez un devis ; chaque expérience finance un projet de club.",
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
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
