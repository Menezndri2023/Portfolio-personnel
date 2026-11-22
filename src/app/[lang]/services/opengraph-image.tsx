import { getLocalizedContent } from "@/lib/content";
import { getDictionary, isLocale } from "@/lib/i18n";
import { displayHost, ogSize, renderOgImage } from "@/lib/og";
import { siteUrl } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Manassé N'Dri — Services";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  const lang = isLocale(raw) ? raw : "fr";
  const content = await getLocalizedContent(lang);
  const t = getDictionary(lang).servicesPage;
  return renderOgImage({
    eyebrow: t.eyebrow,
    title: content.profile.name,
    subtitle: t.metaTitle,
    tags: content.services.map((s) => s.title).slice(0, 3),
    footer: displayHost(siteUrl(content.settings)),
  });
}
