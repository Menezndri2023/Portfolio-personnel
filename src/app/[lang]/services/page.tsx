import type { Metadata } from "next";
import { ArrowUpRight, Check, Download, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";
import { StatusBadge } from "@/components/site/Projects";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getLocalizedContent } from "@/lib/content";
import { buildProjects, getRepos } from "@/lib/github";
import { alternateLanguages, getDictionary, isLocale, localePath } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import { servicesJsonLd } from "@/lib/structured-data";

export const revalidate = 60;

const PATH = "/services";

export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang).servicesPage;
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

export default async function ServicesPage({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.servicesPage;
  const content = await getLocalizedContent(lang);
  const { profile, services, skills } = content;
  const faq = content.faq ?? [];
  const { repos } = await getRepos(content);
  const { showcase } = buildProjects(content, repos, lang);
  // Réalisations mises en avant : projets « à la une » disposant d'un statut, en ligne d'abord.
  const featured = showcase
    .filter((p) => p.featured && p.status)
    .sort((a, b) => Number(b.status === "production") - Number(a.status === "production"))
    .slice(0, 4);

  return (
    <>
      <JsonLd data={servicesJsonLd(content, lang, siteUrl(content.settings), t.metaTitle, t.metaDescription)} />
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
      <main id="top" className="pt-28">
        {/* En-tête */}
        <section className="relative overflow-hidden pb-16 md:pb-24">
          <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10" />
          <div className="container-page pt-8">
            <Reveal className="max-w-3xl">
              <p className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted">
                <span className="h-px w-8 bg-line-strong" />
                {t.eyebrow}
              </p>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-6xl">{t.title}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{t.lead}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {t.facts.map((f) => (
                  <li key={f} className="inline-flex items-center gap-2 rounded-full border border-line bg-elev/60 px-3.5 py-1.5 text-xs font-medium text-muted">
                    <Check className="size-3.5 text-accent" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={localePath(lang, "/#contact")}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg shadow-[0_8px_30px_-8px_var(--accent)] transition hover:-translate-y-0.5"
                >
                  {t.ctaButton} <ArrowUpRight className="size-4" />
                </a>
                {profile.cvUrl && (
                  <a
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition hover:border-fg"
                  >
                    <Download className="size-4" /> {t.cv}
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Services */}
        <section className="py-16 md:py-24">
          <div className="container-page">
            <SectionHeading index="01" eyebrow={t.eyebrow} title={t.offerTitle} />
            <div className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
              {services.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.06} className="group bg-bg p-8 transition hover:bg-elev">
                  <span className="mb-6 grid size-11 place-items-center rounded-xl bg-accent-soft text-accent transition group-hover:scale-110">
                    <Icon name={s.icon} className="size-5" />
                  </span>
                  <h2 className="font-display text-xl font-semibold tracking-tight">{s.title}</h2>
                  <p className="mt-2 leading-relaxed text-muted">{s.description}</p>
                </Reveal>
              ))}
            </div>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label={dict.skills.eyebrow}>
              {skills
                .filter((g) => !g.learning)
                .flatMap((g) => g.items.slice(0, 3))
                .map((item) => (
                  <li key={item} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted">
                    {item}
                  </li>
                ))}
            </ul>
          </div>
        </section>

        {/* Méthode */}
        <section className="py-16 md:py-24">
          <div className="container-page">
            <SectionHeading index="02" eyebrow={t.eyebrow} title={t.processTitle} />
            <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {t.process.map((step, i) => (
                <Reveal as="li" key={step.title} delay={i * 0.06} className="rounded-3xl border border-line bg-card p-7">
                  <span className="font-mono text-sm text-accent">0{i + 1}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Modalités */}
        <section className="py-16 md:py-24">
          <div className="container-page">
            <SectionHeading index="03" eyebrow={t.eyebrow} title={t.modesTitle} />
            <div className="grid gap-4 md:grid-cols-2">
              {t.modes.map((m, i) => (
                <Reveal key={m.title} delay={i * 0.06} className="rounded-3xl border border-line bg-card p-7 transition hover:border-line-strong">
                  <h3 className="font-display text-lg font-semibold tracking-tight">{m.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{m.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Réalisations */}
        {featured.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container-page">
              <SectionHeading index="04" eyebrow={dict.projects.eyebrow} title={t.projectsTitle} />
              <ul className="grid gap-4 md:grid-cols-2">
                {featured.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={localePath(lang, `/projets/${encodeURIComponent(p.slug)}`)}
                      className="group flex h-full flex-col rounded-3xl border border-line bg-card p-7 transition hover:-translate-y-1 hover:border-line-strong"
                    >
                      <span className="font-mono text-[11px] text-subtle">{p.status && <StatusBadge locale={lang} status={p.status} />}</span>
                      <span className="mt-3 flex items-start justify-between gap-3 font-display text-xl font-semibold tracking-tight">
                        {p.title}
                        <ArrowUpRight className="mt-1 size-5 shrink-0 text-subtle transition group-hover:text-accent" />
                      </span>
                      <span className="mt-2 text-sm leading-relaxed text-muted">{p.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={localePath(lang, "/#projets")} className="mt-6 inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
                {t.allProjects} <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>
        )}

        {/* Questions fréquentes */}
        {faq.length > 0 && (
          <section className="py-16 md:py-24">
            <div className="container-page">
              <SectionHeading index="05" eyebrow={t.eyebrow} title={t.faqTitle} />
              <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-card">
                {faq.map((q) => (
                  <details key={q.id} className="group p-6 md:p-7">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-display text-lg font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
                      <h3>{q.question}</h3>
                      <Plus className="mt-1 size-5 shrink-0 text-subtle transition group-open:rotate-45 group-open:text-accent" aria-hidden />
                    </summary>
                    <p className="mt-3 max-w-3xl leading-relaxed text-muted">{q.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Appel à l'action */}
        <section className="pb-24 pt-8">
          <div className="container-page">
            <div className="rounded-3xl border border-line bg-elev p-8 md:p-12">
              <h2 className="font-display text-3xl font-semibold tracking-tight text-balance md:text-4xl">{t.ctaTitle}</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{t.ctaText}</p>
              <a
                href={localePath(lang, "/#contact")}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition hover:bg-accent hover:text-accent-fg"
              >
                {t.ctaButton} <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={lang} profile={profile} />
    </>
  );
}
