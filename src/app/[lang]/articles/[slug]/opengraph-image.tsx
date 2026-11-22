import { findArticle } from "@/lib/articles";
import { getLocalizedContent } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { displayHost, ogSize, renderOgImage } from "@/lib/og";
import { siteUrl } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Manassé N'Dri — Article";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  const lang = isLocale(raw) ? raw : "fr";
  const content = await getLocalizedContent(lang);
  const article = findArticle(content, slug);
  const t = getDictionary(lang).articlesPage;
  return renderOgImage({
    eyebrow: t.eyebrow,
    title: article?.title ?? getDictionary(lang).notFound.title,
    subtitle: article?.summary,
    tags: article?.tags,
    footer: `${content.profile.shortName} · ${displayHost(siteUrl(content.settings))}`,
  });
}
