"use client";

import { ChevronDown, Languages, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { prettify, visibleRepos } from "@/lib/github";
import { compact, isFilled } from "@/lib/translations";
import type { GithubRepo, SiteContent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FieldGrid, getPath, type FieldDef } from "./fields";
import type { FieldSection } from "./ObjectEditor";
import { SaveBar } from "./ui";

/**
 * Édition de la version anglaise du contenu.
 * On reprend les champs de l'éditeur français (seulement les champs textuels) et
 * chacun affiche le texte français de référence. Un champ laissé vide affiche le français sur /en.
 */

type AnyObj = Record<string, unknown>;
type Overlay = AnyObj;

const EMPTY_HINT = "Vide = texte français";

function referenceText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "object" && v ? Object.values(v).filter(Boolean).join(" — ") : String(v)))
      .join(" · ");
  }
  return "";
}

/** Champs de l'éditeur français limités aux clés traduisibles, avec le français en référence. */
function translatedFields(fields: FieldDef[], keys: readonly string[], source: AnyObj): FieldDef[] {
  return fields
    .filter((f) => keys.includes(f.key))
    .map((f) => {
      const value = getPath(source, f.key);
      return {
        ...f,
        full: true,
        help: undefined,
        placeholder: f.type === "lines" || f.type === "tags" ? f.placeholder : EMPTY_HINT,
        reference: { text: referenceText(value), value },
      };
    });
}

/** Nombre de champs à traduire (non vides en français) et nombre de champs traduits. */
function progress(keys: readonly string[], source: AnyObj, overlay: Overlay | undefined) {
  const todo = keys.filter((k) => isFilled(source[k]));
  return { total: todo.length, done: todo.filter((k) => isFilled(overlay?.[k])).length };
}

function Banner() {
  return (
    <p className="mb-6 flex items-start gap-3 rounded-2xl bg-accent-soft p-4 text-sm text-fg">
      <Languages className="mt-0.5 size-4 shrink-0 text-accent" />
      <span>
        Vous modifiez la <strong>version anglaise</strong> (visible sur <code>/en</code>). Seuls les textes se traduisent :
        liens, images et options restent ceux du français. Un champ vide affiche le texte français.
      </span>
    </p>
  );
}

function Status({ done, total }: { done: number; total: number }) {
  const complete = total > 0 && done === total;
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
        complete ? "bg-ok/15 text-ok" : done ? "bg-accent-soft text-accent" : "bg-elev text-subtle",
      )}
    >
      {complete ? "Traduit" : `${done} / ${total}`}
    </span>
  );
}

/* ------------------------------------------------------------------ Objet (profil, paramètres) */

export function TranslateObject({
  title,
  description,
  sections,
  keys,
  source,
  value: initial,
  onSave,
}: {
  title: string;
  description: string;
  sections: FieldSection[];
  keys: readonly string[];
  source: AnyObj;
  value: Overlay;
  onSave: (value: Overlay) => Promise<boolean>;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(compact(value)) !== JSON.stringify(compact(saved));
  const { done, total } = progress(keys, source, value);

  const translated = sections
    .map((s) => ({ ...s, fields: translatedFields(s.fields, keys, source) }))
    .filter((s) => s.fields.length > 0);

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title} · English</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <Status done={done} total={total} />
      </header>
      <Banner />
      <div className="space-y-6">
        {translated.map((s) => (
          <section key={s.title} className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-subtle">{s.title}</h2>
            <FieldGrid fields={s.fields} value={value} onChange={setValue} />
          </section>
        ))}
      </div>
      <SaveBar
        dirty={dirty}
        onSave={async () => {
          const clean = compact(value);
          if (await onSave(clean)) {
            setValue(clean);
            setSaved(clean);
          }
        }}
        onReset={() => setValue(saved)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ Liste (services, expériences…) */

export function TranslateCollection<I extends { id: string }>({
  title,
  description,
  items,
  fields,
  keys,
  value: initial,
  itemTitle,
  emptyText = "Aucun élément à traduire. Ajoutez-les d'abord en français.",
  onSave,
}: {
  title: string;
  description: string;
  items: I[];
  fields: FieldDef[];
  keys: readonly string[];
  value: Record<string, Overlay>;
  itemTitle: (item: I) => string;
  emptyText?: string;
  onSave: (value: Record<string, Overlay>) => Promise<boolean>;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);

  /** Traductions non vides des éléments qui existent encore en français. */
  const clean = (v: Record<string, Overlay>) =>
    Object.fromEntries(
      items
        .map((item) => [item.id, compact(v[item.id] ?? {})] as const)
        .filter(([, o]) => Object.keys(o).length > 0),
    );
  const dirty = JSON.stringify(clean(value)) !== JSON.stringify(clean(saved));

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title} · English</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </header>
      <Banner />

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-sm text-muted">{emptyText}</p>
      )}

      <ul className="space-y-3">
        {items.map((item) => {
          const source = item as unknown as AnyObj;
          const expanded = open === item.id;
          const { done, total } = progress(keys, source, value[item.id]);
          const translatedTitle = value[item.id]?.[keys[0]];
          return (
            <li key={item.id} className={cn("rounded-2xl border bg-card transition", expanded ? "border-line-strong" : "border-line")}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : item.id)}
                className="flex w-full items-center gap-3 p-4 pl-5 text-left"
                aria-expanded={expanded}
              >
                <ChevronDown className={cn("size-4 shrink-0 text-subtle transition", expanded && "rotate-180")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{itemTitle(item) || <span className="text-subtle">Sans titre</span>}</span>
                  {typeof translatedTitle === "string" && translatedTitle && (
                    <span className="block truncate text-xs text-muted">EN : {translatedTitle}</span>
                  )}
                </span>
                <Status done={done} total={total} />
              </button>
              {expanded && (
                <div className="border-t border-line p-5">
                  <FieldGrid
                    fields={translatedFields(fields, keys, source)}
                    value={value[item.id] ?? {}}
                    onChange={(next) => setValue((v) => ({ ...v, [item.id]: next }))}
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
          const next = clean(value);
          if (await onSave(next)) {
            setValue(next);
            setSaved(next);
          }
        }}
        onReset={() => setValue(saved)}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ Projets GitHub */

type RepoItem = { id: string; title: string; summary: string; description: string };

/** Projets GitHub visibles sur le site, avec leurs textes français (surcharges ou valeurs GitHub). */
export function TranslateGithub({
  content,
  fields,
  keys,
  value,
  onSave,
}: {
  content: SiteContent;
  fields: FieldDef[];
  keys: readonly string[];
  value: Record<string, Overlay>;
  onSave: (value: Record<string, Overlay>) => Promise<boolean>;
}) {
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/github")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { repos?: GithubRepo[] } | null) => setRepos(d?.repos ?? content.githubSnapshot?.repos ?? []));
  }, [content.githubSnapshot]);

  if (!repos) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" /> Chargement des dépôts…
      </p>
    );
  }

  const items: RepoItem[] = visibleRepos(content, repos).map((r) => {
    const o = content.repoOverrides[r.name] ?? {};
    return { id: r.name, title: o.title || prettify(r.name), summary: o.summary || r.description, description: o.description || "" };
  });

  return (
    <TranslateCollection<RepoItem>
      title="Projets GitHub"
      description="Titre, résumé et description des dépôts affichés sur le site. Le README GitHub reste dans sa langue d'origine."
      items={items}
      fields={fields}
      keys={keys}
      value={value}
      itemTitle={(r) => r.title}
      emptyText="Aucun dépôt visible pour l'instant."
      onSave={onSave}
    />
  );
}
