import { getDictionary, type Locale } from "./i18n";
import type { Article, SiteContent } from "./types";

/** Articles publiés, du plus récent au plus ancien. */
export function publishedArticles(content: SiteContent): Article[] {
  return (content.articles ?? []).filter((a) => a.published).sort((a, b) => b.date.localeCompare(a.date));
}

export function findArticle(content: SiteContent, slug: string): Article | null {
  return publishedArticles(content).find((a) => a.slug === slug) ?? null;
}

/** Temps de lecture estimé (environ 220 mots par minute). */
export function readingMinutes(markdown: string): number {
  const words = markdown.replace(/[#*_`>\-|[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(iso: string, locale: Locale): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(getDictionary(locale).dateLocale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}
