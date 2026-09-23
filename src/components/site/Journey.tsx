import { Briefcase, GraduationCap } from "lucide-react";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Education, Experience } from "@/lib/types";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function Journey({
  locale,
  experiences,
  education,
}: {
  locale: Locale;
  experiences: Experience[];
  education: Education[];
}) {
  const t = getDictionary(locale).journey;
  return (
    <section id="parcours" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          index="04"
          eyebrow={t.eyebrow}
          title={t.title}
          lead={t.lead}
        />

        <div className="grid gap-16 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <h3 className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-subtle">
              <Briefcase className="size-4 text-accent" /> {t.experiences}
            </h3>
            <ol className="relative space-y-10 border-l border-line pl-8">
              {experiences.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.05}>
                  <li className="relative">
                    <span
                      className={`absolute -left-[37px] top-1.5 size-[11px] rounded-full border-2 ${
                        e.current ? "border-accent bg-accent" : "border-line-strong bg-bg"
                      }`}
                    />
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {e.period && <span className="font-mono text-xs text-accent">{e.period}</span>}
                      {e.current && (
                        <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                          {t.current}
                        </span>
                      )}
                    </div>
                    <h4 className="mt-1.5 font-display text-xl font-semibold tracking-tight">{e.role}</h4>
                    <p className="text-sm text-muted">
                      {[e.company, e.location].filter(Boolean).join(" · ")}
                    </p>
                    {e.summary && <p className="mt-3 leading-relaxed text-muted">{e.summary}</p>}
                    {e.highlights.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {e.highlights.map((h) => (
                          <li key={h} className="flex gap-2.5 text-sm text-muted">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    {e.tags.length > 0 && (
                      <ul className="mt-4 flex flex-wrap gap-1.5">
                        {e.tags.map((t) => (
                          <li key={t} className="rounded-md bg-elev px-2 py-0.5 font-mono text-[11px] text-muted">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="mb-8 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-subtle">
              <GraduationCap className="size-4 text-accent" /> {t.education}
            </h3>
            <div className="space-y-4">
              {education.map((ed, i) => (
                <Reveal key={ed.id} delay={i * 0.05}>
                  <article className="rounded-3xl border border-line bg-card p-6 transition hover:border-line-strong">
                    {ed.period && <p className="font-mono text-xs text-accent">{ed.period}</p>}
                    <h4 className="mt-1 font-display text-lg font-semibold tracking-tight">{ed.title}</h4>
                    <p className="text-sm text-muted">{ed.school}</p>
                    {ed.highlights.length > 0 && (
                      <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                        {ed.highlights.map((h) => (
                          <li key={h} className="flex gap-2.5 text-sm text-muted">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-subtle" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
