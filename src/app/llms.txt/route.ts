import { getContent, getLocalizedContent } from "@/lib/content";
import { buildProjects, getRepos } from "@/lib/github";
import { getDictionary, localePath } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

/**
 * /llms.txt : résumé factuel du profil pour les moteurs de réponse IA
 * (ChatGPT, Perplexity, AI Overviews…), au format proposé sur llmstxt.org.
 * Généré depuis le contenu de l'admin (version anglaise, pour un public international).
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const fr = await getContent();
  const base = siteUrl(fr.settings);
  const content = await getLocalizedContent("en");
  const { profile, skills, experiences, education, services } = content;
  const { repos } = await getRepos(content);
  const { showcase } = buildProjects(content, repos, "en");
  const status = getDictionary("en").projects.status;
  const url = (path: string) => `${base}${path}`;

  const links = [
    [`Portfolio (English)`, url(localePath("en"))],
    [`Portfolio (Français)`, url(localePath("fr"))],
    ["GitHub", profile.socials.github],
    ["LinkedIn", profile.socials.linkedin],
    ["Company website", profile.socials.website],
    ["Resume (English, PDF)", profile.cvUrl ? url(profile.cvUrl) : ""],
    ["CV (Français, PDF)", fr.profile.cvUrl ? url(fr.profile.cvUrl) : ""],
  ].filter(([, href]) => href);

  const lines = [
    `# ${profile.name}`,
    "",
    `> ${profile.title}. ${profile.intro}`,
    "",
    ...(profile.fullName ? [`Full name: ${profile.fullName}.`] : []),
    `Location: ${profile.location}. Languages: ${profile.languages.map((l) => `${l.name} (${l.level})`).join(", ")}.`,
    ...(profile.available ? [`Availability: ${profile.availabilityLabel}.`] : []),
    `Contact: ${profile.email} or the contact form at ${url(localePath("en", "/#contact"))}.`,
    "",
    "## Links",
    "",
    ...links.map(([label, href]) => `- [${label}](${href})`),
    "",
    "## Services",
    "",
    ...services.map((s) => `- ${s.title}: ${s.description}`),
    "",
    "## Projects",
    "",
    ...showcase.map(
      (p) =>
        `- [${p.title}](${url(localePath("en", `/projets/${encodeURIComponent(p.slug)}`))})${p.status ? ` (${status[p.status]})` : ""}: ${p.summary}${p.tags.length ? ` Stack: ${p.tags.join(", ")}.` : ""}`,
    ),
    "",
    "## Experience",
    "",
    ...experiences.map((e) => `- ${e.role}, ${[e.company, e.location].filter(Boolean).join(", ")}${e.period ? ` (${e.period})` : ""}: ${e.summary}`),
    "",
    "## Education & certification",
    "",
    ...education.map((e) => `- ${e.title}, ${e.school}${e.period ? ` (${e.period})` : ""}`),
    "",
    "## Skills",
    "",
    ...skills.filter((g) => !g.learning).map((g) => `- ${g.title}: ${g.items.join(", ")}`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
