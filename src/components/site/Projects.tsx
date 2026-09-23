"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Pin, Search, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectView } from "@/lib/types";
import { cn, formatMonth, languageColors } from "@/lib/utils";
import { GithubIcon } from "../ui/Icon";
import { ProjectCover } from "./ProjectCover";

const ALL = "Tous";

export function Projects({
  showcase,
  archive,
  githubUrl,
  live,
}: {
  showcase: ProjectView[];
  archive: ProjectView[];
  githubUrl: string;
  live: boolean;
}) {
  const [filter, setFilter] = useState(ALL);
  const [showArchive, setShowArchive] = useState(false);
  const [query, setQuery] = useState("");

  // Technologies les plus fréquentes parmi les projets mis en avant.
  const filters = useMemo(() => {
    const count = new Map<string, number>();
    showcase.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [ALL, ...[...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7).map(([t]) => t)];
  }, [showcase]);

  const visible = filter === ALL ? showcase : showcase.filter((p) => p.tags.includes(filter));

  const archiveResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return archive;
    return archive.filter((p) =>
      [p.title, p.slug, p.summary, p.language, ...p.tags].some((v) => v.toLowerCase().includes(q)),
    );
  }, [archive, query]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par technologie">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition",
                filter === f
                  ? "border-fg bg-fg text-bg"
                  : "border-line text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-2 font-mono text-xs text-subtle">
          <span className={cn("size-1.5 rounded-full", live ? "bg-ok" : "bg-subtle")} />
          {live ? "Synchronisé avec GitHub" : "Données GitHub en cache"}
        </p>
      </div>

      <motion.ul layout className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p, i) => {
            const big = p.featured && filter === ALL && i === 0;
            return (
              <motion.li
                layout
                key={p.slug}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                className={cn(big && "md:col-span-2 lg:row-span-2")}
              >
                <ProjectCard project={p} big={big} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      {visible.length === 0 && (
        <p className="py-16 text-center text-muted">Aucun projet pour ce filtre pour l&apos;instant.</p>
      )}

      {archive.length > 0 && (
        <div className="mt-14">
          <button
            type="button"
            onClick={() => setShowArchive((v) => !v)}
            aria-expanded={showArchive}
            className="mx-auto flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium transition hover:border-fg"
          >
            {showArchive ? "Masquer l'archive" : `Explorer les ${archive.length} dépôts publics`}
            <ChevronDown className={cn("size-4 transition", showArchive && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showArchive && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-8 overflow-hidden rounded-3xl border border-line">
                  <div className="flex items-center gap-3 border-b border-line bg-elev px-5">
                    <Search className="size-4 text-subtle" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher un dépôt, un langage…"
                      className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
                      aria-label="Rechercher dans les dépôts"
                    />
                    <span className="shrink-0 font-mono text-xs text-subtle">{archiveResults.length}</span>
                  </div>
                  <ul className="max-h-[460px] divide-y divide-line overflow-y-auto">
                    {archiveResults.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/projets/${encodeURIComponent(p.slug)}`}
                          className="group flex items-center gap-4 px-5 py-3.5 transition hover:bg-elev"
                        >
                          <span className="w-16 shrink-0 font-mono text-xs text-subtle">{p.year}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium group-hover:text-accent">{p.title}</span>
                            <span className="block truncate text-xs text-muted">{p.summary}</span>
                          </span>
                          {p.language && (
                            <span className="hidden items-center gap-1.5 text-xs text-muted sm:flex">
                              <span
                                className="size-2 rounded-full"
                                style={{ background: languageColors[p.language] ?? "var(--subtle)" }}
                              />
                              {p.language}
                            </span>
                          )}
                          <ArrowUpRight className="size-4 shrink-0 text-subtle transition group-hover:text-accent" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm text-muted hover:text-fg"
                  >
                    <GithubIcon className="size-4" /> Voir le profil GitHub complet
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}

function ProjectCard({ project: p, big }: { project: ProjectView; big: boolean }) {
  return (
    <Link
      href={`/projets/${encodeURIComponent(p.slug)}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_24px_60px_-30px_rgb(0_0_0/0.5)]"
    >
      <ProjectCover project={p} large={big} className={cn("border-b border-line", big ? "aspect-[16/10] lg:flex-1" : "aspect-[16/10]")} />
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-3 font-mono text-[11px] text-subtle">
          {p.featured && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-accent">À la une</span>}
          {p.pinned && !p.featured && (
            <span className="inline-flex items-center gap-1">
              <Pin className="size-3" /> Épinglé
            </span>
          )}
          <span>{p.source === "github" ? `Mis à jour ${formatMonth(p.updatedAt)}` : p.year}</span>
          {p.stars > 0 && (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3" /> {p.stars}
            </span>
          )}
        </div>
        <h3 className="flex items-start justify-between gap-3 font-display text-xl font-semibold tracking-tight">
          {p.title}
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
        </h3>
        <p className={cn("mt-2 text-sm leading-relaxed text-muted", !big && "line-clamp-3")}>{p.summary}</p>
        <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
          {p.tags.slice(0, big ? 8 : 4).map((t) => (
            <li key={t} className="rounded-md border border-line px-2 py-0.5 font-mono text-[11px] text-muted">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}
