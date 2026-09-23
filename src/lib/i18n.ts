/**
 * Langues du site public.
 *
 * Le français est servi sans préfixe (/, /projets/…) et l'anglais sous /en.
 * Le proxy réécrit les URL françaises vers /fr/… en interne (voir src/proxy.ts).
 *
 * Ce fichier contient les textes de l'interface. Le contenu éditable (profil,
 * projets…) est traduit depuis /admin (voir lib/translations.ts).
 */

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const isLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

/** Chemin public d'une page dans une langue : localePath("en", "/projets/x") → "/en/projets/x". */
export function localePath(locale: Locale, path = "/") {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path.startsWith("/#") ? path.slice(1) : path}`;
}

const fr = {
  htmlLang: "fr",
  ogLocale: "fr_FR",
  dateLocale: "fr-FR",
  switchLabel: "EN",
  switchAria: "Read this page in English",
  nav: {
    sections: [
      { id: "a-propos", label: "À propos" },
      { id: "competences", label: "Compétences" },
      { id: "projets", label: "Projets" },
      { id: "parcours", label: "Parcours" },
      { id: "contact", label: "Contact" },
    ],
    main: "Navigation principale",
    cta: "Discutons",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    openPalette: "Ouvrir la palette de commandes",
  },
  palette: {
    label: "Palette de commandes",
    placeholder: "Rechercher une section, un projet, une action…",
    search: "Rechercher",
    empty: "Aucun résultat",
    sections: "Sections",
    projects: "Projets",
    actions: "Actions",
    copyEmail: "Copier mon adresse e-mail",
    copied: "Adresse copiée ✓",
    github: "Ouvrir mon GitHub",
    theme: "Changer de thème",
  },
  theme: { toLight: "Passer au thème clair", toDark: "Passer au thème sombre" },
  hero: {
    specialized: "Spécialisé en",
    seeProjects: "Voir mes projets",
    downloadCv: "Télécharger mon CV",
    contactMe: "Me contacter",
    recentRepos: "Dépôts récemment mis à jour",
  },
  stats: {
    aria: "Chiffres clés",
    showcase: "Projets mis en avant",
    repos: "Dépôts publics sur GitHub",
    years: "Années à coder au quotidien",
    technologies: "Technologies maîtrisées",
  },
  about: {
    eyebrow: "À propos",
    title: "Du besoin métier à la mise en production.",
    portrait: "Portrait de",
    languages: "Langues",
    softSkills: "Savoir-être",
  },
  skills: {
    eyebrow: "Compétences",
    title: "Une stack JavaScript de bout en bout.",
    lead: "Le même langage de la base de données jusqu'au navigateur : moins de friction, plus de vitesse de livraison.",
  },
  projects: {
    eyebrow: "Projets",
    title: "Des produits réels, en ligne et en évolution.",
    lead: (n: number) =>
      `Mes ${n} derniers dépôts GitHub apparaissent ici automatiquement, aux côtés des projets que j'ai choisi de mettre en avant.`,
    all: "Tous",
    filterAria: "Filtrer par technologie",
    live: "Synchronisé avec GitHub",
    cached: "Données GitHub en cache",
    empty: "Aucun projet pour ce filtre pour l'instant.",
    hideArchive: "Masquer l'archive",
    showArchive: (n: number) => `Explorer les ${n} dépôts publics`,
    searchPlaceholder: "Rechercher un dépôt, un langage…",
    searchAria: "Rechercher dans les dépôts",
    fullProfile: "Voir le profil GitHub complet",
    featured: "À la une",
    pinned: "Épinglé",
    updated: (date: string) => `Mis à jour ${date}`,
    previewOf: "Aperçu de",
    defaultSummary: "Projet publié sur GitHub.",
  },
  project: {
    back: "Tous les projets",
    demo: "Voir en ligne",
    source: "Code source",
    readme: "README du dépôt",
    noDoc:
      "La documentation détaillée de ce projet arrive bientôt. En attendant, le code source est consultable sur GitHub.",
    lastUpdate: "Dernière mise à jour",
    stars: "Étoiles",
    languages: "Langages",
    next: "Projet suivant",
    notFound: "Projet introuvable",
  },
  journey: {
    eyebrow: "Parcours",
    title: "Expériences et formation.",
    lead: "Du support client à l'architecture d'API : chaque étape a façonné ma manière de construire.",
    experiences: "Expériences",
    education: "Formation",
    current: "En cours",
  },
  contact: {
    eyebrow: "Contact",
    title: "Construisons quelque chose de solide ensemble.",
    intro:
      "Un poste, une mission freelance ou une idée à structurer ? Décrivez-moi votre besoin : je vous réponds sous 48 heures avec une première analyse.",
    email: "E-mail",
    copy: "Copier",
    copied: "Copié",
    phone: "Téléphone",
    location: "Localisation",
    remote: "ouvert au télétravail",
    name: "Nom",
    namePlaceholder: "Votre nom",
    emailPlaceholder: "vous@entreprise.com",
    subject: "Sujet",
    subjectPlaceholder: "Poste de développeur fullstack, mission…",
    message: "Message",
    messagePlaceholder: "Parlez-moi de votre projet, de votre équipe, de vos délais…",
    send: "Envoyer le message",
    sent: "Message envoyé, merci ! Je reviens vers vous rapidement.",
    failed: "Envoi impossible pour le moment.",
  },
  /** Messages d'erreur renvoyés par l'API de contact. */
  contactErrors: {
    name: "Indiquez votre nom",
    email: "Adresse e-mail invalide",
    message: "Votre message est un peu court",
    tooLong: "Ce champ est trop long",
    invalid: "Formulaire invalide",
    rateLimit: "Trop de messages envoyés. Réessayez un peu plus tard.",
  },
  footer: { madeWith: "Conçu et développé avec Next.js.", top: "Haut de page" },
  notFound: {
    code: "Erreur 404",
    title: "Page introuvable.",
    text: "Ce contenu a peut-être été déplacé, ou le projet n'est plus public.",
    back: "Retour à l'accueil",
  },
  time: {
    today: "aujourd'hui",
    yesterday: "hier",
    days: (n: number) => `il y a ${n} jours`,
    months: (n: number) => `il y a ${n} mois`,
    years: (n: number) => `il y a ${n} an${n > 1 ? "s" : ""}`,
  },
};

export type Dictionary = typeof fr;

const en: Dictionary = {
  htmlLang: "en",
  ogLocale: "en_US",
  dateLocale: "en-US",
  switchLabel: "FR",
  switchAria: "Lire cette page en français",
  nav: {
    sections: [
      { id: "a-propos", label: "About" },
      { id: "competences", label: "Skills" },
      { id: "projets", label: "Projects" },
      { id: "parcours", label: "Journey" },
      { id: "contact", label: "Contact" },
    ],
    main: "Main navigation",
    cta: "Let's talk",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    openPalette: "Open the command palette",
  },
  palette: {
    label: "Command palette",
    placeholder: "Search a section, a project, an action…",
    search: "Search",
    empty: "No results",
    sections: "Sections",
    projects: "Projects",
    actions: "Actions",
    copyEmail: "Copy my email address",
    copied: "Address copied ✓",
    github: "Open my GitHub",
    theme: "Switch theme",
  },
  theme: { toLight: "Switch to light theme", toDark: "Switch to dark theme" },
  hero: {
    specialized: "Specialized in",
    seeProjects: "See my projects",
    downloadCv: "Download my resume",
    contactMe: "Contact me",
    recentRepos: "Recently updated repositories",
  },
  stats: {
    aria: "Key figures",
    showcase: "Featured projects",
    repos: "Public repositories on GitHub",
    years: "Years coding every day",
    technologies: "Technologies mastered",
  },
  about: {
    eyebrow: "About",
    title: "From business need to production.",
    portrait: "Portrait of",
    languages: "Languages",
    softSkills: "Soft skills",
  },
  skills: {
    eyebrow: "Skills",
    title: "An end-to-end JavaScript stack.",
    lead: "One language from the database to the browser: less friction, faster delivery.",
  },
  projects: {
    eyebrow: "Projects",
    title: "Real products, live and evolving.",
    lead: (n: number) =>
      `My ${n} latest GitHub repositories show up here automatically, alongside the projects I chose to highlight.`,
    all: "All",
    filterAria: "Filter by technology",
    live: "Synced with GitHub",
    cached: "Cached GitHub data",
    empty: "No project matches this filter yet.",
    hideArchive: "Hide the archive",
    showArchive: (n: number) => `Browse all ${n} public repositories`,
    searchPlaceholder: "Search a repository, a language…",
    searchAria: "Search repositories",
    fullProfile: "See the full GitHub profile",
    featured: "Featured",
    pinned: "Pinned",
    updated: (date: string) => `Updated ${date}`,
    previewOf: "Preview of",
    defaultSummary: "Project published on GitHub.",
  },
  project: {
    back: "All projects",
    demo: "View live",
    source: "Source code",
    readme: "Repository README",
    noDoc: "Detailed documentation for this project is coming soon. Meanwhile, the source code is available on GitHub.",
    lastUpdate: "Last update",
    stars: "Stars",
    languages: "Languages",
    next: "Next project",
    notFound: "Project not found",
  },
  journey: {
    eyebrow: "Journey",
    title: "Experience and education.",
    lead: "From customer support to API architecture: every step shaped the way I build.",
    experiences: "Experience",
    education: "Education",
    current: "Current",
  },
  contact: {
    eyebrow: "Contact",
    title: "Let's build something solid together.",
    intro:
      "A job opening, a freelance assignment or an idea to shape? Tell me what you need: I'll get back to you within 48 hours with a first analysis.",
    email: "Email",
    copy: "Copy",
    copied: "Copied",
    phone: "Phone",
    location: "Location",
    remote: "open to remote work",
    name: "Name",
    namePlaceholder: "Your name",
    emailPlaceholder: "you@company.com",
    subject: "Subject",
    subjectPlaceholder: "Fullstack developer position, assignment…",
    message: "Message",
    messagePlaceholder: "Tell me about your project, your team, your timeline…",
    send: "Send message",
    sent: "Message sent, thank you! I'll get back to you shortly.",
    failed: "Unable to send right now.",
  },
  contactErrors: {
    name: "Please enter your name",
    email: "Invalid email address",
    message: "Your message is a bit short",
    tooLong: "This field is too long",
    invalid: "Invalid form",
    rateLimit: "Too many messages sent. Please try again a little later.",
  },
  footer: { madeWith: "Designed and built with Next.js.", top: "Back to top" },
  notFound: {
    code: "Error 404",
    title: "Page not found.",
    text: "This content may have moved, or the project is no longer public.",
    back: "Back to home",
  },
  time: {
    today: "today",
    yesterday: "yesterday",
    days: (n: number) => `${n} days ago`,
    months: (n: number) => `${n} month${n > 1 ? "s" : ""} ago`,
    years: (n: number) => `${n} year${n > 1 ? "s" : ""} ago`,
  },
};

const dictionaries: Record<Locale, Dictionary> = { fr, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
