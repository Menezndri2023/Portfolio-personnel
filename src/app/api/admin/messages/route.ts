import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/admin";
import { deleteMessage, listMessages, updateMessage } from "@/lib/store";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json({ messages: await listMessages() });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PATCH(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const body = (await req.json().catch(() => null)) as { id?: unknown; read?: unknown } | null;
  if (typeof body?.id !== "string" || typeof body.read !== "boolean") {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  try {
    await updateMessage(body.id, { read: body.read });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  try {
    await deleteMessage(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
