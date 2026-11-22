import { getLocalizedContent } from "@/lib/content";
import { findProject, getRepos } from "@/lib/github";
import { getDictionary, isLocale } from "@/lib/i18n";
import { displayHost, ogSize, renderOgImage } from "@/lib/og";
import { siteUrl } from "@/lib/site";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Manassé N'Dri — Portfolio";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang: raw, slug } = await params;
  const lang = isLocale(raw) ? raw : "fr";
  const content = await getLocalizedContent(lang);
  const { repos } = await getRepos(content);
  const project = findProject(content, repos, decodeURIComponent(slug), lang);
  const t = getDictionary(lang);
  return renderOgImage({
    eyebrow: project?.status ? `${t.seo.projects} · ${t.projects.status[project.status]}` : t.seo.projects,
    title: project?.title ?? t.project.notFound,
    subtitle: project?.summary,
    tags: project?.tags,
    footer: `${content.profile.shortName} · ${displayHost(siteUrl(content.settings))}`,
  });
}
