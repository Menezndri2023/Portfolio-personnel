import { ArrowDown, ArrowUpRight, Download, MapPin } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Profile } from "@/lib/types";
import { GithubIcon, LinkedinIcon, XIcon } from "../ui/Icon";
import { HeroTerminal, type TerminalCommit } from "./HeroTerminal";
import { RotatingWord } from "./RotatingWord";
import { Spotlight } from "./Spotlight";

export function Hero({
  locale,
  profile,
  commits,
  stack,
}: {
  locale: Locale;
  profile: Profile;
  commits: TerminalCommit[];
  stack: Record<string, string[]>;
}) {
  const t = getDictionary(locale).hero;
  const socials = [
    { href: profile.socials.github, label: "GitHub", Icon: GithubIcon },
    { href: profile.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: profile.socials.twitter, label: "X / Twitter", Icon: XIcon },
  ].filter((s) => s.href);

  return (
    <section id="accueil" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="bg-grid mask-fade-b pointer-events-none absolute inset-0 -z-10" />
      <Spotlight />

      <div className="container-page grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          {profile.available && (
            <p className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-line bg-elev/60 px-3.5 py-1.5 text-xs font-medium text-muted backdrop-blur">
              <span className="relative size-2 rounded-full bg-ok animate-pulse-dot" />
              {profile.availabilityLabel}
            </p>
          )}

          <p className="mb-4 font-mono text-sm text-muted">
            {profile.name} <span className="text-subtle">—</span> {profile.title}
          </p>

          <h1 className="font-display text-[2.6rem] leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl lg:text-[4.2rem]">
            {profile.headline}
          </h1>

          <p className="mt-6 text-lg text-muted md:text-xl">
            {t.specialized} <RotatingWord words={profile.rotatingRoles} />
          </p>

          <p className="mt-4 max-w-xl leading-relaxed text-muted">{profile.intro}</p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#projets"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-fg shadow-[0_8px_30px_-8px_var(--accent)] transition hover:-translate-y-0.5"
            >
              {t.seeProjects}
              <ArrowDown className="size-4 transition group-hover:translate-y-0.5" />
            </a>
            {profile.cvUrl ? (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition hover:border-fg"
              >
                <Download className="size-4" /> {t.downloadCv}
              </a>
            ) : (
              <a
                href="#contact"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-3 text-sm font-medium transition hover:border-fg"
              >
                {t.contactMe} <ArrowUpRight className="size-4" />
              </a>
            )}
          </div>

          <div className="mt-10 flex items-center gap-5 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-accent" /> {profile.location}
            </span>
            <span className="h-4 w-px bg-line-strong" />
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="transition hover:text-fg"
              >
                <Icon className="size-[18px]" />
              </a>
            ))}
          </div>
        </div>

        <HeroTerminal recentLabel={t.recentRepos} name={profile.shortName} title={profile.title} commits={commits} stack={stack} />
      </div>
    </section>
  );
}
