"use client";

import {
  Briefcase,
  ExternalLink,
  FolderGit2,
  FolderPlus,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Layers,
  Loader2,
  LogOut,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { EditableSection } from "@/lib/schemas";
import type { Education, Experience, ManualProject, Message, Service, SiteContent, SkillGroup } from "@/lib/types";
import { cn, uid } from "@/lib/utils";
import { ThemeToggle } from "../ui/ThemeToggle";
import { CollectionEditor } from "./CollectionEditor";
import { GithubManager } from "./GithubManager";
import { MessagesInbox } from "./MessagesInbox";
import { ObjectEditor } from "./ObjectEditor";
import { Toasts, type Toast } from "./ui";

type Tab =
  | "overview"
  | "profile"
  | "services"
  | "skills"
  | "experiences"
  | "education"
  | "github"
  | "projects"
  | "messages"
  | "settings";

const NAV: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "overview", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "profile", label: "Profil", icon: User },
  { id: "services", label: "Services", icon: Layers },
  { id: "skills", label: "Compétences", icon: Sparkles },
  { id: "experiences", label: "Expériences", icon: Briefcase },
  { id: "education", label: "Formation", icon: GraduationCap },
  { id: "github", label: "Projets GitHub", icon: FolderGit2 },
  { id: "projects", label: "Projets manuels", icon: FolderPlus },
  { id: "messages", label: "Messages", icon: Inbox },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export function AdminApp() {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent | null>(null);
  const [store, setStore] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [error, setError] = useState("");

  const notify = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  useEffect(() => {
    fetch("/api/admin/content")
      .then(async (r) => {
        if (r.status === 401) return router.replace("/admin/login");
        const data = (await r.json()) as { content: SiteContent; store: string; error?: string };
        if (!r.ok) throw new Error(data.error);
        setContent(data.content);
        setStore(data.store);
      })
      .catch((e: Error) => setError(e.message || "Impossible de charger le contenu"));

    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d: { messages?: Message[] }) => setMessages(d.messages ?? []))
      .finally(() => setMessagesLoading(false));
  }, [router]);

  /** Enregistre une section ; renvoie true si l'opération a réussi. */
  const save = useCallback(
    async <K extends EditableSection>(section: K, data: SiteContent[K]) => {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, data }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        notify("error", json.error ?? "Échec de l'enregistrement");
        return false;
      }
      setContent((c) => (c ? { ...c, [section]: data } : c));
      notify("success", "Enregistré — le site est mis à jour.");
      return true;
    },
    [notify],
  );

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (error) return <p className="p-10 text-accent">{error}</p>;
  if (!content) {
    return (
      <div className="grid min-h-dvh place-items-center text-muted">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-line bg-elev lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-accent font-mono text-sm font-bold text-accent-fg">M</span>
            <span>
              <span className="block text-sm font-semibold">Back-office</span>
              <span className="block text-[11px] text-subtle">Stockage : {store}</span>
            </span>
          </div>
          <ThemeToggle className="lg:hidden" />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible" aria-label="Sections du back-office">
          {NAV.map(({ id, label, icon: I }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                tab === id ? "bg-accent-soft font-medium text-accent" : "text-muted hover:bg-card hover:text-fg",
              )}
            >
              <I className="size-4" />
              {label}
              {id === "messages" && unread > 0 && (
                <span className="ml-auto rounded-full bg-accent px-1.5 text-[10px] font-semibold text-accent-fg">{unread}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-1 border-t border-line p-3 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-card hover:text-fg">
            <ExternalLink className="size-4" /> Voir le site
          </a>
          <div className="flex items-center justify-between">
            <button type="button" onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-card hover:text-fg">
              <LogOut className="size-4" /> Déconnexion
            </button>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <main className="mx-auto w-full max-w-4xl p-5 md:p-10">
        {tab === "overview" && <Overview content={content} unread={unread} messages={messages.length} store={store} go={setTab} onLogout={logout} />}

        {tab === "profile" && (
          <ObjectEditor
            title="Profil"
            description="Identité, textes d'accroche, coordonnées et liens."
            value={content.profile}
            onSave={(v) => save("profile", v)}
            sections={[
              {
                title: "Identité",
                fields: [
                  { key: "name", label: "Nom complet", type: "text" },
                  { key: "shortName", label: "Nom court (navigation)", type: "text" },
                  { key: "title", label: "Titre professionnel", type: "text" },
                  { key: "location", label: "Localisation", type: "text" },
                  { key: "available", label: "Disponible", type: "toggle", help: "Affiche le badge de disponibilité dans le hero." },
                  { key: "availabilityLabel", label: "Texte du badge", type: "text" },
                ],
              },
              {
                title: "Accroche & présentation",
                fields: [
                  { key: "headline", label: "Titre principal (hero)", type: "text", full: true },
                  { key: "rotatingRoles", label: "Spécialités qui défilent", type: "tags" },
                  { key: "intro", label: "Introduction courte", type: "textarea" },
                  { key: "bio", label: "Biographie (« À propos »)", type: "textarea", help: "Séparez les paragraphes par une ligne vide." },
                  { key: "softSkills", label: "Savoir-être", type: "tags" },
                  { key: "languages", label: "Langues", type: "pairs", pairLabels: ["Langue", "Niveau"] },
                ],
              },
              {
                title: "Médias",
                fields: [
                  { key: "photo", label: "Photo (À propos)", type: "url", help: "Chemin dans /public (ex. /images/moi.png) ou URL https." },
                  { key: "photoCaption", label: "Légende de la photo", type: "text" },
                  { key: "cvUrl", label: "Lien du CV (PDF)", type: "url", help: "Déposez le fichier dans public/ (ex. /cv.pdf) ou collez une URL. Vide = bouton masqué." },
                  { key: "avatar", label: "Avatar", type: "url" },
                ],
              },
              {
                title: "Contact & réseaux",
                fields: [
                  { key: "email", label: "E-mail", type: "text" },
                  { key: "phone", label: "Téléphone", type: "text" },
                  { key: "showPhone", label: "Afficher le téléphone publiquement", type: "toggle" },
                  { key: "socials.github", label: "GitHub", type: "url" },
                  { key: "socials.linkedin", label: "LinkedIn", type: "url" },
                  { key: "socials.twitter", label: "X / Twitter", type: "url" },
                  { key: "socials.website", label: "Site web", type: "url" },
                ],
              },
            ]}
          />
        )}

        {tab === "services" && (
          <CollectionEditor<Service>
            title="Services"
            description="Ce que vous proposez, affiché sous « À propos »."
            items={content.services}
            addLabel="Nouveau service"
            itemTitle={(s) => s.title}
            createItem={() => ({ id: uid("svc"), title: "", description: "", icon: "code" })}
            fields={[
              { key: "title", label: "Titre", type: "text" },
              { key: "icon", label: "Icône", type: "icon" },
              { key: "description", label: "Description", type: "textarea" },
            ]}
            onSave={(items) => save("services", items)}
          />
        )}

        {tab === "skills" && (
          <CollectionEditor<SkillGroup>
            title="Compétences"
            description="Groupes de compétences. Cochez « en apprentissage » pour un style distinct."
            items={content.skills}
            addLabel="Nouveau groupe"
            itemTitle={(g) => g.title}
            itemSubtitle={(g) => g.items.join(" · ")}
            createItem={() => ({ id: uid("sk"), title: "", description: "", icon: "code", items: [], learning: false })}
            fields={[
              { key: "title", label: "Nom du groupe", type: "text" },
              { key: "description", label: "Sous-titre", type: "text" },
              { key: "items", label: "Compétences", type: "tags" },
              { key: "icon", label: "Icône", type: "icon", full: true },
              { key: "learning", label: "En cours d'apprentissage", type: "toggle" },
            ]}
            onSave={(items) => save("skills", items)}
          />
        )}

        {tab === "experiences" && (
          <CollectionEditor<Experience>
            title="Expériences"
            description="Votre parcours professionnel, du plus récent au plus ancien."
            items={content.experiences}
            addLabel="Nouvelle expérience"
            itemTitle={(e) => e.role}
            itemSubtitle={(e) => [e.company, e.period].filter(Boolean).join(" · ")}
            createItem={() => ({
              id: uid("exp"),
              role: "",
              company: "",
              location: "",
              period: "",
              current: false,
              summary: "",
              highlights: [],
              tags: [],
            })}
            fields={[
              { key: "role", label: "Poste", type: "text" },
              { key: "company", label: "Entreprise / contexte", type: "text" },
              { key: "period", label: "Période", type: "text", placeholder: "2024 — aujourd'hui" },
              { key: "location", label: "Lieu", type: "text" },
              { key: "current", label: "Poste actuel", type: "toggle", full: true },
              { key: "summary", label: "Résumé", type: "textarea" },
              { key: "highlights", label: "Réalisations", type: "lines" },
              { key: "tags", label: "Technologies / compétences", type: "tags" },
            ]}
            onSave={(items) => save("experiences", items)}
          />
        )}

        {tab === "education" && (
          <CollectionEditor<Education>
            title="Formation"
            description="Diplômes, bootcamps et certifications."
            items={content.education}
            addLabel="Nouvelle formation"
            itemTitle={(e) => e.title}
            itemSubtitle={(e) => [e.school, e.period].filter(Boolean).join(" · ")}
            createItem={() => ({ id: uid("edu"), title: "", school: "", period: "", highlights: [] })}
            fields={[
              { key: "title", label: "Intitulé", type: "text" },
              { key: "school", label: "Établissement", type: "text" },
              { key: "period", label: "Période", type: "text" },
              { key: "highlights", label: "Contenu / points clés", type: "lines" },
            ]}
            onSave={(items) => save("education", items)}
          />
        )}

        {tab === "github" && (
          <GithubManager content={content} notify={notify} onSave={(o) => save("repoOverrides", o)} />
        )}

        {tab === "projects" && (
          <CollectionEditor<ManualProject>
            title="Projets manuels"
            description="Projets hors GitHub (clients, dépôts privés…). Ils s'affichent avec les projets GitHub."
            items={content.projects}
            addLabel="Nouveau projet"
            itemTitle={(p) => p.title}
            itemSubtitle={(p) => p.summary}
            isHidden={(p) => p.hidden}
            createItem={() => ({
              id: uid("prj"),
              title: "",
              summary: "",
              description: "",
              tags: [],
              image: "",
              repoUrl: "",
              demoUrl: "",
              year: String(new Date().getFullYear()),
              featured: false,
              hidden: false,
            })}
            fields={[
              { key: "title", label: "Titre", type: "text" },
              { key: "year", label: "Année", type: "text" },
              { key: "summary", label: "Résumé (carte)", type: "textarea" },
              { key: "tags", label: "Technologies", type: "tags" },
              { key: "demoUrl", label: "Lien de démo", type: "url" },
              { key: "repoUrl", label: "Lien du code", type: "url" },
              { key: "image", label: "Image de couverture", type: "url", full: true, help: "Vide = couverture générée." },
              { key: "featured", label: "À la une", type: "toggle" },
              { key: "hidden", label: "Masquer du site", type: "toggle" },
              { key: "description", label: "Description détaillée (Markdown)", type: "markdown" },
            ]}
            onSave={(items) => save("projects", items)}
          />
        )}

        {tab === "messages" && (
          <MessagesInbox messages={messages} setMessages={setMessages} loading={messagesLoading} notify={notify} />
        )}

        {tab === "settings" && (
          <ObjectEditor
            title="Paramètres"
            description="Synchronisation GitHub et référencement."
            value={content.settings}
            onSave={(v) => save("settings", v)}
            sections={[
              {
                title: "GitHub",
                fields: [
                  { key: "githubUsername", label: "Nom d'utilisateur GitHub", type: "text" },
                  { key: "githubLimit", label: "Nombre de dépôts récents affichés", type: "number" },
                  { key: "excludeForks", label: "Ignorer les forks", type: "toggle", full: true },
                ],
              },
              {
                title: "Référencement (SEO)",
                fields: [
                  { key: "seoTitle", label: "Titre du site", type: "text", full: true },
                  { key: "seoDescription", label: "Description", type: "textarea" },
                  { key: "siteUrl", label: "URL publique du site", type: "url", placeholder: "https://manasse.dev", full: true },
                ],
              },
            ]}
          />
        )}
      </main>

      <Toasts toasts={toasts} />
    </div>
  );
}

function Overview({
  content,
  unread,
  messages,
  store,
  go,
  onLogout,
}: {
  content: SiteContent;
  unread: number;
  messages: number;
  store: string;
  go: (t: Tab) => void;
  onLogout: () => void;
}) {
  const cards: { label: string; value: number | string; tab: Tab }[] = [
    { label: "Messages non lus", value: `${unread} / ${messages}`, tab: "messages" },
    { label: "Groupes de compétences", value: content.skills.length, tab: "skills" },
    { label: "Expériences", value: content.experiences.length, tab: "experiences" },
    { label: "Dépôts GitHub personnalisés", value: Object.keys(content.repoOverrides).length, tab: "github" },
  ];
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">Bonjour {content.profile.shortName.split(" ")[0]} 👋</h1>
      <p className="mt-2 text-muted">Tout le contenu du portfolio se gère ici. Chaque enregistrement met le site à jour immédiatement.</p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => go(c.tab)}
            className="rounded-2xl border border-line bg-card p-5 text-left transition hover:border-line-strong"
          >
            <span className="block font-display text-3xl font-semibold">{c.value}</span>
            <span className="text-sm text-muted">{c.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-card p-6 text-sm leading-relaxed text-muted">
        <h2 className="mb-2 font-medium text-fg">Synchronisation GitHub</h2>
        <p>
          Les {content.settings.githubLimit} dépôts publics les plus récents de <strong className="text-fg">@{content.settings.githubUsername}</strong>{" "}
          s&apos;affichent automatiquement (rafraîchissement toutes les heures). Utilisez « Projets GitHub » pour épingler,
          masquer ou enrichir un projet, ou pour forcer une synchronisation.
        </p>
        {store === "fichier local" && (
          <p className="mt-4 rounded-xl bg-accent-soft p-3 text-fg">
            Stockage local : vos modifications sont écrites dans <code>data/content.json</code>. Committez ce fichier pour
            les publier, ou configurez <code>MONGODB_URI</code> pour éditer directement en production.
          </p>
        )}
      </div>

      <button type="button" onClick={onLogout} className="mt-8 inline-flex items-center gap-2 text-sm text-muted hover:text-fg lg:hidden">
        <LogOut className="size-4" /> Déconnexion
      </button>
    </div>
  );
}
