import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";
import { publishedArticles } from "@/lib/articles";
import { buildProjects, getRepos } from "@/lib/github";
import { alternateLanguages, localePath, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

// Généré à chaque requête : toujours aligné sur le contenu de l'admin (lecture légère, dépôts GitHub en cache 1 h).
export const dynamic = "force-dynamic";

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

  const articles = publishedArticles(content);
  const lastUpdate = showcase.map((p) => p.updatedAt).filter(Boolean).sort().at(-1);
  const lastArticle = articles[0]?.date;

  return [
    ...entry("/", { changeFrequency: "weekly", priority: 1, lastModified: lastUpdate }),
    ...entry("/services", { changeFrequency: "monthly", priority: 0.9 }),
    ...entry("/articles", { changeFrequency: "weekly", priority: 0.7, lastModified: lastArticle }),
    ...articles.flatMap((a) => entry(`/articles/${a.slug}`, { lastModified: a.date, changeFrequency: "yearly", priority: 0.7 })),
    ...showcase.flatMap((p) =>
      entry(`/projets/${encodeURIComponent(p.slug)}`, {
        lastModified: p.updatedAt || undefined,
        changeFrequency: "monthly",
        priority: p.featured ? 0.8 : 0.6,
      }),
    ),
  ];
}
