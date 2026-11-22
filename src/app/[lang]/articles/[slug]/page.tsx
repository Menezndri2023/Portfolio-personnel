import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { Footer } from "@/components/site/Footer";
import { Markdown } from "@/components/site/Markdown";
import { Navbar } from "@/components/site/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { findArticle, formatDate, publishedArticles, readingMinutes } from "@/lib/articles";
import { getContent, getLocalizedContent } from "@/lib/content";
import { buildProjects, getRepos } from "@/lib/github";
import { alternateLanguages, getDictionary, isLocale, localePath } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { articleJsonLd } from "@/lib/structured-data";

export const revalidate = 60;

type Props = PageProps<"/[lang]/articles/[slug]">;

export async function generateStaticParams() {
  return publishedArticles(await getContent()).map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const content = await getLocalizedContent(lang);
  const article = findArticle(content, slug);
  if (!article) return { title: getDictionary(lang).notFound.title };
  const path = `/articles/${article.slug}`;
  const title = `${article.title} — ${content.profile.shortName}`;
  return {
    title: article.title,
    description: article.summary,
    keywords: article.tags,
    authors: [{ name: content.profile.name }],
    alternates: { canonical: localePath(lang, path), languages: alternateLanguages(path) },
    openGraph: {
      type: "article",
      siteName: content.profile.name,
      locale: getDictionary(lang).ogLocale,
      url: localePath(lang, path),
      title,
      description: article.summary,
      publishedTime: article.date,
      authors: [content.profile.name],
      tags: article.tags,
    },
    twitter: { card: "summary_large_image", title, description: article.summary },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).articlesPage;
  const content = await getLocalizedContent(lang);
  const article = findArticle(content, slug);
  if (!article) notFound();
  const { profile } = content;
  const path = `/articles/${article.slug}`;
  const { repos } = await getRepos(content);
  const { showcase } = buildProjects(content, repos, lang);
  // Projet lié : un projet du portfolio dont le titre est cité dans les tags de l'article.
  const related = showcase.find((p) => article.tags.some((tag) => tag.toLowerCase() === p.title.toLowerCase()));

  return (
    <>
      <JsonLd data={articleJsonLd(article, content, lang, siteUrl(content.settings))} />
      <Navbar
        locale={lang}
        switchHref={localePath(lang === "fr" ? "en" : "fr", path)}
        brand={profile.shortName}
        email={profile.email}
        github={profile.socials.github}
        projects={showcase.map((p) => ({ slug: p.slug, title: p.title }))}
        home={false}
        current="/articles"
      />
      <main id="top" className="pt-28 pb-24">
        <article className="container-page">
          <Link href={localePath(lang, "/articles")} className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg">
            <ArrowLeft className="size-4" /> {t.back}
          </Link>

          <Reveal className="mt-8 max-w-3xl">
            <p className="flex flex-wrap items-center gap-3 font-mono text-xs text-subtle">
              <span>
                {t.published} <time dateTime={article.date}>{formatDate(article.date, lang)}</time>
              </span>
              <span>·</span>
              <span>{t.minutes(readingMinutes(article.content))}</span>
              <span>·</span>
              <span>
                {t.by} {profile.name}
              </span>
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-balance md:text-5xl">{article.title}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">{article.summary}</p>
            {article.tags.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <li key={tag} className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
          </Reveal>

          {article.cover && (
            <div className="relative mt-12 aspect-[16/9] max-w-4xl overflow-hidden rounded-3xl border border-line bg-card">
              <Image
                src={article.cover}
                alt={article.title}
                fill
                unoptimized={article.cover.startsWith("http")}
                sizes="(min-width: 1024px) 56rem, 100vw"
                className="object-cover object-left-top"
              />
            </div>
          )}

          <div className="mt-12 max-w-3xl">
            <Markdown>{article.content}</Markdown>
          </div>

          <aside className="mt-16 grid max-w-3xl gap-4 sm:grid-cols-2">
            {related && (
              <Link
                href={localePath(lang, `/projets/${encodeURIComponent(related.slug)}`)}
                className="group rounded-3xl border border-line p-7 transition hover:border-line-strong hover:bg-elev"
              >
                <span className="block font-mono text-xs uppercase tracking-widest text-subtle">{t.related}</span>
                <span className="mt-2 flex items-center justify-between gap-3 font-display text-xl font-semibold tracking-tight">
                  {related.title}
                  <ArrowUpRight className="size-5 shrink-0 text-subtle transition group-hover:text-accent" />
                </span>
              </Link>
            )}
            <a
              href={localePath(lang, "/#contact")}
              className="group rounded-3xl border border-line bg-elev p-7 transition hover:border-line-strong"
            >
              <span className="block font-display text-xl font-semibold tracking-tight">{t.ctaTitle}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted">{t.ctaText}</span>
            </a>
          </aside>
        </article>
      </main>
      <Footer locale={lang} profile={profile} />
    </>
  );
}
