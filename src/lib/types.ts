import type { Translations } from "./translations";

/**
 * Modèle de contenu du portfolio.
 * Tout ce qui est décrit ici est éditable depuis /admin et persisté par le store
 * (fichier JSON en local, MongoDB en production).
 */

export type SocialLinks = {
  github: string;
  linkedin: string;
  twitter: string;
  website: string;
};

export type Profile = {
  name: string;
  shortName: string;
  title: string;
  /** Mots qui défilent dans le hero ("React.js", "Next.js"…). */
  rotatingRoles: string[];
  headline: string;
  intro: string;
  /** Paragraphes de la section « À propos », séparés par une ligne vide. */
  bio: string;
  location: string;
  email: string;
  phone: string;
  showPhone: boolean;
  available: boolean;
  availabilityLabel: string;
  photo: string;
  photoCaption: string;
  avatar: string;
  cvUrl: string;
  socials: SocialLinks;
  languages: { name: string; level: string }[];
  softSkills: string[];
};

export type Service = {
  id: string;
  title: string;
  description: string;
  /** Nom d'une icône du registre (voir components/ui/Icon.tsx). */
  icon: string;
};

export type SkillGroup = {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: string[];
  /** Groupe « en cours d'apprentissage » : affiché avec un style distinct. */
  learning: boolean;
};

export type Experience = {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  current: boolean;
  summary: string;
  highlights: string[];
  tags: string[];
};

export type Education = {
  id: string;
  title: string;
  school: string;
  period: string;
  highlights: string[];
};

/** Projet saisi à la main (hors GitHub, ex. projet client privé). */
export type ManualProject = {
  id: string;
  title: string;
  summary: string;
  description: string;
  tags: string[];
  image: string;
  repoUrl: string;
  demoUrl: string;
  year: string;
  featured: boolean;
  hidden: boolean;
};

/** Surcharges éditoriales appliquées à un dépôt GitHub synchronisé. */
export type RepoOverride = {
  title?: string;
  summary?: string;
  description?: string;
  tags?: string[];
  image?: string;
  demoUrl?: string;
  featured?: boolean;
  hidden?: boolean;
  /** Toujours affiché, même s'il n'est plus parmi les plus récents. */
  pinned?: boolean;
  /** Afficher le README GitHub sur la page projet (défaut : auto). */
  showReadme?: boolean;
};

export type Settings = {
  githubUsername: string;
  /** Nombre de dépôts récents affichés automatiquement. */
  githubLimit: number;
  excludeForks: boolean;
  seoTitle: string;
  seoDescription: string;
  siteUrl: string;
};

/** Instantané des dépôts, utilisé si l'API GitHub est indisponible. */
export type RepoSnapshot = {
  syncedAt: string;
  repos: GithubRepo[];
};

export type SiteContent = {
  profile: Profile;
  services: Service[];
  skills: SkillGroup[];
  experiences: Experience[];
  education: Education[];
  projects: ManualProject[];
  repoOverrides: Record<string, RepoOverride>;
  settings: Settings;
  githubSnapshot: RepoSnapshot | null;
  /** Version anglaise des textes (surcouche du français, voir lib/translations.ts). */
  translations: { en: Translations };
};

export type ContentSection = keyof SiteContent;

export type GithubRepo = {
  name: string;
  description: string;
  url: string;
  homepage: string;
  language: string;
  topics: string[];
  stars: number;
  forks: number;
  fork: boolean;
  archived: boolean;
  size: number;
  pushedAt: string;
  createdAt: string;
};

/** Projet unifié affiché sur le site (GitHub + manuel). */
export type ProjectView = {
  slug: string;
  source: "github" | "manual";
  title: string;
  summary: string;
  description: string;
  tags: string[];
  image: string;
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  pinned: boolean;
  language: string;
  stars: number;
  updatedAt: string;
  year: string;
  showReadme: boolean;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  /** Langue de la page depuis laquelle le message a été envoyé. */
  lang?: "fr" | "en";
};
