import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/schemas";
import { insertMessage } from "@/lib/store";
import { getContent } from "@/lib/content";

export async function POST(req: Request) {
  if (!rateLimit(`contact:${clientIp(req)}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: "Trop de messages envoyés. Réessayez un peu plus tard." }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }
  const { website, ...data } = parsed.data;
  // Robot détecté par le champ piège : on répond « ok » sans rien enregistrer.
  if (website) return NextResponse.json({ ok: true });

  const message = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
    read: false,
  };

  try {
    await insertMessage(message);
  } catch (err) {
    return errorResponse(err);
  }

  await notifyByEmail(message).catch((err) => console.error("Notification e-mail échouée", err));
  return NextResponse.json({ ok: true });
}

/** Notification e-mail facultative via Resend (RESEND_API_KEY). */
async function notifyByEmail(m: { name: string; email: string; subject: string; message: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const { profile } = await getContent();
  const to = process.env.CONTACT_TO_EMAIL || profile.email;
  if (!to) return;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: m.email,
      subject: `Portfolio — ${m.subject || "Nouveau message"} (${m.name})`,
      text: `${m.name} <${m.email}>\n\n${m.message}`,
    }),
  });
  // Resend répond en JSON même en cas d'erreur (clé invalide, destinataire non autorisé…).
  if (!res.ok) throw new Error(`Resend ${res.status} : ${await res.text()}`);
}
