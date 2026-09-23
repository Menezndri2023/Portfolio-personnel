"use client";

import { ChevronDown, ExternalLink, Loader2, Pin, RefreshCw, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildProjects } from "@/lib/github";
import type { GithubRepo, RepoOverride, SiteContent } from "@/lib/types";
import { cn, formatMonth, languageColors } from "@/lib/utils";
import { FieldGrid, Toggle, type FieldDef } from "./fields";
import { SaveBar } from "./ui";

const overrideFields: FieldDef[] = [
  { key: "title", label: "Titre affiché", type: "text", placeholder: "Par défaut : nom du dépôt" },
  { key: "demoUrl", label: "Lien de démo", type: "url", placeholder: "https://… (par défaut : homepage GitHub)" },
  { key: "summary", label: "Résumé (carte)", type: "textarea", placeholder: "Par défaut : description GitHub" },
  { key: "tags", label: "Technologies", type: "tags", placeholder: "Par défaut : langage + topics GitHub" },
  { key: "image", label: "Image de couverture", type: "url", placeholder: "/images/projet.png ou https://…", help: "Laissez vide pour une couverture générée automatiquement." },
  { key: "showReadme", label: "Afficher le README GitHub", type: "toggle", help: "Les README générés par les outils (Create React App, Vite…) sont masqués automatiquement." },
  { key: "description", label: "Description détaillée (Markdown)", type: "markdown", placeholder: "### Ce que j'ai construit\n- …" },
];

type RepoState = { repos: GithubRepo[]; live: boolean; syncedAt: string | null };

async function fetchRepoState(): Promise<RepoState | null> {
  const res = await fetch("/api/admin/github");
  return res.ok ? ((await res.json()) as RepoState) : null;
}

/** Retire les champs vides pour garder les valeurs GitHub par défaut. */
function clean(o: RepoOverride): RepoOverride {
  const out: RepoOverride = {};
  for (const [k, v] of Object.entries(o) as [keyof RepoOverride, unknown][]) {
    if (v === "" || v === undefined || (Array.isArray(v) && v.length === 0)) continue;
    if (v === false && k !== "showReadme") continue;
    (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

export function GithubManager({
  content,
  onSave,
  notify,
}: {
  content: SiteContent;
  onSave: (overrides: Record<string, RepoOverride>) => Promise<boolean>;
  notify: (kind: "success" | "error", text: string) => void;
}) {
  const [repos, setRepos] = useState<GithubRepo[]>(content.githubSnapshot?.repos ?? []);
  const [live, setLive] = useState(false);
  const [syncedAt, setSyncedAt] = useState(content.githubSnapshot?.syncedAt ?? null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [overrides, setOverrides] = useState(content.repoOverrides);
  const [saved, setSaved] = useState(content.repoOverrides);
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "shown" | "hidden">("all");

  const apply = useCallback((data: RepoState | null) => {
    if (data) {
      setRepos(data.repos);
      setLive(data.live);
      setSyncedAt(data.syncedAt);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRepoState().then(apply);
  }, [apply]);

  const shown = useMemo(() => {
    const { showcase } = buildProjects({ ...content, repoOverrides: overrides, projects: [] }, repos);
    return new Set(showcase.map((p) => p.slug));
  }, [content, overrides, repos]);

  const patch = (name: string, change: Partial<RepoOverride>) =>
    setOverrides((o) => ({ ...o, [name]: clean({ ...o[name], ...change }) }));

  const sync = async () => {
    setSyncing(true);
    const res = await fetch("/api/admin/github", { method: "POST" });
    const data = (await res.json().catch(() => ({}))) as { error?: string; count?: number };
    setSyncing(false);
    if (!res.ok) return notify("error", data.error ?? "Échec de la synchronisation");
    notify("success", `${data.count} dépôts synchronisés — le site est à jour.`);
    setLoading(true);
    apply(await fetchRepoState());
  };

  const dirty = JSON.stringify(overrides) !== JSON.stringify(saved);
  const list = repos.filter((r) =>
    filter === "all" ? true : filter === "shown" ? shown.has(r.name) : overrides[r.name]?.hidden,
  );

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Projets GitHub</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Les {content.settings.githubLimit} dépôts les plus récents s&apos;affichent automatiquement, plus ceux que vous
            épinglez. Masquez ce qui ne doit pas apparaître et enrichissez chaque projet.
          </p>
        </div>
        <button
          type="button"
          onClick={sync}
          disabled={syncing}
          className="inline-flex items-center gap-2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition hover:bg-accent hover:text-accent-fg disabled:opacity-60"
        >
          <RefreshCw className={cn("size-4", syncing && "animate-spin")} /> Synchroniser maintenant
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <div className="flex gap-1 rounded-full border border-line p-1">
          {(
            [
              ["all", `Tous (${repos.length})`],
              ["shown", `Affichés (${shown.size})`],
              ["hidden", "Masqués"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cn("rounded-full px-3 py-1", filter === k ? "bg-fg text-bg" : "hover:text-fg")}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-2">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <span className={cn("size-1.5 rounded-full", live ? "bg-ok" : "bg-subtle")} />}
          {live ? "Données en direct de GitHub" : "Données en cache"}
          {syncedAt && ` · dernier instantané ${new Date(syncedAt).toLocaleString("fr-FR")}`}
        </p>
      </div>

      <ul className="space-y-2">
        {list.map((r) => {
          const o = overrides[r.name] ?? {};
          const expanded = open === r.name;
          const isShown = shown.has(r.name);
          return (
            <li key={r.name} className={cn("rounded-2xl border bg-card", expanded ? "border-line-strong" : "border-line", o.hidden && "opacity-60")}>
              <div className="flex flex-wrap items-center gap-3 p-3 pl-4">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : r.name)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-expanded={expanded}
                >
                  <ChevronDown className={cn("size-4 shrink-0 text-subtle transition", expanded && "rotate-180")} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="truncate">{o.title || r.name}</span>
                      {isShown && <span className="rounded-full bg-ok/15 px-2 py-0.5 text-[10px] text-ok">Affiché</span>}
                      {r.fork && <span className="text-[10px] text-subtle">fork</span>}
                    </span>
                    <span className="flex items-center gap-3 text-xs text-muted">
                      <span>{r.name}</span>
                      {r.language && (
                        <span className="inline-flex items-center gap-1">
                          <span className="size-2 rounded-full" style={{ background: languageColors[r.language] ?? "var(--subtle)" }} />
                          {r.language}
                        </span>
                      )}
                      <span>{formatMonth(r.pushedAt)}</span>
                      {r.size === 0 && <span className="text-accent">dépôt vide</span>}
                    </span>
                  </span>
                </button>

                <div className="flex items-center gap-4 text-xs text-muted">
                  <label className="flex items-center gap-2" title="Toujours afficher ce projet">
                    <Pin className="size-3.5" /> <Toggle checked={Boolean(o.pinned)} onChange={(v) => patch(r.name, { pinned: v })} />
                  </label>
                  <label className="flex items-center gap-2" title="Mettre à la une">
                    <Star className="size-3.5" /> <Toggle checked={Boolean(o.featured)} onChange={(v) => patch(r.name, { featured: v })} />
                  </label>
                  <label className="flex items-center gap-2" title="Visible sur le site">
                    Visible <Toggle checked={!o.hidden} onChange={(v) => patch(r.name, { hidden: !v })} />
                  </label>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-subtle hover:text-fg" aria-label="Ouvrir sur GitHub">
                    <ExternalLink className="size-4" />
                  </a>
                </div>
              </div>
              {expanded && (
                <div className="border-t border-line p-5">
                  {r.description && <p className="mb-4 text-xs text-muted">Description GitHub : « {r.description} »</p>}
                  <FieldGrid
                    fields={overrideFields}
                    value={{ showReadme: true, ...o } as Record<string, unknown>}
                    onChange={(next) => setOverrides((all) => ({ ...all, [r.name]: clean(next as RepoOverride) }))}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <SaveBar
        dirty={dirty}
        onSave={async () => {
          if (await onSave(overrides)) setSaved(overrides);
        }}
        onReset={() => setOverrides(saved)}
      />
    </div>
  );
}
