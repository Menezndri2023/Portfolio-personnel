import Image from "next/image";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ProjectView } from "@/lib/types";
import { cn, hueFrom } from "@/lib/utils";

/**
 * Visuel d'un projet : l'image définie dans l'admin, sinon une couverture
 * générée (teinte stable dérivée du nom, titre et stack).
 */
export function ProjectCover({
  locale,
  project,
  className,
  large = false,
}: {
  locale: Locale;
  project: Pick<ProjectView, "slug" | "title" | "image" | "tags">;
  className?: string;
  large?: boolean;
}) {
  if (project.image) {
    return (
      <div className={cn("relative overflow-hidden bg-card", className)}>
        <Image
          src={project.image}
          alt={`${getDictionary(locale).projects.previewOf} ${project.title}`}
          fill
          unoptimized={project.image.startsWith("http")}
          sizes={large ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          className="object-cover object-left-top transition duration-700 group-hover:scale-[1.04]"
        />
      </div>
    );
  }

  const hue = hueFrom(project.slug);
  // Monogramme : initiales du titre (« VIT AUTO » → « VA », « PSN — … » → « PSN »).
  const words = project.title.split(/[\s—–-]+/).filter(Boolean);
  const monogram = (/^[A-Z]{2,4}$/.test(words[0] ?? "") ? words[0] : words.slice(0, 2).map((w) => w[0]).join("")).toUpperCase();
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 90% at 100% 0%, hsl(${hue} 85% 55% / 0.35), transparent 55%),
          radial-gradient(90% 80% at 0% 100%, hsl(${(hue + 40) % 360} 80% 50% / 0.22), transparent 60%),
          var(--card)`,
      }}
      aria-hidden
    >
      <div className="bg-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-0 flex flex-col justify-between p-6">
        <div className="flex gap-1.5">
          <span className="size-2 rounded-full bg-fg/25" />
          <span className="size-2 rounded-full bg-fg/25" />
          <span className="size-2 rounded-full bg-fg/25" />
        </div>
        <div className="transition duration-500 group-hover:-translate-y-1">
          <p
            className={cn(
              "font-display font-bold leading-none tracking-tighter text-fg/15",
              large ? "text-8xl md:text-[10rem]" : "text-7xl",
            )}
          >
            {monogram}
          </p>
          <p className="mt-3 font-mono text-[11px] text-fg/55">{project.tags.slice(0, 4).join("  ·  ")}</p>
        </div>
      </div>
    </div>
  );
}
