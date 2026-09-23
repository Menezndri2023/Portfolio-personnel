import Link from "next/link";

export default function NotFound() {
  return (
    <main className="bg-grid grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="font-mono text-sm text-accent">Erreur 404</p>
        <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight md:text-7xl">Page introuvable.</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Ce contenu a peut-être été déplacé, ou le projet n&apos;est plus public.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-fg px-6 py-3 text-sm font-medium text-bg transition hover:bg-accent hover:text-accent-fg"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
