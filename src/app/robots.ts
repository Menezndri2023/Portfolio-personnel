import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { siteUrl } from "@/lib/site";

// Relu au plus toutes les heures (et dès un enregistrement dans /admin).
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { settings } = await getContent();
  const base = siteUrl(settings);
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}
