import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { buildProjects, getRepos } from "@/lib/github";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const base = content.settings.siteUrl.replace(/\/$/, "");
  if (!base) return [];
  const { repos } = await getRepos(content);
  const { showcase } = buildProjects(content, repos);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    ...showcase.map((p) => ({
      url: `${base}/projets/${encodeURIComponent(p.slug)}`,
      lastModified: p.updatedAt || undefined,
      priority: 0.7,
    })),
  ];
}
