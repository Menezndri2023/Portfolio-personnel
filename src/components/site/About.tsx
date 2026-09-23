import Image from "next/image";
import { Languages, Sparkle } from "lucide-react";
import type { Profile, Service } from "@/lib/types";
import { Icon } from "../ui/Icon";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function About({ profile, services }: { profile: Profile; services: Service[] }) {
  const paragraphs = profile.bio.split(/\n\s*\n/).filter(Boolean);

  return (
    <section id="a-propos" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          index="01"
          eyebrow="À propos"
          title="Du besoin métier à la mise en production."
        />

        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <figure className="group relative">
              <div className="absolute -inset-3 -z-10 rotate-[-2deg] rounded-[1.75rem] border border-dashed border-line-strong transition group-hover:rotate-0" />
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-card">
                {profile.photo && (
                  <Image
                    src={profile.photo}
                    alt={`Portrait de ${profile.name}`}
                    fill
                    unoptimized={profile.photo.startsWith("http")}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                )}
              </div>
              {profile.photoCaption && (
                <figcaption className="mt-4 flex items-center gap-2 font-mono text-xs text-subtle">
                  <Sparkle className="size-3.5 text-accent" />
                  {profile.photoCaption}
                </figcaption>
              )}
            </figure>
          </Reveal>

          <div>
            <Reveal className="space-y-5 text-lg leading-relaxed text-muted">
              {paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "text-fg" : ""}>
                  {p}
                </p>
              ))}
            </Reveal>

            <Reveal delay={0.1} className="mt-10 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-subtle">
                  <Languages className="size-3.5" /> Langues
                </h3>
                <ul className="space-y-2">
                  {profile.languages.map((l) => (
                    <li key={l.name} className="flex justify-between border-b border-line pb-2 text-sm">
                      <span>{l.name}</span>
                      <span className="text-muted">{l.level}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-subtle">Savoir-être</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {profile.softSkills.map((s) => (
                    <li key={s} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>

        {services.length > 0 && (
          <div className="mt-24 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.06} className="group bg-bg p-7 transition hover:bg-elev">
                <span className="mb-6 grid size-11 place-items-center rounded-xl bg-accent-soft text-accent transition group-hover:scale-110">
                  <Icon name={s.icon} className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
