import { notFound } from "next/navigation";
import { About } from "@/components/site/About";
import { ContactPanel } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { Journey } from "@/components/site/Journey";
import { Navbar } from "@/components/site/Navbar";
import { Projects } from "@/components/site/Projects";
import { Skills } from "@/components/site/Skills";
import { Stats } from "@/components/site/Stats";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getLocalizedContent } from "@/lib/content";
import { buildProjects, getRepos, prettify, visibleRepos } from "@/lib/github";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";
import { timeAgo } from "@/lib/utils";

// Régénération au plus toutes les minutes (et dès la visite suivante après une modification dans /admin).
export const revalidate = 60;

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const content = await getLocalizedContent(lang);
  const { profile, settings } = content;
  const { repos, live } = await getRepos(content);
  const { showcase, archive } = buildProjects(content, repos, lang);

  const commits = visibleRepos(content, repos)
    .slice(0, 4)
    .map((r) => ({ repo: content.repoOverrides[r.name]?.title || prettify(r.name), when: timeAgo(r.pushedAt, lang) }));

  // Aperçu « stack.json » du terminal : deux premiers groupes de compétences + ce qui est en apprentissage.
  const learning = content.skills.find((g) => g.learning);
  const stack: Record<string, string[]> = Object.fromEntries(
    content.skills
      .filter((g) => !g.learning)
      .slice(0, 2)
      .map((g) => [g.title.toLowerCase(), g.items.slice(0, 3)]),
  );
  if (learning) stack.next = learning.items.slice(0, 2);

  const firstYear = repos.length
    ? Math.min(...repos.map((r) => Number(r.createdAt.slice(0, 4))))
    : new Date().getFullYear();
  const technologies = new Set(content.skills.filter((g) => !g.learning).flatMap((g) => g.items)).size;

  const stats = [
    { value: showcase.length, label: t.stats.showcase },
    { value: archive.length, label: t.stats.repos },
    { value: Math.max(1, new Date().getFullYear() - firstYear), suffix: "+", label: t.stats.years },
    { value: technologies, label: t.stats.technologies },
  ];

  return (
    <>
      <Navbar
        locale={lang}
        switchHref={localePath(lang === "fr" ? "en" : "fr")}
        brand={profile.shortName}
        email={profile.email}
        github={profile.socials.github}
        projects={showcase.map((p) => ({ slug: p.slug, title: p.title }))}
      />
      <main id="top">
        <Hero locale={lang} profile={profile} commits={commits} stack={stack} />
        <Stats label={t.stats.aria} items={stats} />
        <About locale={lang} profile={profile} services={content.services} />
        <Skills locale={lang} groups={content.skills} />

        <section id="projets" className="py-24 md:py-32">
          <div className="container-page">
            <SectionHeading
              index="03"
              eyebrow={t.projects.eyebrow}
              title={t.projects.title}
              lead={t.projects.lead(settings.githubLimit)}
            />
            <Projects locale={lang} showcase={showcase} archive={archive} githubUrl={profile.socials.github} live={live} />
          </div>
        </section>

        <Journey locale={lang} experiences={content.experiences} education={content.education} />

        <section id="contact" className="py-24 md:py-32">
          <div className="container-page">
            <SectionHeading index="05" eyebrow={t.contact.eyebrow} title={t.contact.title} />
            <ContactPanel locale={lang} profile={profile} />
          </div>
        </section>
      </main>
      <Footer locale={lang} profile={profile} />
    </>
  );
}
