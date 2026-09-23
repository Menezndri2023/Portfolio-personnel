"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

export type TerminalCommit = { repo: string; when: string };

type Line = { prompt?: string; content: ReactNode };

/**
 * Terminal décoratif : les lignes s'affichent une à une.
 * La dernière commande liste les dépôts GitHub réellement mis à jour récemment.
 */
export function HeroTerminal({
  recentLabel,
  name,
  title,
  commits,
  stack,
}: {
  /** Libellé lu par les lecteurs d'écran (le terminal lui-même est décoratif). */
  recentLabel: string;
  name: string;
  title: string;
  commits: TerminalCommit[];
  stack: Record<string, string[]>;
}) {
  const reduce = useReducedMotion();

  const lines: Line[] = [
    { prompt: "whoami", content: null },
    { content: <span className="text-fg">{name.toLowerCase()} — {title.toLowerCase()}</span> },
    { prompt: "cat stack.json", content: null },
    {
      content: (
        <span>
          {"{"}
          {Object.entries(stack).map(([k, v], i, arr) => (
            <span key={k} className="block pl-4">
              <span className="text-accent">&quot;{k}&quot;</span>: [
              {v.map((s, j) => (
                <span key={s}>
                  <span className="text-ok">&quot;{s}&quot;</span>
                  {j < v.length - 1 ? ", " : ""}
                </span>
              ))}
              ]{i < arr.length - 1 ? "," : ""}
            </span>
          ))}
          {"}"}
        </span>
      ),
    },
    { prompt: "git log --recent", content: null },
    ...commits.map((c) => ({
      content: (
        <span className="flex justify-between gap-4">
          <span className="min-w-0 truncate">
            <span className="text-accent">●</span> <span className="text-fg">{c.repo}</span>
          </span>
          <span className="shrink-0 text-subtle">{c.when}</span>
        </span>
      ),
    })),
  ];

  const [shown, setShown] = useState(reduce ? lines.length : 0);

  useEffect(() => {
    if (reduce || shown >= lines.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 500 : 260);
    return () => clearTimeout(t);
  }, [shown, lines.length, reduce]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: 1.5 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative"
    >
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/10 blur-3xl" />
      <div className="overflow-hidden rounded-2xl border border-line-strong bg-elev/90 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-subtle">~/portfolio — zsh</span>
        </div>
        <div className="min-h-[340px] space-y-1.5 p-5 font-mono text-[12.5px] leading-relaxed text-muted" aria-hidden>
          {lines.slice(0, shown).map((l, i) =>
            l.prompt ? (
              <p key={i} className={i > 0 ? "pt-2" : ""}>
                <span className="text-ok">➜</span> <span className="text-accent">~</span>{" "}
                <span className="text-fg">{l.prompt}</span>
              </p>
            ) : (
              <div key={i}>{l.content}</div>
            ),
          )}
          <p className={shown > 0 ? "pt-2" : ""}>
            <span className="text-ok">➜</span> <span className="text-accent">~</span>{" "}
            <span className="inline-block h-4 w-2 translate-y-0.5 bg-fg animate-blink" />
          </p>
        </div>
      </div>
      <p className="sr-only">
        {name}, {title}. {recentLabel} : {commits.map((c) => c.repo).join(", ")}.
      </p>
    </motion.div>
  );
}
