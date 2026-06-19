// Découverte club-first (/clubs) — surface de découverte PRINCIPALE (SPEC §6,
// amendement 2026-06). Module pur (types, constantes, helpers de filtrage/tri,
// état URL) importable côté client. La lecture Prisma vit dans `discovery.server.ts`.
//
// Le club est l'entrée ; l'`Experience` reste l'unité de conversion (le CTA d'une
// carte club mène à la vitrine `/clubs/[slug]`). La facette « sport » dérive de
// `Club.federation` ; les formats/capacité/prix d'appel sont agrégés depuis les
// expériences publiées du club. Montants en cents en base, exposés en euros ici.

import type { ExperienceHue } from "@/components/ds/patterns";
import type { IconName } from "@/components/ds/icon";
import { type City } from "@/lib/marketplace/experiences";

// ─────── Sport (dérivé de Club.federation, SPEC §3) ───────
export type Sport = "football" | "rugby" | "handball" | "basket" | "tennis" | "autre";

export const SPORTS: Array<{ id: Sport; label: string }> = [
  { id: "football", label: "Football" },
  { id: "rugby", label: "Rugby" },
  { id: "handball", label: "Handball" },
  { id: "basket", label: "Basket" },
  { id: "tennis", label: "Tennis" },
  { id: "autre", label: "Autre" },
];

export const SPORT_LABEL: Record<Sport, string> = {
  football: "Football",
  rugby: "Rugby",
  handball: "Handball",
  basket: "Basket",
  tennis: "Tennis",
  autre: "Autre",
};

/** Glyphe DS (set Icon maison) représentant chaque sport — `autre` retombe sur le trophée. */
export const SPORT_ICON: Record<Sport, IconName> = {
  football: "football",
  rugby: "rugby",
  handball: "handball",
  basket: "basket",
  tennis: "tennis",
  autre: "trophy",
};

/** Mapping enum Prisma `Federation` → identifiant Sport. */
export function sportFromFederation(federation: string | null): Sport {
  switch (federation) {
    case "FFF": return "football";
    case "FFR": return "rugby";
    case "FFHB": return "handball";
    case "FFBB": return "basket";
    case "FFT": return "tennis";
    default: return "autre";
  }
}

/** Teinte du bandeau de la carte club, par sport (palette DS — non régénérée). */
export const HUE_BY_SPORT: Record<Sport, ExperienceHue> = {
  football: "green",
  rugby: "rust",
  handball: "orange",
  basket: "teal",
  tennis: "yellow",
  autre: "sand",
};

// ─────── Format d'expérience (Experience.format, SPEC §3) ───────
export type ClubFormat = "demi_journee" | "journee" | "soiree" | "sur_mesure";

export const FORMATS: Array<{ id: ClubFormat; label: string }> = [
  { id: "demi_journee", label: "Demi-journée" },
  { id: "journee", label: "Journée" },
  { id: "soiree", label: "Soirée" },
  { id: "sur_mesure", label: "Sur-mesure" },
];

export const FORMAT_LABEL: Record<ClubFormat, string> = {
  demi_journee: "Demi-journée",
  journee: "Journée",
  soiree: "Soirée",
  sur_mesure: "Sur-mesure",
};

// ─────── Capacité (taille de groupe que le club peut accueillir) ───────
// Le filtre garde les clubs dont au moins une expérience accueille ≥ N personnes.
export const CAPACITY_BUCKETS: Array<{ value: number; label: string }> = [
  { value: 10, label: "≥ 10 personnes" },
  { value: 25, label: "≥ 25 personnes" },
  { value: 50, label: "≥ 50 personnes" },
  { value: 100, label: "≥ 100 personnes" },
];
export const CAPACITY_MIN = 0; // 0 = pas de filtre

// ─────── Tri ───────
export type ClubSort = "pertinence" | "note" | "distance" | "experiences";

export const CLUB_SORTS: Array<{ id: ClubSort; label: string }> = [
  { id: "pertinence", label: "Pertinence" },
  { id: "note", label: "Note ★" },
  { id: "distance", label: "Distance" },
  { id: "experiences", label: "Expériences" },
];

// ─────── Modèle d'une carte club (découverte) ───────
export type DiscoveryClub = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  sport: Sport;
  typeLabel: string;
  city: City;
  cityRaw: string;
  /** Distance au centre-ville sélectionné (km). Mock — sera dérivé de PostGIS. */
  distanceKm: number;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  experienceCount: number;
  /** Prix d'appel TTC en euros (min des expériences), null si aucune publiée. */
  fromPrice: number | null;
  formats: ClubFormat[];
  /** Plus grande capacité accueillie parmi les expériences publiées. */
  capacityMax: number;
  hue: ExperienceHue;
  canHostVipMatch: boolean;
  /** Projet de saison phare soutenu par le club. */
  project: string | null;
  goal: number;
};

// ─────── Filtres normalisés ───────
export type ClubFilters = {
  sport: Sport | null;
  city: City | null;
  format: ClubFormat | null;
  /** Capacité minimale (≥ N personnes). 0 = pas de filtre. */
  minCapacity: number;
  sort: ClubSort;
  /** Recherche plein-texte (nom du club, ville, sport). Chaîne vide = pas de filtre. */
  q: string;
};

export const DEFAULT_CLUB_FILTERS: ClubFilters = {
  sport: null,
  city: null,
  format: null,
  minCapacity: CAPACITY_MIN,
  sort: "pertinence",
  q: "",
};

// Normalise une chaîne pour la recherche : minuscules + sans accents.
function normalizeSearch(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// ─────── Filtrage + tri (pur, réutilisable serveur/client) ───────
export function filterAndSortClubs(
  items: DiscoveryClub[],
  filters: ClubFilters,
): DiscoveryClub[] {
  const needle = filters.q ? normalizeSearch(filters.q) : "";
  const filtered = items.filter((c) => {
    if (filters.sport && c.sport !== filters.sport) return false;
    if (filters.city && c.city !== filters.city) return false;
    if (filters.format && !c.formats.includes(filters.format)) return false;
    if (filters.minCapacity > 0 && c.capacityMax < filters.minCapacity) return false;
    if (needle) {
      const haystack = normalizeSearch(`${c.name} ${c.cityRaw} ${SPORT_LABEL[c.sport]}`);
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (filters.sort) {
    case "note":
      sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      break;
    case "distance":
      sorted.sort((a, b) => a.distanceKm - b.distanceKm);
      break;
    case "experiences":
      sorted.sort((a, b) => b.experienceCount - a.experienceCount);
      break;
    case "pertinence":
    default:
      // Score simple : note pondérée par le volume d'avis, départage par nb d'expériences.
      sorted.sort(
        (a, b) =>
          b.rating * Math.log10(b.reviews + 1) - a.rating * Math.log10(a.reviews + 1) ||
          b.experienceCount - a.experienceCount,
      );
      break;
  }
  return sorted;
}

// ─────── Parsing / sérialisation des searchParams (URL state) ───────
type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseClubFilters(params: RawParams): ClubFilters {
  const rawSport = first(params.sport);
  const sport = SPORTS.some((s) => s.id === rawSport) ? (rawSport as Sport) : null;

  const rawCity = first(params.ville);
  const city = (["strasbourg", "nancy", "metz"] as const).includes(rawCity as City)
    ? (rawCity as City)
    : null;

  const rawFormat = first(params.format);
  const format = FORMATS.some((f) => f.id === rawFormat) ? (rawFormat as ClubFormat) : null;

  const rawCap = Number.parseInt(first(params.capacite) ?? "", 10);
  const minCapacity = CAPACITY_BUCKETS.some((b) => b.value === rawCap) ? rawCap : CAPACITY_MIN;

  const rawSort = first(params.tri);
  const sort = CLUB_SORTS.some((s) => s.id === rawSort) ? (rawSort as ClubSort) : "pertinence";

  const rawQ = first(params.q);
  const q = rawQ ? rawQ.trim().slice(0, 80) : "";

  return { sport, city, format, minCapacity, sort, q };
}

/** Sérialise les filtres en query string (omet les valeurs par défaut). */
export function buildClubQuery(filters: ClubFilters): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.sport) sp.set("sport", filters.sport);
  if (filters.city) sp.set("ville", filters.city);
  if (filters.format) sp.set("format", filters.format);
  if (filters.minCapacity > 0) sp.set("capacite", String(filters.minCapacity));
  if (filters.sort !== "pertinence") sp.set("tri", filters.sort);
  return sp.toString();
}

/** Nombre de filtres « actifs » (hors tri) — pour le badge « Filtres · N ». */
export function countActiveClubFilters(filters: ClubFilters): number {
  let n = 0;
  if (filters.q) n++;
  if (filters.sport) n++;
  if (filters.city) n++;
  if (filters.format) n++;
  if (filters.minCapacity > 0) n++;
  return n;
}
