"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Copy, ExternalLink, FolderGit2, Hash, Moon, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { toggleTheme } from "../ui/ThemeToggle";

export type PaletteProject = { slug: string; title: string };

type Action = { id: string; label: string; group: string; icon: ReactNode; run: () => void };

type PaletteProps = {
  locale: Locale;
  onClose: () => void;
  projects: PaletteProject[];
  email: string;
  github: string;
  home: boolean;
};

/** Palette de commandes (⌘K / Ctrl+K) : navigation rapide au clavier. */
export function CommandPalette({ open, ...props }: PaletteProps & { open: boolean }) {
  // Monté à chaque ouverture : la recherche repart de zéro.
  return <AnimatePresence>{open && <PaletteDialog key="palette" {...props} />}</AnimatePresence>;
}

function PaletteDialog({ locale, onClose, projects, email, github, home }: PaletteProps) {
  const dict = getDictionary(locale);
  const t = dict.palette;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const actions = useMemo<Action[]>(() => {
    const go = (id: string) => () => (home ? (location.hash = id) : router.push(localePath(locale, `/#${id}`)));
    return [
      ...dict.nav.sections.map(({ id, label }) => ({
        id: `s-${id}`,
        label,
        group: t.sections,
        icon: <Hash className="size-4" />,
        run: go(id),
      })),
      ...projects.map((p) => ({
        id: `p-${p.slug}`,
        label: p.title,
        group: t.projects,
        icon: <FolderGit2 className="size-4" />,
        run: () => router.push(localePath(locale, `/projets/${encodeURIComponent(p.slug)}`)),
      })),
      {
        id: "copy-email",
        label: t.copyEmail,
        group: t.actions,
        icon: <Copy className="size-4" />,
        run: () => {
          navigator.clipboard?.writeText(email).then(() => setCopied(true));
        },
      },
      ...(github
        ? [{
            id: "github",
            label: t.github,
            group: t.actions,
            icon: <ExternalLink className="size-4" />,
            run: () => window.open(github, "_blank", "noopener"),
          }]
        : []),
      { id: "theme", label: t.theme, group: t.actions, icon: <Moon className="size-4" />, run: toggleTheme },
    ];
  }, [dict, t, locale, projects, email, github, home, router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? actions.filter((a) => a.label.toLowerCase().includes(q)) : actions;
  }, [actions, query]);

  const run = (a: Action | undefined) => {
    if (!a) return;
    a.run();
    if (a.id !== "copy-email") onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(results[index]);
    }
  };

  let lastGroup = "";

  return (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[15vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t.label}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-line-strong bg-elev shadow-2xl"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-subtle" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                placeholder={t.placeholder}
                className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-subtle"
                aria-label={t.search}
              />
              <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-subtle">ESC</kbd>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
              {results.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">{t.empty}</li>}
              {results.map((a, i) => {
                const header = a.group !== lastGroup ? a.group : null;
                lastGroup = a.group;
                return (
                  <li key={a.id}>
                    {header && (
                      <p className="px-3 pb-1 pt-3 font-mono text-[10px] uppercase tracking-widest text-subtle">{header}</p>
                    )}
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === index}
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => run(a)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                        i === index ? "bg-accent-soft text-fg" : "text-muted",
                      )}
                    >
                      <span className={i === index ? "text-accent" : ""}>{a.icon}</span>
                      <span className="flex-1 truncate">
                        {a.id === "copy-email" && copied ? t.copied : a.label}
                      </span>
                      {i === index && <ArrowRight className="size-3.5 text-accent" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
  );
}
