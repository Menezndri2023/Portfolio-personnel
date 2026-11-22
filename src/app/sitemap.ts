import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { buildProjects, getRepos } from "@/lib/github";
import { alternateLanguages, localePath, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const base = siteUrl(content.settings);
  if (!base) return [];
  const { repos } = await getRepos(content);
  const { showcase } = buildProjects(content, repos);

  // Chaque page existe en français et en anglais : une entrée par langue, liées entre elles (+ x-default).
  const entry = (path: string, extra: Omit<MetadataRoute.Sitemap[number], "url">) => {
    const languages = alternateLanguages(path, base);
    return locales.map((l) => ({ url: `${base}${localePath(l, path)}`, alternates: { languages }, ...extra }));
  };

  const lastUpdate = showcase.map((p) => p.updatedAt).filter(Boolean).sort().at(-1);

  return [
    ...entry("/", { changeFrequency: "weekly", priority: 1, lastModified: lastUpdate }),
    ...showcase.flatMap((p) =>
      entry(`/projets/${encodeURIComponent(p.slug)}`, {
        lastModified: p.updatedAt || undefined,
        changeFrequency: "monthly",
        priority: p.featured ? 0.8 : 0.6,
      }),
    ),
  ];
}
