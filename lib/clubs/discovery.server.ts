// Lecture serveur de la découverte club-first (/clubs) — Prisma + PostGIS.
// Séparé de `discovery.ts` (pur, importable côté client) car ce module tire
// `@/lib/prisma` (driver pg → modules Node). Cf. SPEC §6 (amendement club-first).
//
// Agrège, par club ACTIF (KYC validé §4), les expériences publiées : nombre,
// prix d'appel, note moyenne, formats proposés, capacité max, + le projet phare.
// Le filtrage/tri est appliqué ensuite en mémoire par `filterAndSortClubs`.

import { unstable_cache } from "next/cache";
import { prisma, readForBuild } from "@/lib/prisma";
import { CITY_CENTERS, cityFromName, haversineKm } from "@/lib/marketplace/geo";
import { initialsFrom } from "./club-detail";
import {
  type ClubFormat,
  type DiscoveryClub,
  HUE_BY_SPORT,
  sportFromFederation,
} from "./discovery";

const CLUB_TYPE_LABEL: Record<string, string> = {
  association_1901: "Association",
  club_pro: "Club pro",
  sasp: "Club pro",
  autre: "Club partenaire",
};

const VALID_FORMATS: ClubFormat[] = ["demi_journee", "journee", "soiree", "sur_mesure"];

// Ligne brute renvoyée par la requête d'agrégation (géo PostGIS, montants en cents).
type ClubRow = {
  id: string;
  slug: string;
  name: string;
  city: string;
  club_type: string;
  federation: string | null;
  can_host_vip_match: boolean;
  lat: number | null;
  lng: number | null;
  exp_count: number | bigint;
  min_price: number | null;
  rating: number | null;
  reviews: number | bigint | null;
  capacity_max: number | null;
  formats: string[] | null;
  proj_title: string | null;
  proj_collected: number | null;
  proj_target: number | null;
};

async function queryDiscoveryClubs(): Promise<DiscoveryClub[]> {
  // Build sans base / base injoignable (CI/preview) : annuaire vide → le rendu aboutit.
  return readForBuild<DiscoveryClub[]>(async () => {
    const rows = await prisma.$queryRaw<ClubRow[]>`
      SELECT
        c.id,
        c.slug,
        c.name,
        c.city,
        c."clubType"        AS club_type,
        c.federation::text  AS federation,
        c."canHostVipMatch" AS can_host_vip_match,
        ST_Y(c.geo::geometry) AS lat,
        ST_X(c.geo::geometry) AS lng,
        COALESCE(agg.exp_count, 0)    AS exp_count,
        agg.min_price,
        agg.rating,
        COALESCE(agg.reviews, 0)      AS reviews,
        agg.capacity_max,
        agg.formats,
        proj.title          AS proj_title,
        proj.collected      AS proj_collected,
        proj.target         AS proj_target
      FROM "Club" c
      LEFT JOIN LATERAL (
        SELECT
          COUNT(*)                                                    AS exp_count,
          MIN(e."basePriceCents")                                     AS min_price,
          AVG(e."ratingAvg") FILTER (WHERE e."ratingAvg" IS NOT NULL) AS rating,
          SUM(e."reviewsCount")                                       AS reviews,
          MAX(e."capacityMax")                                        AS capacity_max,
          ARRAY_AGG(DISTINCT e.format::text)                          AS formats
        FROM "Experience" e
        WHERE e."clubId" = c.id AND e.status = 'published'
      ) agg ON TRUE
      LEFT JOIN LATERAL (
        SELECT p.title, p."collectedAmount" AS collected, p."targetAmount" AS target
        FROM "Project" p
        WHERE p."clubId" = c.id
        ORDER BY (p.status = 'active') DESC, p."collectedAmount" DESC
        LIMIT 1
      ) proj ON TRUE
      WHERE c.status = 'active'
    `;

    return rows.map((r) => {
      const sport = sportFromFederation(r.federation);
      const city = cityFromName(r.city);
      const lat = r.lat ?? CITY_CENTERS[city].lat;
      const lng = r.lng ?? CITY_CENTERS[city].lng;
      const distanceKm = Math.round(haversineKm(CITY_CENTERS[city], { lat, lng }) * 10) / 10;
      const experienceCount = Number(r.exp_count);
      const reviews = Number(r.reviews ?? 0);
      const formats = (r.formats ?? []).filter((f): f is ClubFormat =>
        VALID_FORMATS.includes(f as ClubFormat),
      );
      const goal =
        r.proj_target && r.proj_target > 0
          ? Math.round(((r.proj_collected ?? 0) / r.proj_target) * 100) / 100
          : 0;

      return {
        id: r.id,
        slug: r.slug,
        name: r.name,
        initials: initialsFrom(r.name),
        sport,
        typeLabel: CLUB_TYPE_LABEL[r.club_type] ?? "Club partenaire",
        city,
        cityRaw: r.city,
        distanceKm,
        lat,
        lng,
        rating: r.rating ?? 0,
        reviews,
        experienceCount,
        fromPrice: r.min_price != null ? Math.round(r.min_price / 100) : null,
        formats,
        capacityMax: r.capacity_max ?? 0,
        hue: HUE_BY_SPORT[sport],
        canHostVipMatch: r.can_host_vip_match,
        project: r.proj_title,
        goal,
      } satisfies DiscoveryClub;
    });
  }, []);
}

/**
 * Annuaire clubs mis en cache (Data Cache Next). Quasi statique : on évite un
 * aller-retour Postgres à chaque requête. Revalidation toutes les 5 min ;
 * invalidable via le tag "clubs".
 */
export const getDiscoveryClubs = unstable_cache(
  queryDiscoveryClubs,
  ["discovery-clubs"],
  { revalidate: 300, tags: ["clubs"] },
);
