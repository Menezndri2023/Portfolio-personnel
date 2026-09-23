"use client";

import { ArrowDown, ArrowUp, ChevronDown, Copy, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn, uid } from "@/lib/utils";
import { FieldGrid, type FieldDef } from "./fields";
import { SaveBar } from "./ui";

type Item = { id: string } & Record<string, unknown>;

/**
 * Éditeur générique de liste : ajout, suppression, duplication, réorganisation.
 * Utilisé pour les services, compétences, expériences, formations et projets manuels.
 */
export function CollectionEditor<T extends Item>({
  title,
  description,
  items: initial,
  fields,
  itemTitle,
  itemSubtitle,
  isHidden,
  createItem,
  addLabel,
  onSave,
}: {
  title: string;
  description: string;
  items: T[];
  fields: FieldDef[];
  itemTitle: (item: T) => string;
  itemSubtitle?: (item: T) => string;
  isHidden?: (item: T) => boolean;
  createItem: () => T;
  addLabel: string;
  onSave: (items: T[]) => Promise<boolean>;
}) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(items) !== JSON.stringify(saved);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const add = () => {
    const item = createItem();
    setItems([item, ...items]);
    setOpen(item.id);
  };

  const save = async () => {
    if (await onSave(items)) setSaved(items);
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition hover:bg-accent hover:text-accent-fg"
        >
          <Plus className="size-4" /> {addLabel}
        </button>
      </header>

      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-sm text-muted">
          Aucun élément pour l&apos;instant.
        </p>
      )}

      <ul className="space-y-3">
        {items.map((item, i) => {
          const expanded = open === item.id;
          return (
            <li key={item.id} className={cn("rounded-2xl border bg-card transition", expanded ? "border-line-strong" : "border-line")}>
              <div className="flex items-center gap-2 p-3 pl-5">
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : item.id)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  aria-expanded={expanded}
                >
                  <ChevronDown className={cn("size-4 shrink-0 text-subtle transition", expanded && "rotate-180")} />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 truncate font-medium">
                      {itemTitle(item) || <span className="text-subtle">Sans titre</span>}
                      {isHidden?.(item) && <EyeOff className="size-3.5 text-subtle" aria-label="Masqué" />}
                    </span>
                    {itemSubtitle && <span className="block truncate text-xs text-muted">{itemSubtitle(item)}</span>}
                  </span>
                </button>
                <IconButton label="Monter" onClick={() => move(i, -1)} disabled={i === 0}>
                  <ArrowUp className="size-4" />
                </IconButton>
                <IconButton label="Descendre" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                  <ArrowDown className="size-4" />
                </IconButton>
                <IconButton
                  label="Dupliquer"
                  onClick={() => {
                    const copy = { ...structuredClone(item), id: uid(item.id.split("-")[0] || "id") };
                    setItems([...items.slice(0, i + 1), copy, ...items.slice(i + 1)]);
                  }}
                >
                  <Copy className="size-4" />
                </IconButton>
                <IconButton
                  label="Supprimer"
                  danger
                  onClick={() => {
                    if (confirm(`Supprimer « ${itemTitle(item) || "cet élément"} » ?`)) {
                      setItems(items.filter((x) => x.id !== item.id));
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
              {expanded && (
                <div className="border-t border-line p-5">
                  <FieldGrid
                    fields={fields}
                    value={item}
                    onChange={(next) => setItems(items.map((x) => (x.id === item.id ? next : x)))}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <SaveBar dirty={dirty} onSave={save} onReset={() => setItems(saved)} />
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-8 place-items-center rounded-lg text-subtle transition hover:bg-elev disabled:opacity-30",
        danger ? "hover:text-red-500" : "hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
