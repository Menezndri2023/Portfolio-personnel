import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { Reveal } from "@/components/ui/Reveal";
import { formatDate, publishedArticles, readingMinutes } from "@/lib/articles";
import { getLocalizedContent } from "@/lib/content";
import { buildProjects, getRepos } from "@/lib/github";
import { alternateLanguages, getDictionary, isLocale, localePath } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { articlesIndexJsonLd } from "@/lib/structured-data";

export const revalidate = 60;

const PATH = "/articles";

export async function generateMetadata({ params }: PageProps<"/[lang]/articles">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).articlesPage;
  const { profile } = await getLocalizedContent(lang);
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: localePath(lang, PATH), languages: alternateLanguages(PATH) },
    openGraph: {
      type: "website",
      siteName: profile.name,
      locale: getDictionary(lang).ogLocale,
      url: localePath(lang, PATH),
      title: `${t.metaTitle} — ${profile.shortName}`,
      description: t.metaDescription,
    },
    twitter: { card: "summary_large_image", title: `${t.metaTitle} — ${profile.shortName}`, description: t.metaDescription },
  };
}

export default async function ArticlesPage({ params }: PageProps<"/[lang]/articles">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang).articlesPage;
  const content = await getLocalizedContent(lang);
  const { profile } = content;
  const articles = publishedArticles(content);
  const { repos } = await getRepos(content);
  const { showcase } = buildProjects(content, repos, lang);

  return (
    <>
      <JsonLd data={articlesIndexJsonLd(content, articles, lang, siteUrl(content.settings), t.metaTitle, t.metaDescription)} />
      <Navbar
        locale={lang}
        switchHref={localePath(lang === "fr" ? "en" : "fr", PATH)}
        brand={profile.shortName}
        email={profile.email}
        github={profile.socials.github}
        projects={showcase.map((p) => ({ slug: p.slug, title: p.title }))}
        home={false}
        current={PATH}
      />
      <main id="top" className="pt-28 pb-24">
        <div className="container-page">
          <Reveal className="max-w-3xl pt-8">
            <p className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              <span className="h-px w-8 bg-line-strong" />
              {t.eyebrow}
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-6xl">{t.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t.lead}</p>
          </Reveal>

          {articles.length === 0 ? (
            <p className="mt-16 text-muted">{t.empty}</p>
          ) : (
            <ul className="mt-16 grid gap-5 md:grid-cols-2">
              {articles.map((a, i) => (
                <Reveal as="li" key={a.id} delay={i * 0.06}>
                  <Link
                    href={localePath(lang, `${PATH}/${a.slug}`)}
                    className="group flex h-full flex-col rounded-3xl border border-line bg-card p-7 transition duration-300 hover:-translate-y-1 hover:border-line-strong md:p-8"
                  >
                    <span className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-subtle">
                      <time dateTime={a.date}>{formatDate(a.date, lang)}</time>
                      <span>·</span>
                      <span>{t.minutes(readingMinutes(a.content))}</span>
                    </span>
                    <h2 className="mt-3 flex items-start justify-between gap-3 font-display text-2xl font-semibold tracking-tight">
                      {a.title}
                      <ArrowUpRight className="mt-1 size-5 shrink-0 text-subtle transition group-hover:text-accent" />
                    </h2>
                    <p className="mt-3 leading-relaxed text-muted">{a.summary}</p>
                    {a.tags.length > 0 && (
                      <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                        {a.tags.map((tag) => (
                          <li key={tag} className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
                            {tag}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer locale={lang} profile={profile} />
    </>
  );
}
