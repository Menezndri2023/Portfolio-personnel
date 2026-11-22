import type { Settings, SiteContent } from "./types";

/**
 * Alertes e-mail du back-office (via Resend, RESEND_API_KEY).
 *
 * Destinataire : Paramètres → Notifications (admin), sinon CONTACT_TO_EMAIL, sinon l'e-mail du profil.
 * Chaque type d'alerte s'active ou se désactive dans l'admin ; le test passe toujours.
 * Un échec d'envoi n'interrompt jamais l'action qui l'a déclenché.
 */

export type AlertKind = keyof Settings["alerts"] | "test";

export const ALERT_DEFAULTS: Settings["alerts"] = { contact: true, login: true, loginBlocked: true, outage: true };

type Alert = {
  kind: AlertKind;
  subject: string;
  /** Lignes du message (texte brut). */
  lines: string[];
  replyTo?: string;
};

export type AlertResult = { ok: true; to: string } | { ok: false; error: string };

export function alertRecipient(content: Pick<SiteContent, "settings" | "profile">): string {
  return content.settings.notifyEmail || process.env.CONTACT_TO_EMAIL || content.profile.email || "";
}

/** Date et heure lisibles, à l'heure du Maroc. */
export function nowLabel(date = new Date()) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "medium", timeZone: "Africa/Casablanca" }).format(date);
}

export async function sendAlert(alert: Alert, content?: SiteContent): Promise<AlertResult> {
  // Pas d'e-mail pendant le build (pages pré-générées) : seules les requêtes réelles alertent.
  if (process.env.NEXT_PHASE === "phase-production-build") return { ok: false, error: "build" };
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY n'est pas configurée sur le serveur." };

  let c = content;
  if (!c) {
    const { getContent } = await import("./content");
    c = await getContent();
  }
  if (alert.kind !== "test" && !{ ...ALERT_DEFAULTS, ...c.settings.alerts }[alert.kind]) return { ok: false, error: "désactivée" };
  const to = alertRecipient(c);
  if (!to) return { ok: false, error: "Aucune adresse de notification configurée." };

  const site = c.settings.siteUrl || process.env.SITE_URL || "";
  const text = [...alert.lines, "", "—", `Portfolio ${site}`.trim(), site ? `Back-office : ${site.replace(/\/$/, "")}/admin` : ""]
    .filter((l, i, all) => l !== "" || all[i - 1] !== "")
    .join("\n");

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [to],
        ...(alert.replyTo ? { reply_to: alert.replyTo } : {}),
        subject: `[Portfolio] ${alert.subject}`,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      console.error(`Alerte « ${alert.kind} » non envoyée : Resend ${res.status}`, detail);
      return { ok: false, error: `Resend ${res.status} : ${detail.slice(0, 300)}` };
    }
    return { ok: true, to };
  } catch (err) {
    console.error(`Alerte « ${alert.kind} » non envoyée`, err);
    return { ok: false, error: (err as Error).message };
  }
}

/** Contexte d'une requête pour les alertes de sécurité. */
export function requestContext(req: Request, ip: string): string[] {
  const h = req.headers;
  const where = [h.get("x-vercel-ip-city"), h.get("x-vercel-ip-country")].filter(Boolean).map((v) => decodeURIComponent(v!)).join(", ");
  return [
    `Date : ${nowLabel()}`,
    `Adresse IP : ${ip}${where ? ` (${where})` : ""}`,
    `Navigateur : ${h.get("user-agent") ?? "inconnu"}`,
  ];
}
