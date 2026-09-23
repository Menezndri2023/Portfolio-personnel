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
import { getContent } from "@/lib/content";
import { buildProjects, getRepos, prettify, visibleRepos } from "@/lib/github";
import { timeAgo } from "@/lib/utils";

// Régénération au plus toutes les heures (et immédiatement après une modification dans /admin).
export const revalidate = 3600;

export default async function HomePage() {
  const content = await getContent();
  const { profile, settings } = content;
  const { repos, live } = await getRepos(content);
  const { showcase, archive } = buildProjects(content, repos);

  const commits = visibleRepos(content, repos)
    .slice(0, 4)
    .map((r) => ({ repo: content.repoOverrides[r.name]?.title || prettify(r.name), when: timeAgo(r.pushedAt) }));

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
    { value: showcase.length, label: "Projets mis en avant" },
    { value: archive.length, label: "Dépôts publics sur GitHub" },
    { value: Math.max(1, new Date().getFullYear() - firstYear), suffix: "+", label: "Années à coder au quotidien" },
    { value: technologies, label: "Technologies maîtrisées" },
  ];

  return (
    <>
      <Navbar
        brand={profile.shortName}
        email={profile.email}
        github={profile.socials.github}
        projects={showcase.map((p) => ({ slug: p.slug, title: p.title }))}
      />
      <main id="top">
        <Hero profile={profile} commits={commits} stack={stack} />
        <Stats items={stats} />
        <About profile={profile} services={content.services} />
        <Skills groups={content.skills} />

        <section id="projets" className="py-24 md:py-32">
          <div className="container-page">
            <SectionHeading
              index="03"
              eyebrow="Projets"
              title="Des produits réels, en ligne et en évolution."
              lead={`Mes ${settings.githubLimit} derniers dépôts GitHub apparaissent ici automatiquement, aux côtés des projets que j'ai choisi de mettre en avant.`}
            />
            <Projects showcase={showcase} archive={archive} githubUrl={profile.socials.github} live={live} />
          </div>
        </section>

        <Journey experiences={content.experiences} education={content.education} />

        <section id="contact" className="py-24 md:py-32">
          <div className="container-page">
            <SectionHeading index="05" eyebrow="Contact" title="Construisons quelque chose de solide ensemble." />
            <ContactPanel profile={profile} />
          </div>
        </section>
      </main>
      <Footer profile={profile} />
    </>
  );
}
