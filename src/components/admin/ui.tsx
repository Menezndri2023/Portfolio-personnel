"use client";

import { AnimatePresence, motion } from "motion/react";
import { Loader2, RotateCcw, Save } from "lucide-react";
import { useState } from "react";

/** Barre d'enregistrement flottante, visible dès qu'il y a des modifications. */
export function SaveBar({ dirty, onSave, onReset }: { dirty: boolean; onSave: () => Promise<void>; onReset: () => void }) {
  const [saving, setSaving] = useState(false);
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="sticky bottom-4 z-20 mt-8 flex items-center justify-between gap-4 rounded-2xl border border-line-strong bg-elev/95 p-3 pl-5 shadow-2xl backdrop-blur"
        >
          <p className="text-sm text-muted">Modifications non enregistrées</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted hover:text-fg"
            >
              <RotateCcw className="size-4" /> Annuler
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onSave();
                setSaving(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-fg disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Enregistrer
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type Toast = { id: number; kind: "success" | "error"; text: string };

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`pointer-events-auto max-w-sm rounded-xl border px-4 py-3 text-sm shadow-xl ${
              t.kind === "success" ? "border-ok/40 bg-elev text-fg" : "border-red-500/40 bg-elev text-red-500"
            }`}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
