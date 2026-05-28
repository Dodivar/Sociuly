import type { MetadataRoute } from "next";
import {
  getAllClubSlugs,
  getAllPrestationSlugs,
  BASE_URL,
} from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ─── Pages statiques ────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/prestations`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // ─── Slugs dynamiques récupérés depuis la source de données ─────────────────
  const [clubSlugs, prestationSlugs] = await Promise.all([
    getAllClubSlugs(),
    getAllPrestationSlugs(),
  ]);

  const associationRoutes: MetadataRoute.Sitemap = clubSlugs.map((slug) => ({
    url: `${BASE_URL}/associations/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const prestationRoutes: MetadataRoute.Sitemap = prestationSlugs.map((slug) => ({
    url: `${BASE_URL}/prestations/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...associationRoutes, ...prestationRoutes];
}
