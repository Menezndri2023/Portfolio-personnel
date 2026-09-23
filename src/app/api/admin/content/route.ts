import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/admin";
import { sectionSchemas, type EditableSection } from "@/lib/schemas";
import { readContent, storeKind, writeContent } from "@/lib/store";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json({ content: await readContent(), store: storeKind() });
  } catch (err) {
    return errorResponse(err);
  }
}

/** Remplace une section du contenu : { section: "skills", data: [...] }. */
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as { section?: string; data?: unknown } | null;
  const section = body?.section as EditableSection | undefined;
  if (!section || !(section in sectionSchemas)) {
    return NextResponse.json({ error: "Section inconnue" }, { status: 400 });
  }

  const parsed = sectionSchemas[section].safeParse(body?.data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return NextResponse.json(
      { error: `${issue.path.join(" › ") || section} : ${issue.message}` },
      { status: 422 },
    );
  }

  try {
    const content = await readContent();
    await writeContent({ ...content, [section]: parsed.data });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
