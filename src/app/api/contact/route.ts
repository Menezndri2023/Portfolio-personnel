import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/admin";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getDictionary, type Locale } from "@/lib/i18n";
import { sendAlert } from "@/lib/notify";
import { contactSchema } from "@/lib/schemas";
import { ReadOnlyStoreError, insertMessage } from "@/lib/store";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const lang: Locale = body?.lang === "en" ? "en" : "fr";
  const t = getDictionary(lang).contactErrors;

  if (!(await rateLimit(`contact:${clientIp(req)}`, 3, 10 * 60_000))) {
    return NextResponse.json({ error: t.rateLimit }, { status: 429 });
  }

  const parsed = contactSchema(t).safeParse(body ?? {});
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
    lang,
  };

  // Le message est enregistré ET envoyé par e-mail : si l'un des deux échoue, l'autre suffit.
  let stored = true;
  let storeError: unknown = null;
  try {
    await insertMessage(message);
  } catch (err) {
    stored = false;
    storeError = err;
    console.error("Message non enregistré", err);
  }

  const alert = await sendAlert({
    kind: "contact",
    subject: `Nouveau message : ${message.subject || "sans sujet"} (${message.name})`,
    replyTo: message.email,
    lines: [
      `De : ${message.name} <${message.email}>`,
      `Sujet : ${message.subject || "(aucun)"}`,
      `Langue du site : ${lang === "en" ? "anglais" : "français"}`,
      "",
      message.message,
      "",
      "Répondez directement à cet e-mail pour écrire à l'expéditeur.",
      ...(stored ? [] : ["", "⚠ Ce message n'a pas pu être enregistré dans le back-office (base indisponible) : cet e-mail en est la seule copie."]),
    ],
  });

  if (!stored && !alert.ok) {
    // Ni enregistré ni envoyé : le visiteur doit le savoir pour réessayer ou écrire directement.
    return storeError instanceof ReadOnlyStoreError
      ? NextResponse.json({ error: t.unavailable }, { status: 503 })
      : errorResponse(storeError);
  }
  return NextResponse.json({ ok: true });
}
