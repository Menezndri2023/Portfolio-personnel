import Link from "next/link";
import { lang } from "next/root-params";
import { getDictionary, isLocale, localePath } from "@/lib/i18n";

export default async function NotFound() {
  const current = await lang().catch(() => undefined);
  const locale = current && isLocale(current) ? current : "fr";
  const t = getDictionary(locale).notFound;
  return (
    <main className="bg-grid grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm text-accent">{t.code}</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight md:text-7xl">{t.title}</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">{t.text}</p>
        <Link
          href={localePath(locale)}
          className="mt-8 inline-flex rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition hover:bg-accent hover:text-accent-fg"
        >
          {t.back}
        </Link>
      </div>
    </main>
  );
}
