"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* stockage indisponible : le thème vaut pour la session */
  }
  listeners.forEach((l) => l());
}

export function toggleTheme() {
  setTheme(readTheme() === "dark" ? "light" : "dark");
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    readTheme,
    () => "light",
  );
}

export function ThemeToggle({
  className = "",
  labels = { toLight: "Passer au thème clair", toDark: "Passer au thème sombre" },
}: {
  className?: string;
  labels?: { toLight: string; toDark: string };
}) {
  const theme = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? labels.toLight : labels.toDark}
      className={`grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-line-strong hover:text-fg ${className}`}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
