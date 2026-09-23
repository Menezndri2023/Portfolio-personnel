"use client";

import { useState } from "react";
import { FieldGrid, type FieldDef } from "./fields";
import { SaveBar } from "./ui";

export type FieldSection = { title: string; fields: FieldDef[] };

/** Éditeur d'un objet unique (profil, paramètres), découpé en blocs thématiques. */
export function ObjectEditor<T extends Record<string, unknown>>({
  title,
  description,
  value: initial,
  sections,
  onSave,
}: {
  title: string;
  description: string;
  value: T;
  sections: FieldSection[];
  onSave: (value: T) => Promise<boolean>;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(value) !== JSON.stringify(saved);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </header>
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="rounded-2xl border border-line bg-card p-6">
            <h2 className="mb-5 font-mono text-xs uppercase tracking-widest text-subtle">{s.title}</h2>
            <FieldGrid fields={s.fields} value={value} onChange={setValue} />
          </section>
        ))}
      </div>
      <SaveBar
        dirty={dirty}
        onSave={async () => {
          if (await onSave(value)) setSaved(value);
        }}
        onReset={() => setValue(saved)}
      />
    </div>
  );
}
