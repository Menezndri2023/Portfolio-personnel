import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, CalendarClock, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/site/Footer";
import { Markdown } from "@/components/site/Markdown";
import { Navbar } from "@/components/site/Navbar";
import { ProjectCover } from "@/components/site/ProjectCover";
import { GithubIcon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { getContent } from "@/lib/content";
import {
  buildProjects,
  fetchLanguages,
  fetchReadme,
  findProject,
  getRepos,
  isBoilerplateReadme,
} from "@/lib/github";
import { formatMonth, languageColors } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const content = await getContent();
  const { repos } = await getRepos(content);
  return { content, repos, project: findProject(content, repos, decodeURIComponent(slug)) };
}

export async function generateStaticParams() {
  const content = await getContent();
  const { repos } = await getRepos(content);
  return buildProjects(content, repos).showcase.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { project } = await load((await params).slug);
  if (!project) return { title: "Projet introuvable" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const { content, repos, project } = await load(slug);
  if (!project) notFound();

  const owner = content.settings.githubUsername;
  const isGithub = project.source === "github";
  const [languages, readme] = isGithub
    ? await Promise.all([
        fetchLanguages(owner, project.slug),
        project.showReadme ? fetchReadme(owner, project.slug) : Promise.resolve(null),
      ])
    : [[], null];
  const showReadme = readme && !isBoilerplateReadme(readme);

  const { showcase } = buildProjects(content, repos);
  const idx = showcase.findIndex((p) => p.slug === project.slug);
  const next = showcase.length > 1 ? showcase[(idx + 1) % showcase.length] : null;

  return (
    <>
      <Navbar
        brand={content.profile.shortName}
        email={content.profile.email}
        github={content.profile.socials.github}
        projects={showcase.map((p) => ({ slug: p.slug, title: p.title }))}
        home={false}
      />
      <main id="top" className="pt-28 pb-24">
        <article className="container-page">
          <Link href="/#projets" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg">
            <ArrowLeft className="size-4" /> Tous les projets
          </Link>

          <Reveal className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <div className="mb-4 flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span key={t} className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-muted">
                    {t}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-balance md:text-6xl">{project.title}</h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{project.summary}</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg transition hover:-translate-y-0.5"
                >
                  Voir en ligne <ArrowUpRight className="size-4" />
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium transition hover:border-fg"
                >
                  <GithubIcon className="size-4" /> Code source
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ProjectCover project={project} large className="mt-12 aspect-[21/9] rounded-3xl border border-line" />
          </Reveal>

          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_280px]">
            <div className="min-w-0 space-y-12">
              {project.description && <Markdown>{project.description}</Markdown>}

              {showReadme && (
                <section>
                  <h2 className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-subtle">
                    <GithubIcon className="size-4" /> README du dépôt
                  </h2>
                  <div className="rounded-3xl border border-line bg-card p-6 md:p-10">
                    <Markdown repo={{ owner, name: project.slug }}>{readme}</Markdown>
                  </div>
                </section>
              )}

              {!project.description && !showReadme && (
                <p className="text-muted">
                  La documentation détaillée de ce projet arrive bientôt. En attendant, le code source est
                  consultable sur GitHub.
                </p>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
              {isGithub && (
                <dl className="space-y-4 text-sm">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <dt className="flex items-center gap-2 text-muted">
                      <CalendarClock className="size-4" /> Dernière mise à jour
                    </dt>
                    <dd>{formatMonth(project.updatedAt)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <dt className="flex items-center gap-2 text-muted">
                      <Star className="size-4" /> Étoiles
                    </dt>
                    <dd>{project.stars}</dd>
                  </div>
                </dl>
              )}

              {languages.length > 0 && (
                <div>
                  <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-subtle">Langages</h2>
                  <div className="flex h-2 overflow-hidden rounded-full bg-line">
                    {languages.map((l) => (
                      <span
                        key={l.name}
                        style={{ width: `${l.percent}%`, background: languageColors[l.name] ?? "var(--subtle)" }}
                      />
                    ))}
                  </div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {languages.map((l) => (
                      <li key={l.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ background: languageColors[l.name] ?? "var(--subtle)" }}
                          />
                          {l.name}
                        </span>
                        <span className="font-mono text-xs text-muted">{l.percent}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>

          {next && next.slug !== project.slug && (
            <Link
              href={`/projets/${encodeURIComponent(next.slug)}`}
              className="group mt-24 flex items-center justify-between gap-6 rounded-3xl border border-line p-8 transition hover:border-line-strong hover:bg-elev"
            >
              <span>
                <span className="block font-mono text-xs uppercase tracking-widest text-subtle">Projet suivant</span>
                <span className="mt-2 block font-display text-2xl font-semibold tracking-tight md:text-3xl">{next.title}</span>
              </span>
              <ArrowUpRight className="size-8 shrink-0 text-subtle transition group-hover:rotate-45 group-hover:text-accent" />
            </Link>
          )}
        </article>
      </main>
      <Footer profile={content.profile} />
    </>
  );
}
