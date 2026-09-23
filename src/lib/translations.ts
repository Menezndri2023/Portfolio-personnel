import type { Locale } from "./i18n";
import type {
  Education,
  Experience,
  ManualProject,
  Profile,
  RepoOverride,
  Service,
  Settings,
  SiteContent,
  SkillGroup,
} from "./types";

/**
 * Traduction du contenu éditable.
 *
 * Le français est la langue de référence. La version anglaise est une surcouche
 * saisie dans /admin : seuls les champs textuels y figurent, rattachés aux éléments
 * par leur `id` (ou le nom du dépôt GitHub). Un champ vide retombe sur le français.
 */

/** Champs traduisibles de chaque section. */
export const TRANSLATABLE = {
  profile: [
    "title",
    "location",
    "availabilityLabel",
    "headline",
    "rotatingRoles",
    "intro",
    "bio",
    "softSkills",
    "languages",
    "photoCaption",
  ],
  services: ["title", "description"],
  skills: ["title", "description", "items"],
  experiences: ["role", "company", "period", "location", "summary", "highlights"],
  education: ["title", "school", "period", "highlights"],
  projects: ["title", "summary", "description"],
  repoOverrides: ["title", "summary", "description"],
  settings: ["seoTitle", "seoDescription"],
} as const satisfies {
  profile: readonly (keyof Profile)[];
  services: readonly (keyof Service)[];
  skills: readonly (keyof SkillGroup)[];
  experiences: readonly (keyof Experience)[];
  education: readonly (keyof Education)[];
  projects: readonly (keyof ManualProject)[];
  repoOverrides: readonly (keyof RepoOverride)[];
  settings: readonly (keyof Settings)[];
};

type T = typeof TRANSLATABLE;
type Pick2<O, K extends keyof T> = Partial<Pick<O, Extract<T[K][number], keyof O>>>;

export type Translations = {
  profile: Pick2<Profile, "profile">;
  services: Record<string, Pick2<Service, "services">>;
  skills: Record<string, Pick2<SkillGroup, "skills">>;
  experiences: Record<string, Pick2<Experience, "experiences">>;
  education: Record<string, Pick2<Education, "education">>;
  projects: Record<string, Pick2<ManualProject, "projects">>;
  repoOverrides: Record<string, Pick2<Required<RepoOverride>, "repoOverrides">>;
  settings: Pick2<Settings, "settings">;
};

export type TranslatableSection = keyof Translations;

export const emptyTranslations = (): Translations => ({
  profile: {},
  services: {},
  skills: {},
  experiences: {},
  education: {},
  projects: {},
  repoOverrides: {},
  settings: {},
});

/** Une traduction est « remplie » si elle contient du texte (les listes vides ne comptent pas). */
export function isFilled(value: unknown): boolean {
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) {
    return value.some((v) => (typeof v === "object" && v ? Object.values(v).some(isFilled) : isFilled(v)));
  }
  return false;
}

type AnyObj = Record<string, unknown>;

/** Applique les champs traduits non vides sur l'objet source. */
function overlay<O extends object>(source: O, tr: object | undefined, keys: readonly string[]): O {
  if (!tr) return source;
  const out = { ...source } as AnyObj;
  const t = tr as AnyObj;
  for (const k of keys) if (isFilled(t[k])) out[k] = t[k];
  return out as O;
}

/** Retire les champs vides d'une traduction avant enregistrement. */
export function compact<O extends AnyObj>(tr: O): Partial<O> {
  return Object.fromEntries(Object.entries(tr).filter(([, v]) => isFilled(v))) as Partial<O>;
}

/** Contenu dans la langue demandée (le français est renvoyé tel quel). */
export function localize(content: SiteContent, locale: Locale): SiteContent {
  if (locale === "fr") return content;
  const tr = content.translations?.[locale];
  if (!tr) return content;

  const list = <I extends { id: string }>(items: I[], map: Record<string, object>, keys: readonly string[]) =>
    items.map((item) => overlay(item, map[item.id], keys));

  const repoOverrides: Record<string, RepoOverride> = { ...content.repoOverrides };
  for (const [name, t] of Object.entries(tr.repoOverrides)) {
    repoOverrides[name] = overlay(content.repoOverrides[name] ?? {}, t, TRANSLATABLE.repoOverrides);
  }

  return {
    ...content,
    profile: overlay(content.profile, tr.profile, TRANSLATABLE.profile),
    services: list(content.services, tr.services, TRANSLATABLE.services),
    skills: list(content.skills, tr.skills, TRANSLATABLE.skills),
    experiences: list(content.experiences, tr.experiences, TRANSLATABLE.experiences),
    education: list(content.education, tr.education, TRANSLATABLE.education),
    projects: list(content.projects, tr.projects, TRANSLATABLE.projects),
    repoOverrides,
    settings: overlay(content.settings, tr.settings, TRANSLATABLE.settings),
  };
}
