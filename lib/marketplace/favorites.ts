"use client";

// Favoris marketplace — persistance localStorage (v1, SPEC §2 : pas de DB côté
// favoris). Clé = id d'expérience (MarketplaceExperience.id). Partagé entre la
// liste marketplace, la carte et la page détail via ce hook unique ; un event
// custom synchronise les instances montées sur une même page (et l'event
// `storage` synchronise entre onglets).

import { useCallback, useEffect, useState } from "react";

const FAV_KEY = "sociuly:favoris";
const FAV_EVENT = "sociuly:favoris:change";

function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    // localStorage indisponible — favoris en mémoire seulement.
    return new Set();
  }
}

function writeFavorites(set: Set<string>) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  // `ready` évite un flash « non favori » au 1er rendu (localStorage côté client).
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFavorites(readFavorites());
    setReady(true);

    const sync = () => setFavorites(readFavorites());
    const onStorage = (e: StorageEvent) => {
      if (e.key === FAV_KEY) sync();
    };
    window.addEventListener(FAV_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(FAV_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeFavorites(next);
      // Notifie les autres instances du hook montées sur la page.
      window.dispatchEvent(new Event(FAV_EVENT));
      return next;
    });
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, ready, toggle, isFavorite };
}
