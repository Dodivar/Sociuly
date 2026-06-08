"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// Vue active du catalogue en mobile (≤768px) : carte ou liste. Sur desktop les
// deux panneaux sont affichés côte à côte, cet état n'a alors pas d'effet visuel.
// Partagé entre la barre de filtres (en-tête) et les résultats (liste + carte +
// bascule) pour masquer les filtres quand la carte est affichée (cf. results).
type View = "map" | "list";

type MarketplaceViewValue = {
  view: View;
  setView: (v: View) => void;
  toggle: () => void;
};

const MarketplaceViewContext = createContext<MarketplaceViewValue | null>(null);

export function MarketplaceViewProvider({ children }: { children: ReactNode }) {
  // Carte affichée en premier en mobile (« trouver une activité »).
  const [view, setView] = useState<View>("map");
  return (
    <MarketplaceViewContext.Provider
      value={{ view, setView, toggle: () => setView((v) => (v === "map" ? "list" : "map")) }}
    >
      {children}
    </MarketplaceViewContext.Provider>
  );
}

export function useMarketplaceView(): MarketplaceViewValue {
  const ctx = useContext(MarketplaceViewContext);
  if (!ctx) {
    throw new Error("useMarketplaceView doit être utilisé dans un MarketplaceViewProvider");
  }
  return ctx;
}
