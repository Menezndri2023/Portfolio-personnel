import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, checkPassword, createSessionToken } from "@/lib/auth";
import { requestContext, sendAlert } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const WINDOW = 15 * 60_000;

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (!(await rateLimit(`login:${ip}`, 5, WINDOW))) {
    // Une seule alerte par adresse et par fenêtre de blocage, pour ne pas inonder la boîte mail.
    if (await rateLimit(`alert:login-blocked:${ip}`, 1, WINDOW)) {
      await sendAlert({
        kind: "loginBlocked",
        subject: "Connexion à l'admin bloquée après trop de tentatives",
        lines: [
          "Plus de 5 mots de passe incorrects en 15 minutes : les tentatives depuis cette adresse sont bloquées pendant 15 minutes.",
          "",
          ...requestContext(req, ip),
          "",
          "Si ce n'est pas vous, aucune action n'est nécessaire : le blocage est automatique. Vérifiez que votre mot de passe admin est long et unique.",
        ],
      });
    }
    return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
  }
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD n'est pas configuré sur le serveur." }, { status: 500 });
  }

  const body = (await req.json().catch(() => ({}))) as { password?: unknown };
  const password = typeof body.password === "string" ? body.password : "";
  if (!(await checkPassword(password))) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  await sendAlert({
    kind: "login",
    subject: "Nouvelle connexion au back-office",
    lines: [
      "Une connexion au back-office vient de réussir.",
      "",
      ...requestContext(req, ip),
      "",
      "Si ce n'est pas vous : changez immédiatement ADMIN_PASSWORD et AUTH_SECRET sur Vercel (ce qui déconnecte toutes les sessions), puis redéployez.",
    ],
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
