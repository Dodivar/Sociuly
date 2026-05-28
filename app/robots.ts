import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Pages publiques indexables
        allow: ["/", "/prestations", "/associations"],
        // Zones privées / techniques à exclure
        disallow: ["/admin", "/api", "/dashboard"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
