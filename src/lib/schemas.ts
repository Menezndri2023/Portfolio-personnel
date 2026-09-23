import { z } from "zod";
import type { ContentSection } from "./types";

/**
 * Validation des données envoyées par le back-office.
 * Les liens n'acceptent que http(s), mailto ou un chemin local : pas de `javascript:`.
 */

const text = (max = 300) => z.string().trim().max(max);
const longText = (max = 8000) => z.string().max(max);
const id = z.string().trim().min(1).max(80);
const list = (max = 60, itemMax = 300) => z.array(text(itemMax)).max(max);

export const safeUrl = z
  .string()
  .trim()
  .max(1000)
  .refine((v) => v === "" || /^(https?:\/\/|mailto:|\/(?!\/))/i.test(v), "Lien invalide (http(s)://, mailto: ou /chemin)");

const profile = z.object({
  name: text(120).min(1),
  shortName: text(80),
  title: text(120),
  rotatingRoles: list(10, 60),
  headline: text(200),
  intro: text(600),
  bio: longText(5000),
  location: text(120),
  email: z.union([z.literal(""), z.email().max(200)]),
  phone: text(40),
  showPhone: z.boolean(),
  available: z.boolean(),
  availabilityLabel: text(120),
  photo: safeUrl,
  photoCaption: text(200),
  avatar: safeUrl,
  cvUrl: safeUrl,
  socials: z.object({ github: safeUrl, linkedin: safeUrl, twitter: safeUrl, website: safeUrl }),
  languages: z.array(z.object({ name: text(60), level: text(60) })).max(15),
  softSkills: list(30, 120),
});

const service = z.object({ id, title: text(120), description: text(600), icon: text(40) });

const skillGroup = z.object({
  id,
  title: text(120),
  description: text(300),
  icon: text(40),
  items: list(60, 80),
  learning: z.boolean(),
});

const experience = z.object({
  id,
  role: text(160),
  company: text(160),
  location: text(160),
  period: text(80),
  current: z.boolean(),
  summary: text(800),
  highlights: list(20, 400),
  tags: list(20, 60),
});

const education = z.object({ id, title: text(160), school: text(160), period: text(80), highlights: list(20, 400) });

const manualProject = z.object({
  id,
  title: text(160).min(1),
  summary: text(400),
  description: longText(10000),
  tags: list(20, 60),
  image: safeUrl,
  repoUrl: safeUrl,
  demoUrl: safeUrl,
  year: text(10),
  featured: z.boolean(),
  hidden: z.boolean(),
});

const repoOverride = z.object({
  title: text(160).optional(),
  summary: text(400).optional(),
  description: longText(10000).optional(),
  tags: list(20, 60).optional(),
  image: safeUrl.optional(),
  demoUrl: safeUrl.optional(),
  featured: z.boolean().optional(),
  hidden: z.boolean().optional(),
  pinned: z.boolean().optional(),
  showReadme: z.boolean().optional(),
});

const settings = z.object({
  githubUsername: z.string().trim().regex(/^[a-zA-Z0-9-]{1,39}$/, "Nom d'utilisateur GitHub invalide"),
  githubLimit: z.number().int().min(0).max(30),
  excludeForks: z.boolean(),
  seoTitle: text(120),
  seoDescription: text(300),
  siteUrl: safeUrl,
});

/** Sections modifiables depuis l'admin (l'instantané GitHub est géré par la synchro). */
export const sectionSchemas = {
  profile,
  services: z.array(service).max(20),
  skills: z.array(skillGroup).max(20),
  experiences: z.array(experience).max(40),
  education: z.array(education).max(40),
  projects: z.array(manualProject).max(60),
  repoOverrides: z.record(z.string().max(100), repoOverride),
  settings,
} satisfies Partial<Record<ContentSection, z.ZodType>>;

export type EditableSection = keyof typeof sectionSchemas;

export const contactSchema = z.object({
  name: text(100).min(2, "Indiquez votre nom"),
  email: z.email("Adresse e-mail invalide").max(200),
  subject: text(150),
  message: z.string().trim().min(10, "Votre message est un peu court").max(5000),
  /** Champ piège invisible : rempli uniquement par les robots. */
  website: z.string().max(0).optional(),
});
