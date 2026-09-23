"use client";

import { ArrowLeft, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const password = new FormData(e.currentTarget).get("password");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.replace("/admin");
      return;
    }
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setError(data.error ?? "Connexion impossible");
    setLoading(false);
  }

  return (
    <main className="bg-grid grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Retour au site
        </Link>
        <form onSubmit={onSubmit} className="rounded-3xl border border-line bg-elev p-8 shadow-2xl">
          <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent">
            <Lock className="size-5" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-semibold tracking-tight">Back-office</h1>
          <p className="mt-1 text-sm text-muted">Espace réservé à l&apos;administrateur du portfolio.</p>
          <label className="mt-6 block">
            <span className="mb-1.5 block text-sm font-medium">Mot de passe</span>
            <input name="password" type="password" required autoFocus autoComplete="current-password" className="field" />
          </label>
          {error && (
            <p className="mt-3 text-sm text-accent" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-semibold text-accent-fg disabled:opacity-60"
          >
            {loading && <Loader2 className="size-4 animate-spin" />} Se connecter
          </button>
        </form>
      </div>
    </main>
  );
}
