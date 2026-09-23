import type { SkillGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "../ui/Icon";
import { Reveal } from "../ui/Reveal";
import { SectionHeading } from "../ui/SectionHeading";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  const all = groups.flatMap((g) => g.items);

  return (
    <section id="competences" className="py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          index="02"
          eyebrow="Compétences"
          title="Une stack JavaScript de bout en bout."
          lead="Le même langage de la base de données jusqu'au navigateur : moins de friction, plus de vitesse de livraison."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {groups.map((g, i) => (
            <Reveal key={g.id} delay={i * 0.06}>
              <article
                className={cn(
                  "group h-full rounded-3xl border p-7 transition",
                  g.learning
                    ? "border-dashed border-line-strong bg-transparent"
                    : "border-line bg-card hover:border-line-strong",
                )}
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight">{g.title}</h3>
                    {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
                  </div>
                  <span
                    className={cn(
                      "grid size-10 shrink-0 place-items-center rounded-xl transition group-hover:rotate-6",
                      g.learning ? "border border-dashed border-line-strong text-muted" : "bg-accent-soft text-accent",
                    )}
                  >
                    <Icon name={g.icon} className="size-5" />
                  </span>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((item) => (
                    <li
                      key={item}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm transition",
                        g.learning
                          ? "border-dashed border-line-strong text-muted"
                          : "border-line bg-bg hover:border-accent hover:text-accent",
                      )}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {all.length > 0 && (
        <div className="mask-fade-x mt-20 overflow-hidden border-y border-line py-6" aria-hidden>
          <div className="flex w-max animate-marquee gap-10 font-display text-3xl font-semibold tracking-tight text-subtle/60 md:text-4xl">
            {[...all, ...all].map((s, i) => (
              <span key={i} className="flex items-center gap-10">
                {s}
                <span className="text-accent">✦</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
