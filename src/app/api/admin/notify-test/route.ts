import { NextResponse } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/admin";
import { alertRecipient, nowLabel, sendAlert } from "@/lib/notify";
import { readContent } from "@/lib/store";

/** Envoie un e-mail de test au destinataire des alertes (toujours envoyé, même si des alertes sont désactivées). */
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const content = await readContent();
    const result = await sendAlert(
      {
        kind: "test",
        subject: "E-mail de test des alertes",
        lines: [
          "Les alertes du portfolio arrivent bien à cette adresse.",
          "",
          `Date : ${nowLabel()}`,
          `Destinataire : ${alertRecipient(content)}`,
          "",
          "Vous pouvez choisir les alertes reçues dans le back-office : Paramètres → Notifications par e-mail.",
        ],
      },
      content,
    );
    return result.ok ? NextResponse.json(result) : NextResponse.json({ error: result.error }, { status: 502 });
  } catch (err) {
    return errorResponse(err);
  }
}
