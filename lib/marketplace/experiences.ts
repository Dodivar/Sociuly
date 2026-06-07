// Catalogue marketplace (expériences publiées) — données servies par Prisma.
// Cf. SPEC.md §3 (Experience) et §6 (filtres marketplace : prix, rayon km, date,
// ville, tri). `getMarketplaceExperiences()` lit les Experience.status='published'
// (jointure Club + Project + géo PostGIS). Le filtrage/tri reste en mémoire via
// `filterAndSortExperiences` (helper pur conservé). Montants en cents en base,
// exposés en euros côté carte.

import type { ExperienceHue } from "@/components/ds/patterns";
import { prisma } from "@/lib/prisma";
import { CITY_CENTERS, cityFromName, haversineKm } from "./geo";

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
  /** Latitude WGS84 du lieu (mock du Club.geo / PostGIS Point). */
  lat: number;
  /** Longitude WGS84 du lieu (mock du Club.geo / PostGIS Point). */
  lng: number;
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

// ─────── Dérivation catégorie / teinte (champs présentationnels non stockés) ───────
// SPEC §3 ne stocke pas `category`/`hue` : on les dérive du type du 1er module
// de l'expérience (segment.order = 0). Mapping déterministe.
export function categoryFromModuleType(type: string | null): Category {
  switch (type) {
    case "match_vip": return "match_vip";
    case "initiation": return "initiation";
    case "mini_tournoi": return "tournoi";
    case "masterclass_joueur":
    case "presentation_coach": return "masterclass";
    case "cocktail":
    case "visite_coulisses": return "coulisses";
    case "atelier_cohesion":
    case "exercice_adapte":
    default: return "cohesion";
  }
}

export const HUE_BY_CATEGORY: Record<Category, ExperienceHue> = {
  match_vip: "green",
  cohesion: "teal",
  initiation: "orange",
  tournoi: "yellow",
  masterclass: "rust",
  coulisses: "sand",
};

// Ligne brute renvoyée par la requête catalogue (géo via PostGIS, montants en cents).
type CatalogRow = {
  id: string;
  slug: string;
  title: string;
  base_price_cents: number;
  capacity_min: number;
  capacity_max: number;
  rating_avg: number | null;
  reviews_count: number;
  club_name: string;
  club_city: string;
  lat: number | null;
  lng: number | null;
  project_title: string | null;
  project_collected: number | null;
  project_target: number | null;
  created_at: Date;
  primary_type: string | null;
};

/**
 * Expériences publiées du catalogue (Experience.status='published'), jointes au
 * Club (géo PostGIS lat/lng) et au Projet financé. Le filtrage/tri est appliqué
 * ensuite en mémoire par `filterAndSortExperiences`.
 */
export async function getMarketplaceExperiences(): Promise<MarketplaceExperience[]> {
  const rows = await prisma.$queryRaw<CatalogRow[]>`
    SELECT
      e.id,
      e.slug,
      e.title,
      e."basePriceCents"   AS base_price_cents,
      e."capacityMin"      AS capacity_min,
      e."capacityMax"      AS capacity_max,
      e."ratingAvg"        AS rating_avg,
      e."reviewsCount"     AS reviews_count,
      c.name               AS club_name,
      c.city               AS club_city,
      ST_Y(c.geo::geometry) AS lat,
      ST_X(c.geo::geometry) AS lng,
      p.title              AS project_title,
      p."collectedAmount"  AS project_collected,
      p."targetAmount"     AS project_target,
      e."createdAt"        AS created_at,
      (
        SELECT m.type
        FROM "ExperienceSegment" s
        JOIN "ExperienceModule" m ON m.id = s."moduleId"
        WHERE s."experienceId" = e.id
        ORDER BY s."order" ASC
        LIMIT 1
      )                    AS primary_type
    FROM "Experience" e
    JOIN "Club" c ON c.id = e."clubId"
    LEFT JOIN "Project" p ON p.id = e."projectId"
    WHERE e.status = 'published'
  `;

  return rows.map((r) => {
    const category = categoryFromModuleType(r.primary_type);
    const city = cityFromName(r.club_city);
    const lat = r.lat ?? CITY_CENTERS[city].lat;
    const lng = r.lng ?? CITY_CENTERS[city].lng;
    const distanceKm = Math.round(haversineKm(CITY_CENTERS[city], { lat, lng }) * 10) / 10;
    const goal =
      r.project_target && r.project_target > 0
        ? Math.round(((r.project_collected ?? 0) / r.project_target) * 100) / 100
        : 0;

    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      price: Math.round(r.base_price_cents / 100),
      category,
      club: r.club_name,
      city,
      distanceKm,
      rating: r.rating_avg ?? 0,
      reviews: r.reviews_count,
      hue: HUE_BY_CATEGORY[category],
      funds: r.project_title ?? "",
      goal,
      capacityLabel: `${r.capacity_min}–${r.capacity_max} pers.`,
      // TODO(schéma): la disponibilité n'est pas modélisée (§2 = JSON simple à venir).
      // En attendant on expose la date de création → le filtre « date » est dégradé.
      availableFrom: r.created_at.toISOString().slice(0, 10),
      lat,
      lng,
    };
  });
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
