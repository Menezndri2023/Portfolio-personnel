import { getLocalizedContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { displayHost, ogSize, renderOgImage } from "@/lib/og";
import { siteUrl } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Manassé N'Dri — Full Stack Software Developer";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const content = await getLocalizedContent(isLocale(lang) ? lang : "fr");
  const { profile, skills } = content;
  return renderOgImage({
    eyebrow: profile.title,
    title: profile.name,
    subtitle: profile.headline,
    tags: skills.filter((g) => !g.learning).flatMap((g) => g.items.slice(0, 2)),
    footer: displayHost(siteUrl(content.settings)),
  });
}
