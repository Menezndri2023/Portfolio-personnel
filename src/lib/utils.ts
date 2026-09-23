export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

const dateFmt = new Intl.DateTimeFormat("fr-FR", { month: "short", year: "numeric" });

export function formatMonth(iso: string) {
  return iso ? dateFmt.format(new Date(iso)) : "";
}

export function timeAgo(iso: string) {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "aujourd'hui";
  if (days < 2) return "hier";
  if (days < 30) return `il y a ${days} jours`;
  const months = Math.floor(days / 30);
  if (months < 12) return `il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `il y a ${years} an${years > 1 ? "s" : ""}`;
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
