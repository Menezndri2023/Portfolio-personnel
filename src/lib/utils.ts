import { getDictionary, type Locale } from "./i18n";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatMonth(iso: string, locale: Locale = "fr") {
  if (!iso) return "";
  return new Intl.DateTimeFormat(getDictionary(locale).dateLocale, { month: "short", year: "numeric" }).format(new Date(iso));
}

export function timeAgo(iso: string, locale: Locale = "fr") {
  if (!iso) return "";
  const t = getDictionary(locale).time;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return t.today;
  if (days < 2) return t.yesterday;
  if (days < 30) return t.days(days);
  const months = Math.floor(days / 30);
  if (months < 12) return t.months(months);
  return t.years(Math.floor(months / 12));
}

/** Couleurs officielles GitHub des langages les plus courants. */
export const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#663399",
  Python: "#3572A5",
  Swift: "#F05138",
  Java: "#b07219",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  PHP: "#4F5D95",
  Vue: "#41b883",
  SCSS: "#c6538c",
};

/** Teinte stable dérivée d'un texte, pour les couvertures générées. */
export function hueFrom(text: string) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}
