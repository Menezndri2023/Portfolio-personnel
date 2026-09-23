import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/admin";
import { GITHUB_TAG, fetchRepos } from "@/lib/github";
import { readContent, writeContent } from "@/lib/store";

/** Liste fraîche des dépôts (sans cache), pour le gestionnaire de projets. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const content = await readContent();
  const repos = await fetchRepos(content.settings.githubUsername, { fresh: true });
  return NextResponse.json({
    repos: repos ?? content.githubSnapshot?.repos ?? [],
    live: Boolean(repos),
    syncedAt: content.githubSnapshot?.syncedAt ?? null,
  });
}

/** Synchronisation immédiate : relit GitHub, enregistre un instantané et régénère le site. */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const content = await readContent();
    const repos = await fetchRepos(content.settings.githubUsername, { fresh: true });
    if (!repos) {
      return NextResponse.json(
        { error: "GitHub ne répond pas (limite d'API atteinte ?). Ajoutez GITHUB_TOKEN ou réessayez plus tard." },
        { status: 502 },
      );
    }
    const syncedAt = new Date().toISOString();
    await writeContent({ ...content, githubSnapshot: { syncedAt, repos } });
    revalidateTag(GITHUB_TAG, { expire: 0 });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, count: repos.length, syncedAt });
  } catch (err) {
    return errorResponse(err);
  }
}
