"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Command, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary, localePath, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../ui/ThemeToggle";
import { CommandPalette, type PaletteProject } from "./CommandPalette";

export function Navbar({
  locale,
  switchHref,
  brand,
  email,
  github,
  projects,
  home = true,
}: {
  locale: Locale;
  /** Même page dans l'autre langue. */
  switchHref: string;
  brand: string;
  email: string;
  github: string;
  projects: PaletteProject[];
  /** Sur la page d'accueil, les liens pointent vers des ancres ; ailleurs vers /#ancre. */
  home?: boolean;
}) {
  const dict = getDictionary(locale);
  const t = dict.nav;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [active, setActive] = useState("");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 40 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section active dans la navigation.
  useEffect(() => {
    if (!home) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    t.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [home, t.sections]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const href = (id: string) => (home ? `#${id}` : localePath(locale, `/#${id}`));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "border-b border-line bg-bg/75 backdrop-blur-xl" : "border-b border-transparent",
        )}
      >
        <nav className="container-page flex h-16 items-center justify-between gap-4" aria-label={t.main}>
          <Link
            href={localePath(locale)}
            onClick={(e) => {
              // Déjà sur l'accueil : Next.js ne rechargerait pas la page, on remonte donc au hero.
              if (!home) return;
              e.preventDefault();
              setOpen(false);
              history.replaceState(null, "", localePath(locale));
              setActive("");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="group flex items-center gap-2.5 font-display text-[15px] font-semibold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-fg font-mono text-sm font-bold text-bg transition group-hover:bg-accent">
              M
            </span>
            <span className="hidden sm:inline">{brand}</span>
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {t.sections.map((s) => (
              <li key={s.id}>
                <a
                  href={href(s.id)}
                  className={cn(
                    "relative rounded-full px-3.5 py-2 text-sm transition-colors",
                    active === s.id ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {active === s.id && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-accent-soft"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted transition hover:border-line-strong hover:text-fg lg:flex"
              aria-label={t.openPalette}
            >
              <Command className="size-3.5" /> K
            </button>
            <Link
              href={switchHref}
              hrefLang={locale === "fr" ? "en" : "fr"}
              aria-label={dict.switchAria}
              className="grid h-9 min-w-9 place-items-center rounded-full border border-line px-2 font-mono text-xs font-medium text-muted transition hover:border-line-strong hover:text-fg"
            >
              {dict.switchLabel}
            </Link>
            <ThemeToggle labels={dict.theme} />
            <a
              href={href("contact")}
              className="hidden rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg transition hover:bg-accent hover:text-accent-fg sm:inline-flex"
            >
              {t.cta}
            </a>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full border border-line md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? t.closeMenu : t.openMenu}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
        <motion.div className="h-px origin-left bg-accent" style={{ scaleX: progress }} />

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-line bg-bg/95 backdrop-blur-xl md:hidden"
            >
              <ul className="container-page flex flex-col py-4">
                {t.sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={href(s.id)}
                      onClick={() => setOpen(false)}
                      className="block py-3 font-display text-2xl font-medium tracking-tight"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <CommandPalette
        locale={locale}
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={projects}
        email={email}
        github={github}
        home={home}
      />
    </>
  );
}
