import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { buildProjects, getRepos } from "@/lib/github";
import { localePath, locales } from "@/lib/i18n";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContent();
  const base = content.settings.siteUrl.replace(/\/$/, "");
  if (!base) return [];
  const { repos } = await getRepos(content);
  const { showcase } = buildProjects(content, repos);

  // Chaque page existe en français et en anglais : une entrée par langue, liées entre elles.
  const entry = (path: string, extra: Omit<MetadataRoute.Sitemap[number], "url">) => {
    const languages = Object.fromEntries(locales.map((l) => [l, `${base}${localePath(l, path)}`]));
    return locales.map((l) => ({ url: languages[l], alternates: { languages }, ...extra }));
  };

  return [
    ...entry("/", { changeFrequency: "weekly", priority: 1 }),
    ...showcase.flatMap((p) =>
      entry(`/projets/${encodeURIComponent(p.slug)}`, { lastModified: p.updatedAt || undefined, priority: 0.7 }),
    ),
  ];
}
