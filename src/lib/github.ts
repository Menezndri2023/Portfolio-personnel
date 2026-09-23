import type { GithubRepo, ProjectView, RepoOverride, SiteContent } from "./types";

/**
 * Synchronisation GitHub.
 *
 * Les dépôts publics sont relus depuis l'API GitHub au plus une fois par heure (ISR).
 * Un nouveau dépôt poussé sur GitHub apparaît donc automatiquement sur le site ;
 * le bouton « Synchroniser » de /admin force la mise à jour immédiate.
 *
 * GITHUB_TOKEN (optionnel) relève la limite de l'API de 60 à 5 000 requêtes / heure.
 */

export const GITHUB_REVALIDATE = 3600;
export const GITHUB_TAG = "github";

const API = "https://api.github.com";

type RawRepo = {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  size: number;
  pushed_at: string;
  created_at: string;
};

function headers(accept = "application/vnd.github+json"): HeadersInit {
  const h: Record<string, string> = { Accept: accept, "X-GitHub-Api-Version": "2022-11-28" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

function cacheOptions(fresh: boolean): RequestInit {
  return fresh
    ? { cache: "no-store" }
    : { next: { revalidate: GITHUB_REVALIDATE, tags: [GITHUB_TAG] } };
}

function mapRepo(r: RawRepo): GithubRepo {
  return {
    name: r.name,
    description: r.description ?? "",
    url: r.html_url,
    homepage: r.homepage ?? "",
    language: r.language ?? "",
    topics: r.topics ?? [],
    stars: r.stargazers_count,
    forks: r.forks_count,
    fork: r.fork,
    archived: r.archived,
    size: r.size,
    pushedAt: r.pushed_at,
    createdAt: r.created_at,
  };
}

/** Tous les dépôts publics, du plus récemment poussé au plus ancien. `null` si l'API échoue. */
export async function fetchRepos(username: string, { fresh = false } = {}): Promise<GithubRepo[] | null> {
  try {
    const res = await fetch(
      `${API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&type=owner`,
      { headers: headers(), ...cacheOptions(fresh) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as RawRepo[];
    return data.map(mapRepo).sort((a, b) => b.pushedAt.localeCompare(a.pushedAt));
  } catch {
    return null;
  }
}

/** Répartition des langages d'un dépôt, en pourcentages. */
export async function fetchLanguages(username: string, repo: string): Promise<{ name: string; percent: number }[]> {
  try {
    const res = await fetch(`${API}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/languages`, {
      headers: headers(),
      ...cacheOptions(false),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, number>;
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    if (!total) return [];
    return Object.entries(data)
      .map(([name, bytes]) => ({ name, percent: Math.round((bytes / total) * 1000) / 10 }))
      .filter((l) => l.percent >= 0.5)
      .sort((a, b) => b.percent - a.percent);
  } catch {
    return [];
  }
}

export async function fetchReadme(username: string, repo: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/readme`, {
      headers: headers("application/vnd.github.raw"),
      ...cacheOptions(false),
    });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

/** README générés par les outils de scaffolding : sans intérêt pour un visiteur. */
export function isBoilerplateReadme(md: string): boolean {
  const head = md.slice(0, 600);
  return (
    head.includes("bootstrapped with [Create React App]") ||
    /^#\s*React \+ Vite/m.test(head) ||
    head.includes("This is a [Next.js](https://nextjs.org) project bootstrapped")
  );
}

/** Dépôts à jour, avec repli sur le dernier instantané enregistré si GitHub ne répond pas. */
export async function getRepos(content: SiteContent): Promise<{ repos: GithubRepo[]; live: boolean }> {
  const live = await fetchRepos(content.settings.githubUsername);
  if (live) return { repos: live, live: true };
  return { repos: content.githubSnapshot?.repos ?? [], live: false };
}

/* ------------------------------------------------------------------ Vues */

export function repoToView(repo: GithubRepo, o: RepoOverride = {}): ProjectView {
  const tags = o.tags?.length ? o.tags : [repo.language, ...repo.topics].filter(Boolean);
  return {
    slug: repo.name,
    source: "github",
    title: o.title || prettify(repo.name),
    summary: o.summary || repo.description || "Projet publié sur GitHub.",
    description: o.description || "",
    tags,
    image: o.image || "",
    repoUrl: repo.url,
    demoUrl: o.demoUrl || repo.homepage || "",
    featured: Boolean(o.featured),
    pinned: Boolean(o.pinned),
    language: repo.language,
    stars: repo.stars,
    updatedAt: repo.pushedAt,
    year: repo.pushedAt.slice(0, 4),
    showReadme: o.showReadme ?? true,
  };
}

function manualToView(p: SiteContent["projects"][number]): ProjectView {
  return {
    slug: `p-${p.id}`,
    source: "manual",
    title: p.title,
    summary: p.summary,
    description: p.description,
    tags: p.tags,
    image: p.image,
    repoUrl: p.repoUrl,
    demoUrl: p.demoUrl,
    featured: p.featured,
    pinned: false,
    language: p.tags[0] ?? "",
    stars: 0,
    updatedAt: p.year ? `${p.year}-12-31T00:00:00Z` : "",
    year: p.year,
    showReadme: false,
  };
}

export function prettify(name: string) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function visibleRepos(content: SiteContent, repos: GithubRepo[]) {
  const o = content.repoOverrides;
  return repos.filter((r) => !o[r.name]?.hidden && !(content.settings.excludeForks && r.fork));
}

/**
 * Projets mis en avant : les N dépôts les plus récents + les dépôts épinglés
 * + les projets saisis à la main. `archive` contient tous les dépôts visibles.
 */
export function buildProjects(content: SiteContent, repos: GithubRepo[]) {
  const o = content.repoOverrides;
  const visible = visibleRepos(content, repos);
  const recent = visible.slice(0, Math.max(0, content.settings.githubLimit));
  const pinned = visible.filter((r) => o[r.name]?.pinned && !recent.includes(r));

  const showcase = [
    ...[...recent, ...pinned].map((r) => repoToView(r, o[r.name])),
    ...content.projects.filter((p) => !p.hidden).map(manualToView),
  ].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const archive = visible.map((r) => repoToView(r, o[r.name]));
  return { showcase, archive };
}

export function findProject(content: SiteContent, repos: GithubRepo[], slug: string): ProjectView | null {
  if (slug.startsWith("p-")) {
    const p = content.projects.find((x) => `p-${x.id}` === slug && !x.hidden);
    return p ? manualToView(p) : null;
  }
  const repo = visibleRepos(content, repos).find((r) => r.name === slug);
  return repo ? repoToView(repo, content.repoOverrides[repo.name]) : null;
}
