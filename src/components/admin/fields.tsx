"use client";

import { CornerDownLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon, iconNames } from "../ui/Icon";

/** Description déclarative d'un champ éditable. `key` accepte un chemin ("socials.github"). */
export type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "markdown" | "tags" | "lines" | "toggle" | "url" | "number" | "icon" | "pairs";
  placeholder?: string;
  help?: string;
  /** Occupe toute la largeur de la grille. */
  full?: boolean;
  /** Pour `pairs` : libellés des deux colonnes. */
  pairLabels?: [string, string];
  /** Traduction : texte français affiché au-dessus du champ, avec sa valeur pour le recopier. */
  reference?: { text: string; value: unknown };
};

type AnyObj = Record<string, unknown>;

export function getPath(obj: AnyObj, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o as AnyObj | undefined)?.[k], obj);
}

export function setPath<T extends AnyObj>(obj: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split(".");
  if (!rest.length) return { ...obj, [head]: value };
  return { ...obj, [head]: setPath((obj[head] as AnyObj) ?? {}, rest.join("."), value) };
}

export function FieldGrid<T extends AnyObj>({
  fields,
  value,
  onChange,
}: {
  fields: FieldDef[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {fields.map((f) => (
        <Field
          key={f.key}
          def={f}
          value={getPath(value, f.key)}
          onChange={(v) => onChange(setPath(value, f.key, v))}
        />
      ))}
    </div>
  );
}

export function Field({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const full = def.full || ["textarea", "markdown", "tags", "lines", "pairs"].includes(def.type);
  const id = `f-${def.key.replace(/\W/g, "-")}`;

  if (def.type === "toggle") {
    return (
      <div className={cn("flex items-start justify-between gap-4 rounded-xl border border-line p-4", full && "md:col-span-2")}>
        <div>
          <label htmlFor={id} className="text-sm font-medium">
            {def.label}
          </label>
          {def.help && <p className="mt-0.5 text-xs text-muted">{def.help}</p>}
        </div>
        <Toggle id={id} checked={Boolean(value)} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className={cn(full && "md:col-span-2")}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {def.label}
      </label>
      {def.reference && <Reference reference={def.reference} onCopy={onChange} />}
      {renderInput(def, id, value, onChange)}
      {def.help && <p className="mt-1.5 text-xs text-muted">{def.help}</p>}
    </div>
  );
}

function renderInput(def: FieldDef, id: string, value: unknown, onChange: (v: unknown) => void) {
  switch (def.type) {
    case "textarea":
    case "markdown":
      return (
        <textarea
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={def.type === "markdown" ? 12 : 4}
          placeholder={def.placeholder}
          className={cn("field resize-y", def.type === "markdown" && "font-mono text-[13px] leading-relaxed")}
        />
      );
    case "lines":
      return (
        <textarea
          id={id}
          value={((value as string[]) ?? []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          onBlur={(e) => onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
          rows={Math.max(3, ((value as string[]) ?? []).length + 1)}
          placeholder={def.placeholder ?? "Un élément par ligne"}
          className="field resize-y"
        />
      );
    case "tags":
      return <TagsInput id={id} value={(value as string[]) ?? []} onChange={onChange} placeholder={def.placeholder} />;
    case "number":
      return (
        <input
          id={id}
          type="number"
          value={(value as number) ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="field"
        />
      );
    case "icon":
      return (
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={id}>
          {iconNames.map((name) => (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={value === name}
              title={name}
              onClick={() => onChange(name)}
              className={cn(
                "grid size-10 place-items-center rounded-xl border transition",
                value === name ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:border-line-strong",
              )}
            >
              <Icon name={name} className="size-4" />
            </button>
          ))}
        </div>
      );
    case "pairs":
      return <PairsInput value={(value as { name: string; level: string }[]) ?? []} onChange={onChange} labels={def.pairLabels} />;
    default:
      return (
        <input
          id={id}
          type="text"
          inputMode={def.type === "url" ? "url" : undefined}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={def.placeholder}
          className="field"
        />
      );
  }
}

function Reference({ reference, onCopy }: { reference: NonNullable<FieldDef["reference"]>; onCopy: (v: unknown) => void }) {
  if (!reference.text) return null;
  return (
    <div className="mb-2 flex items-start gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2 text-xs text-muted">
      <span className="font-mono text-[10px] font-semibold text-subtle">FR</span>
      <p className="max-h-32 min-w-0 flex-1 overflow-y-auto whitespace-pre-line">{reference.text}</p>
      <button
        type="button"
        onClick={() => onCopy(structuredClone(reference.value))}
        title="Recopier le texte français dans le champ, pour le modifier"
        className="inline-flex shrink-0 items-center gap-1 text-subtle hover:text-fg"
      >
        <CornerDownLeft className="size-3.5" /> Recopier
      </button>
    </div>
  );
}

export function Toggle({ id, checked, onChange }: { id?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-accent" : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

function TagsInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...value, ...parts.filter((p) => !value.includes(p))]);
    setDraft("");
  };
  return (
    <div className="field flex flex-wrap items-center gap-1.5 !p-2">
      {value.map((t, i) => (
        <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-lg bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
          {t}
          <button type="button" aria-label={`Retirer ${t}`} onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder ?? "Entrée pour ajouter"}
        className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-subtle"
      />
    </div>
  );
}

function PairsInput({
  value,
  onChange,
  labels = ["Nom", "Niveau"],
}: {
  value: { name: string; level: string }[];
  onChange: (v: { name: string; level: string }[]) => void;
  labels?: [string, string];
}) {
  const update = (i: number, key: "name" | "level", v: string) =>
    onChange(value.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  return (
    <div className="space-y-2">
      {value.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input value={row.name} onChange={(e) => update(i, "name", e.target.value)} placeholder={labels[0]} className="field" aria-label={labels[0]} />
          <input value={row.level} onChange={(e) => update(i, "level", e.target.value)} placeholder={labels[1]} className="field" aria-label={labels[1]} />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, j) => j !== i))}
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-line text-muted hover:text-accent"
            aria-label="Supprimer la ligne"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { name: "", level: "" }])}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
      >
        <Plus className="size-4" /> Ajouter
      </button>
    </div>
  );
}
