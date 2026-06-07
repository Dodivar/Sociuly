// Helpers géo du marketplace (SPEC §4 — rayon km, 3 villes pilotes).
// Club.geo est une colonne PostGIS (Unsupported côté Prisma Client) : les
// coordonnées lat/lng sont donc lues via $queryRaw (ST_X/ST_Y), et la distance
// à un centre-ville est calculée par haversine ici (côté Node) — suffisant pour
// l'affichage des cartes. Le filtrage de rayon serveur (ST_DWithin) viendra
// quand la requête catalogue prendra la ville/le rayon en paramètres.

import type { City } from "./experiences";

/** Centres-villes des 3 villes pilotes (WGS84). */
export const CITY_CENTERS: Record<City, { lat: number; lng: number }> = {
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  nancy: { lat: 48.6921, lng: 6.1844 },
  metz: { lat: 49.1193, lng: 6.1757 },
};

/** Normalise un nom de ville Club.city → identifiant City (3 villes pilotes). */
export function cityFromName(name: string): City {
  const n = name.trim().toLowerCase();
  if (n.startsWith("nancy")) return "nancy";
  if (n.startsWith("metz")) return "metz";
  return "strasbourg";
}

/** Distance haversine en km entre deux points WGS84. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
