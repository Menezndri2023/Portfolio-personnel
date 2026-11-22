import { after } from "next/server";
import { cache } from "react";
import type { Locale } from "./i18n";
import { readContent, seedContent } from "./store";
import { localize } from "./translations";

/**
 * Contenu du site public, lu une seule fois par rendu.
 *
 * Si la base est injoignable (cluster en pause, panne réseau), le site reste en
 * ligne avec le contenu de data/content.json au lieu de renvoyer une erreur ou de
 * faire échouer le build. L'admin, lui, lit la base directement (lib/store) :
 * il n'enregistre jamais par-dessus ce contenu de secours.
 */
export const getContent = cache(async () => {
  try {
    return await readContent();
  } catch (err) {
    console.error("Lecture du contenu impossible, repli sur data/content.json", err);
    const fallback = seedContent();
    alertOutage(fallback, err);
    return fallback;
  }
});

/** Au plus une alerte « base injoignable » par heure et par instance (la base ne peut pas servir de compteur ici). */
let lastOutageAlert = 0;
function alertOutage(fallback: Awaited<ReturnType<typeof seedContent>>, err: unknown) {
  if (Date.now() - lastOutageAlert < 60 * 60_000) return;
  lastOutageAlert = Date.now();
  const task = () =>
    import("./notify").then(({ nowLabel, sendAlert }) =>
    sendAlert(
      {
        kind: "outage",
        subject: "Base de données injoignable",
        lines: [
          "La base MongoDB ne répond pas : le site public reste en ligne avec le contenu de secours (data/content.json), mais l'admin et le formulaire de contact peuvent échouer.",
          "",
          `Date : ${nowLabel()}`,
          `Erreur : ${err instanceof Error ? err.message : String(err)}`,
          "",
          "À vérifier : l'état du cluster dans MongoDB Atlas (pause, quota, accès réseau) et la variable MONGODB_URI sur Vercel.",
        ],
      },
      fallback,
    ),
  );
  // after() garde la fonction serverless active jusqu'à l'envoi ; hors requête, envoi direct.
  try {
    after(task);
  } catch {
    void task();
  }
}

/** Contenu dans la langue de la page (les champs non traduits restent en français). */
export const getLocalizedContent = cache(async (locale: Locale) => localize(await getContent(), locale));
