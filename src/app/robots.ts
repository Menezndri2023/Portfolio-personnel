import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/site";

// Généré à chaque requête : toujours aligné sur le contenu de l'admin (lecture légère, dépôts GitHub en cache 1 h).
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { settings } = await getContent();
  const base = siteUrl(settings);
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}
