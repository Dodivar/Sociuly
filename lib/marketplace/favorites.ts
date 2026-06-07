"use client";

// Favoris marketplace — persistance localStorage (v1, SPEC §2 : pas de DB côté
// favoris). Clé = id d'expérience (MarketplaceExperience.id). Partagé entre la
// liste marketplace, la carte et la page détail via ce hook unique ; un event
// custom synchronise les instances montées sur une même page (et l'event
// `storage` synchronise entre onglets).

import { useCallback, useEffect, useRef, useState } from "react";

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
  // Miroir de l'état courant pour que `toggle` reste stable tout en lisant la
  // dernière valeur sans la passer en dépendance.
  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

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
    // Effets de bord hors de l'updater (un updater doit rester pur : React peut
    // le ré-invoquer en StrictMode/dev). On calcule `next` à partir du ref.
    const next = new Set(favoritesRef.current);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavorites(next);
    writeFavorites(next);
    // Notifie les autres instances du hook montées sur la page (et onglets via `storage`).
    window.dispatchEvent(new Event(FAV_EVENT));
  }, []);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  return { favorites, ready, toggle, isFavorite };
}
