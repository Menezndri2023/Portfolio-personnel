"use client";

import { Loader2, Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MessagesInbox({
  messages,
  setMessages,
  loading,
  notify,
}: {
  messages: Message[];
  setMessages: (m: Message[]) => void;
  loading: boolean;
  notify: (kind: "success" | "error", text: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const current = messages.find((m) => m.id === selected) ?? null;

  const setRead = async (id: string, read: boolean) => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, read } : m)));
    await fetch("/api/admin/messages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer définitivement ce message ?")) return;
    const res = await fetch(`/api/admin/messages?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return notify("error", "Suppression impossible");
    setMessages(messages.filter((m) => m.id !== id));
    setSelected(null);
    notify("success", "Message supprimé");
  };

  const open = (m: Message) => {
    setSelected(m.id);
    if (!m.read) setRead(m.id, true);
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted">Les demandes envoyées depuis le formulaire de contact du site.</p>
      </header>

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" /> Chargement…
        </p>
      ) : messages.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-sm text-muted">
          Aucun message pour l&apos;instant.
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <ul className="max-h-[70vh] space-y-1 overflow-y-auto">
            {messages.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition",
                    selected === m.id ? "border-line-strong bg-card" : "border-transparent hover:bg-card",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className={cn("truncate text-sm", !m.read && "font-semibold")}>{m.name}</span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      {m.lang === "en" && (
                        <span className="rounded bg-elev px-1 font-mono text-[10px] text-muted" title="Envoyé depuis la version anglaise">
                          EN
                        </span>
                      )}
                      {!m.read && <span className="size-2 rounded-full bg-accent" />}
                    </span>
                  </span>
                  <span className="block truncate text-xs text-muted">{m.subject || m.message}</span>
                  <span className="mt-1 block text-[11px] text-subtle">{new Date(m.createdAt).toLocaleString("fr-FR")}</span>
                </button>
              </li>
            ))}
          </ul>

          {current ? (
            <article className="rounded-2xl border border-line bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">{current.subject || "Sans objet"}</h2>
                  <p className="mt-1 text-sm text-muted">
                    {current.name} · <a className="hover:text-accent" href={`mailto:${current.email}`}>{current.email}</a>
                  </p>
                  <p className="text-xs text-subtle">
                    {new Date(current.createdAt).toLocaleString("fr-FR")}
                    {current.lang === "en" && " · envoyé depuis la version anglaise"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`mailto:${current.email}?subject=${encodeURIComponent(`Re: ${current.subject || "Votre message"}`)}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
                  >
                    <Reply className="size-4" /> Répondre
                  </a>
                  <button
                    type="button"
                    onClick={() => setRead(current.id, !current.read)}
                    className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-fg"
                    title={current.read ? "Marquer comme non lu" : "Marquer comme lu"}
                  >
                    {current.read ? <Mail className="size-4" /> : <MailOpen className="size-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(current.id)}
                    className="grid size-9 place-items-center rounded-full border border-line text-muted hover:text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap leading-relaxed">{current.message}</p>
            </article>
          ) : (
            <div className="hidden place-items-center rounded-2xl border border-dashed border-line text-sm text-muted lg:grid">
              Sélectionnez un message
            </div>
          )}
        </div>
      )}
    </div>
  );
}
