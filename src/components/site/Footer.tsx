import { ArrowUp } from "lucide-react";
import type { Profile } from "@/lib/types";
import { GithubIcon, LinkedinIcon, XIcon } from "../ui/Icon";

export function Footer({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  const socials = [
    { href: profile.socials.github, label: "GitHub", Icon: GithubIcon },
    { href: profile.socials.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
    { href: profile.socials.twitter, label: "X / Twitter", Icon: XIcon },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-line">
      <div className="container-page flex flex-col items-center justify-between gap-6 py-10 text-sm text-muted md:flex-row">
        <p>
          © {year} {profile.name}. Conçu et développé avec Next.js.
        </p>
        <div className="flex items-center gap-5">
          {socials.map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="hover:text-fg">
              <Icon className="size-4" />
            </a>
          ))}
          <a href="#top" className="inline-flex items-center gap-1.5 hover:text-fg">
            Haut de page <ArrowUp className="size-3.5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
