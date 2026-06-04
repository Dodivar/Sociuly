// Catalogue marketplace (expériences publiées) — source de vérité côté front v1.
// Cf. SPEC.md §3 (Experience) et §6 (filtres marketplace : prix, rayon km, date,
// ville, tri). TODO(api): remplacer par un fetch Prisma filtré côté serveur
// (Experience.status = 'published' + jointure géo Club.geo). Garder la signature
// async et les enums alignés sur le schéma.

import type { ExperienceHue } from "@/components/ds/patterns";

// ─────── Villes pilotes (SPEC §4 — autocomplete limité à 3 villes en v1) ───────
export type City = "strasbourg" | "nancy" | "metz";

export const CITIES: Array<{ id: City; label: string }> = [
  { id: "strasbourg", label: "Strasbourg" },
  { id: "nancy", label: "Nancy" },
  { id: "metz", label: "Metz" },
];

export const CITY_LABEL: Record<City, string> = {
  strasbourg: "Strasbourg",
  nancy: "Nancy",
  metz: "Metz",
};

// ─────── Catégories (familles de modules / chips) ───────
export type Category =
  | "cohesion"
  | "initiation"
  | "tournoi"
  | "match_vip"
  | "masterclass"
  | "coulisses";

export const CATEGORIES: Array<{ id: Category; label: string }> = [
  { id: "cohesion", label: "Cohésion" },
  { id: "initiation", label: "Initiation" },
  { id: "tournoi", label: "Tournoi" },
  { id: "match_vip", label: "Match VIP" },
  { id: "masterclass", label: "Masterclass" },
  { id: "coulisses", label: "Coulisses" },
];

export const CATEGORY_LABEL: Record<Category, string> = {
  cohesion: "Cohésion",
  initiation: "Initiation",
  tournoi: "Tournoi",
  match_vip: "Match VIP",
  masterclass: "Masterclass",
  coulisses: "Coulisses",
};

// ─────── Tri ───────
export type Sort = "pertinence" | "prix" | "note" | "distance";

export const SORTS: Array<{ id: Sort; label: string }> = [
  { id: "pertinence", label: "Pertinence" },
  { id: "prix", label: "Prix ↑" },
  { id: "note", label: "Note ★" },
  { id: "distance", label: "Distance" },
];

// ─────── Modèle d'une carte marketplace ───────
export type MarketplaceExperience = {
  id: string;
  slug: string;
  title: string;
  /** Prix de départ TTC en euros (le montant ferme arrive dans le devis). */
  price: number;
  category: Category;
  club: string;
  city: City;
  /** Distance au centre-ville sélectionné (km). Mock — sera dérivé de PostGIS. */
  distanceKm: number;
  rating: number;
  reviews: number;
  hue: ExperienceHue;
  /** Projet du club financé par l'expérience (Experience.projectId). */
  funds: string;
  goal: number;
  capacityLabel: string;
  /** Date de première disponibilité (ISO yyyy-mm-dd) — filtre « date ». */
  availableFrom: string;
  /** Position sur la carte mock (pourcentages 0–100). Mock du Club.geo. */
  x: number;
  y: number;
};

// ─────── Filtres normalisés ───────
export type MarketplaceFilters = {
  category: Category | null;
  sort: Sort;
  city: City | null;
  priceMin: number;
  priceMax: number;
  radiusKm: number;
  /** Disponible au plus tard à cette date (ISO yyyy-mm-dd) ou null. */
  date: string | null;
  /** Recherche plein-texte (titre, club, catégorie). Chaîne vide = pas de filtre. */
  q: string;
};

export const PRICE_FLOOR = 0;
export const PRICE_CEIL = 3000;
export const RADIUS_DEFAULT = 30; // SPEC §4 — rayon par défaut 30 km
export const RADIUS_MAX = 100;
export const PAGE_SIZE = 6;

export const DEFAULT_FILTERS: MarketplaceFilters = {
  category: null,
  sort: "pertinence",
  city: null,
  priceMin: PRICE_FLOOR,
  priceMax: PRICE_CEIL,
  radiusKm: RADIUS_MAX,
  date: null,
  q: "",
};

// ─────── Données mock ───────
const CATALOG: MarketplaceExperience[] = [
  {
    id: "e1", slug: "journee-immersion-sig", title: "Journée immersion · SIG Strasbourg",
    price: 480, category: "match_vip", club: "SIG Strasbourg", city: "strasbourg",
    distanceKm: 2, rating: 4.9, reviews: 62, hue: "green", funds: "École de jeunes U17",
    goal: 0.62, capacityLabel: "20–60 pers.", availableFrom: "2026-06-15", x: 22, y: 30,
  },
  {
    id: "e2", slug: "seminaire-cohesion-rhenus", title: "Séminaire cohésion · demi-journée",
    price: 1200, category: "cohesion", club: "SIG Strasbourg", city: "strasbourg",
    distanceKm: 4, rating: 4.8, reviews: 47, hue: "teal", funds: "Mini-bus du club",
    goal: 0.55, capacityLabel: "10–40 pers.", availableFrom: "2026-06-20", x: 42, y: 55,
  },
  {
    id: "e3", slug: "initiation-rugby-encadree", title: "Initiation rugby encadrée",
    price: 900, category: "initiation", club: "RC Strasbourg", city: "strasbourg",
    distanceKm: 7, rating: 4.9, reviews: 38, hue: "orange", funds: "Vestiaires neufs",
    goal: 0.78, capacityLabel: "15–30 pers.", availableFrom: "2026-07-01", x: 60, y: 22,
  },
  {
    id: "e4", slug: "mini-tournoi-inter-equipes", title: "Mini-tournoi inter-équipes",
    price: 1500, category: "tournoi", club: "ASPTT Strasbourg", city: "strasbourg",
    distanceKm: 11, rating: 4.7, reviews: 41, hue: "yellow", funds: "Maillots saison",
    goal: 0.45, capacityLabel: "20–80 pers.", availableFrom: "2026-06-28", x: 72, y: 60,
  },
  {
    id: "e5", slug: "masterclass-joueur-pro-sig", title: "Masterclass joueur pro",
    price: 1800, category: "masterclass", club: "SIG Strasbourg", city: "strasbourg",
    distanceKm: 3, rating: 5.0, reviews: 19, hue: "rust", funds: "Stage été U13",
    goal: 0.85, capacityLabel: "10–40 pers.", availableFrom: "2026-09-05", x: 34, y: 75,
  },
  {
    id: "e6", slug: "cocktail-visite-coulisses-strasbourg", title: "Cocktail & visite des coulisses",
    price: 1100, category: "coulisses", club: "SIG Strasbourg", city: "strasbourg",
    distanceKm: 5, rating: 4.5, reviews: 12, hue: "sand", funds: "École de jeunes",
    goal: 0.15, capacityLabel: "15–50 pers.", availableFrom: "2026-07-12", x: 58, y: 80,
  },
  {
    id: "e7", slug: "atelier-cohesion-nancy", title: "Atelier cohésion d'équipe",
    price: 750, category: "cohesion", club: "ASNL Nancy", city: "nancy",
    distanceKm: 6, rating: 4.6, reviews: 28, hue: "teal", funds: "Section féminine",
    goal: 0.40, capacityLabel: "10–35 pers.", availableFrom: "2026-06-18", x: 18, y: 60,
  },
  {
    id: "e8", slug: "initiation-handball-nancy", title: "Initiation handball encadrée",
    price: 680, category: "initiation", club: "Grand Nancy ASPTT", city: "nancy",
    distanceKm: 9, rating: 4.7, reviews: 22, hue: "orange", funds: "Matériel d'entraînement",
    goal: 0.52, capacityLabel: "12–30 pers.", availableFrom: "2026-07-08", x: 82, y: 38,
  },
  {
    id: "e9", slug: "match-vip-hospitalites-nancy", title: "Match VIP & hospitalités",
    price: 2200, category: "match_vip", club: "ASNL Nancy", city: "nancy",
    distanceKm: 4, rating: 4.6, reviews: 28, hue: "green", funds: "Centre de formation",
    goal: 0.30, capacityLabel: "20–60 pers.", availableFrom: "2026-08-22", x: 50, y: 18,
  },
  {
    id: "e10", slug: "mini-tournoi-nancy", title: "Mini-tournoi multisports",
    price: 1350, category: "tournoi", club: "Grand Nancy ASPTT", city: "nancy",
    distanceKm: 14, rating: 4.4, reviews: 16, hue: "yellow", funds: "Tournoi national U15",
    goal: 0.25, capacityLabel: "25–80 pers.", availableFrom: "2026-09-14", x: 30, y: 42,
  },
  {
    id: "e11", slug: "masterclass-coach-metz", title: "Masterclass coach professionnel",
    price: 1650, category: "masterclass", club: "Metz Handball", city: "metz",
    distanceKm: 3, rating: 4.9, reviews: 31, hue: "rust", funds: "Académie jeunes",
    goal: 0.68, capacityLabel: "10–40 pers.", availableFrom: "2026-06-25", x: 65, y: 72,
  },
  {
    id: "e12", slug: "cocktail-coulisses-metz", title: "Cocktail & coulisses de l'Arena",
    price: 980, category: "coulisses", club: "Metz Handball", city: "metz",
    distanceKm: 5, rating: 4.7, reviews: 18, hue: "sand", funds: "Rénovation tribune",
    goal: 0.48, capacityLabel: "15–50 pers.", availableFrom: "2026-07-20", x: 45, y: 28,
  },
  {
    id: "e13", slug: "cohesion-aviron-metz", title: "Cohésion sur l'eau · aviron",
    price: 1420, category: "cohesion", club: "Société Nautique Metz", city: "metz",
    distanceKm: 8, rating: 4.8, reviews: 24, hue: "teal", funds: "Flotte de bateaux",
    goal: 0.60, capacityLabel: "8–24 pers.", availableFrom: "2026-07-03", x: 78, y: 52,
  },
  {
    id: "e14", slug: "initiation-escrime-metz", title: "Initiation escrime encadrée",
    price: 820, category: "initiation", club: "Cercle d'Escrime Metz", city: "metz",
    distanceKm: 12, rating: 4.6, reviews: 14, hue: "orange", funds: "Équipements de protection",
    goal: 0.35, capacityLabel: "10–24 pers.", availableFrom: "2026-08-10", x: 24, y: 20,
  },
];

export async function getMarketplaceExperiences(): Promise<MarketplaceExperience[]> {
  return CATALOG;
}

// Normalise une chaîne pour la recherche : minuscules + sans accents/diacritiques.
function normalizeSearch(s: string): string {
  // Retire les diacritiques combinants (U+0300–U+036F) après décomposition NFD.
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// ─────── Filtrage + tri (pur, réutilisable serveur/client) ───────
export function filterAndSortExperiences(
  items: MarketplaceExperience[],
  filters: MarketplaceFilters,
): MarketplaceExperience[] {
  const needle = filters.q ? normalizeSearch(filters.q) : "";
  const filtered = items.filter((x) => {
    if (filters.category && x.category !== filters.category) return false;
    if (filters.city && x.city !== filters.city) return false;
    if (x.price < filters.priceMin || x.price > filters.priceMax) return false;
    if (x.distanceKm > filters.radiusKm) return false;
    // « Disponible au plus tard le … » → on garde les expériences disponibles à cette date.
    if (filters.date && x.availableFrom > filters.date) return false;
    // Recherche plein-texte sur titre + club + libellé de catégorie.
    if (needle) {
      const haystack = normalizeSearch(`${x.title} ${x.club} ${CATEGORY_LABEL[x.category]}`);
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "prix":
      sorted.sort((a, b) => a.price - b.price);
      break;
    case "note":
      sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      break;
    case "distance":
      sorted.sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case "pertinence":
    default:
      // Score simple : note pondérée par le volume d'avis.
      sorted.sort((a, b) => b.rating * Math.log10(b.reviews + 1) - a.rating * Math.log10(a.reviews + 1));
      break;
  }
  return sorted;
}

// ─────── Parsing / sérialisation des searchParams (URL state) ───────
type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function clampInt(value: string | undefined, fallback: number, min: number, max: number): number {
  const n = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function parseFilters(params: RawParams): MarketplaceFilters {
  const rawCat = first(params.cat);
  const category = CATEGORIES.some((c) => c.id === rawCat) ? (rawCat as Category) : null;

  const rawSort = first(params.tri);
  const sort = SORTS.some((s) => s.id === rawSort) ? (rawSort as Sort) : "pertinence";

  const rawCity = first(params.ville);
  const city = CITIES.some((c) => c.id === rawCity) ? (rawCity as City) : null;

  const priceMin = clampInt(first(params.prixMin), PRICE_FLOOR, PRICE_FLOOR, PRICE_CEIL);
  const priceMax = clampInt(first(params.prixMax), PRICE_CEIL, PRICE_FLOOR, PRICE_CEIL);
  const radiusKm = clampInt(first(params.rayon), RADIUS_MAX, 1, RADIUS_MAX);

  const rawDate = first(params.date);
  const date = rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : null;

  // Recherche plein-texte : on borne la longueur pour éviter les abus.
  const rawQ = first(params.q);
  const q = rawQ ? rawQ.trim().slice(0, 80) : "";

  return {
    category,
    sort,
    city,
    priceMin: Math.min(priceMin, priceMax),
    priceMax: Math.max(priceMin, priceMax),
    radiusKm,
    date,
    q,
  };
}

/** Sérialise les filtres en query string (omet les valeurs par défaut). */
export function buildQuery(filters: MarketplaceFilters): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.category) sp.set("cat", filters.category);
  if (filters.sort !== "pertinence") sp.set("tri", filters.sort);
  if (filters.city) sp.set("ville", filters.city);
  if (filters.priceMin !== PRICE_FLOOR) sp.set("prixMin", String(filters.priceMin));
  if (filters.priceMax !== PRICE_CEIL) sp.set("prixMax", String(filters.priceMax));
  if (filters.radiusKm !== RADIUS_MAX) sp.set("rayon", String(filters.radiusKm));
  if (filters.date) sp.set("date", filters.date);
  return sp.toString();
}

/** Nombre de filtres « actifs » (hors tri) — pour le badge « Filtres · N ». */
export function countActiveFilters(filters: MarketplaceFilters): number {
  let n = 0;
  if (filters.q) n++;
  if (filters.category) n++;
  if (filters.city) n++;
  if (filters.priceMin !== PRICE_FLOOR || filters.priceMax !== PRICE_CEIL) n++;
  if (filters.radiusKm !== RADIUS_MAX) n++;
  if (filters.date) n++;
  return n;
}
