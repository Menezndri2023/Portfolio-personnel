"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Check, Copy, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import { GithubIcon, LinkedinIcon } from "../ui/Icon";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

export function ContactPanel({ locale, profile }: { locale: Locale; profile: Profile }) {
  const t = getDictionary(locale).contact;
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, lang: locale }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || t.failed);
      form.reset();
      setStatus({ kind: "sent" });
    } catch (err) {
      setStatus({ kind: "error", message: (err as Error).message });
    }
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="flex flex-col">
        <p className="text-lg leading-relaxed text-muted">{t.intro}</p>

        <ul className="mt-10 space-y-3">
          {profile.email && (
            <li>
              <button
                type="button"
                onClick={copyEmail}
                className="group flex w-full items-center gap-4 rounded-2xl border border-line bg-card p-4 text-left transition hover:border-line-strong"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Mail className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-subtle">{t.email}</span>
                  <span className="block truncate text-sm font-medium">{profile.email}</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-muted">
                  {copied ? <Check className="size-4 text-ok" /> : <Copy className="size-4" />}
                  {copied ? t.copied : t.copy}
                </span>
              </button>
            </li>
          )}
          {profile.showPhone && profile.phone && (
            <li>
              <a
                href={`tel:${profile.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4 transition hover:border-line-strong"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
                  <Phone className="size-4" />
                </span>
                <span>
                  <span className="block text-xs text-subtle">{t.phone}</span>
                  <span className="block text-sm font-medium">{profile.phone}</span>
                </span>
              </a>
            </li>
          )}
          <li className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
              <MapPin className="size-4" />
            </span>
            <span>
              <span className="block text-xs text-subtle">{t.location}</span>
              <span className="block text-sm font-medium">
                {profile.location} · {t.remote}
              </span>
            </span>
          </li>
        </ul>

        <div className="mt-6 flex gap-3">
          {profile.socials.linkedin && (
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-fg hover:text-fg"
            >
              <LinkedinIcon className="size-4" /> LinkedIn <ArrowUpRight className="size-3.5" />
            </a>
          )}
          {profile.socials.github && (
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-fg hover:text-fg"
            >
              <GithubIcon className="size-4" /> GitHub <ArrowUpRight className="size-3.5" />
            </a>
          )}
        </div>
      </div>

      <form onSubmit={onSubmit} className="relative rounded-3xl border border-line bg-card p-6 md:p-8" noValidate={false}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.name}</span>
            <input name="name" required minLength={2} maxLength={100} autoComplete="name" className="field" placeholder={t.namePlaceholder} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">{t.email}</span>
            <input name="email" type="email" required maxLength={200} autoComplete="email" className="field" placeholder={t.emailPlaceholder} />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">{t.subject}</span>
          <input name="subject" maxLength={150} className="field" placeholder={t.subjectPlaceholder} />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium">{t.message}</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={5000}
            rows={6}
            className="field resize-y"
            placeholder={t.messagePlaceholder}
          />
        </label>
        {/* Champ piège anti-spam, invisible pour les humains */}
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <AnimatePresence mode="wait">
            {status.kind === "sent" && (
              <motion.p key="ok" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-sm text-ok" role="status">
                <Check className="size-4" /> {t.sent}
              </motion.p>
            )}
            {status.kind === "error" && (
              <motion.p key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-accent" role="alert">
                {status.message}
              </motion.p>
            )}
          </AnimatePresence>
          <button
            type="submit"
            disabled={status.kind === "sending"}
            className="ml-auto inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {status.kind === "sending" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {t.send}
          </button>
        </div>
      </form>
    </div>
  );
}
