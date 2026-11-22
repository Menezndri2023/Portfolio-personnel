import { getDictionary, localePath, type Locale } from "./i18n";
import type { ProjectView, SiteContent } from "./types";

/**
 * Données structurées Schema.org.
 *
 * Règle : uniquement ce qui est visible sur la page et vérifiable
 * (pas d'avis, de note, de diplôme ni d'employeur inventés).
 * Sans URL publique (lib/site.ts), rien n'est émis : Schema.org exige des URL absolues.
 */

/** URL absolue, identique au lien canonique (« / » → « https://domaine/ »). */
const abs = (base: string, path: string) => `${base}${path}`;

function personId(base: string) {
  return `${base}/#person`;
}

/** Autres formes du nom (nom complet du CV, nom court), sans doublon. */
function alternateNames(profile: SiteContent["profile"]) {
  const names = [...new Set([profile.fullName, profile.shortName].filter((n): n is string => Boolean(n) && n !== profile.name))];
  return names.length ? { alternateName: names.length === 1 ? names[0] : names } : {};
}

/** Personne : identité, métier, réseaux, compétences affichées. */
function person(content: SiteContent, locale: Locale, base: string) {
  const { profile, skills, experiences } = content;
  const current = experiences.find((e) => e.current && /founder|fondat|ceo/i.test(e.role));
  const sameAs = [profile.socials.github, profile.socials.linkedin, profile.socials.twitter, profile.socials.website].filter(
    (u) => /^https?:\/\//.test(u),
  );
  return {
    "@type": "Person",
    "@id": personId(base),
    name: profile.name,
    ...alternateNames(profile),
    jobTitle: profile.title,
    description: profile.intro,
    url: abs(base, localePath(locale)),
    ...(profile.photo ? { image: profile.photo.startsWith("http") ? profile.photo : `${base}${profile.photo}` } : {}),
    ...(profile.location ? { homeLocation: { "@type": "Place", name: profile.location } } : {}),
    knowsAbout: [...new Set(skills.filter((g) => !g.learning).flatMap((g) => g.items))],
    knowsLanguage: profile.languages.map((l) => l.name),
    ...(sameAs.length ? { sameAs } : {}),
    ...(current
      ? {
          worksFor: {
            "@type": "Organization",
            name: current.company,
            ...(/^https?:\/\//.test(profile.socials.website) ? { url: profile.socials.website } : {}),
          },
        }
      : {}),
  };
}

/** Accueil : WebSite + ProfilePage dont l'entité principale est la personne. */
export function homeJsonLd(content: SiteContent, locale: Locale, base: string) {
  if (!base) return null;
  const url = abs(base, localePath(locale));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: content.profile.name,
        inLanguage: ["fr", "en"],
        publisher: { "@id": personId(base) },
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#profile`,
        url,
        name: content.settings.seoTitle,
        description: content.settings.seoDescription,
        inLanguage: locale,
        isPartOf: { "@id": `${base}/#website` },
        mainEntity: person(content, locale, base),
      },
    ],
  };
}

/** Page projet : code source (dépôt GitHub) ou réalisation, avec fil d'Ariane. */
export function projectJsonLd(project: ProjectView, content: SiteContent, locale: Locale, base: string) {
  if (!base) return null;
  const t = getDictionary(locale).seo;
  const home = abs(base, localePath(locale));
  const url = abs(base, localePath(locale, `/projets/${encodeURIComponent(project.slug)}`));
  const isCode = Boolean(project.repoUrl);
  const image = project.image ? (project.image.startsWith("http") ? project.image : `${base}${project.image}`) : undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": isCode ? "SoftwareSourceCode" : "CreativeWork",
        "@id": `${url}#project`,
        name: project.title,
        description: project.summary,
        url,
        inLanguage: locale,
        author: { "@type": "Person", "@id": personId(base), name: content.profile.name, url: home },
        keywords: project.tags.join(", "),
        ...(image ? { image } : {}),
        ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
        ...(isCode ? { codeRepository: project.repoUrl } : {}),
        ...(isCode && project.language ? { programmingLanguage: project.language } : {}),
        ...(project.demoUrl ? { sameAs: [project.demoUrl] } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: t.home, item: home },
          { "@type": "ListItem", position: 2, name: t.projects, item: `${home}#projets` },
          { "@type": "ListItem", position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
}
