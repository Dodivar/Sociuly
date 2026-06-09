// Lecture serveur du catalogue marketplace (Prisma + PostGIS).
// Séparé de `experiences.ts` (pur, importable côté client) car ce module tire
// `@/lib/prisma` (driver pg → modules Node `fs`/`net`) : l'importer depuis un
// Client Component cassait le build (« Module not found: Can't resolve 'fs' »).
// Cf. SPEC.md §3 (Experience) et §6 (filtres marketplace).

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CITY_CENTERS, cityFromName, haversineKm } from "./geo";
import {
  categoryFromModuleType,
  HUE_BY_CATEGORY,
  type MarketplaceExperience,
} from "./experiences";

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
async function queryMarketplaceExperiences(): Promise<MarketplaceExperience[]> {
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

/**
 * Catalogue mis en cache (Data Cache Next). La lecture en base est coûteuse et
 * les données sont quasi statiques : on évite un aller-retour Postgres à chaque
 * requête (page d'accueil, /notre-impact en ISR + /experiences en rendu dynamique).
 * Revalidation toutes les 5 min ; invalidable à la demande via le tag "experiences".
 */
export const getMarketplaceExperiences = unstable_cache(
  queryMarketplaceExperiences,
  ["marketplace-experiences"],
  { revalidate: 300, tags: ["experiences"] },
);
