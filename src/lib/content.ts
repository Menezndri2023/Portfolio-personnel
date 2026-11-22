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
    return seedContent();
  }
});

/** Contenu dans la langue de la page (les champs non traduits restent en français). */
export const getLocalizedContent = cache(async (locale: Locale) => localize(await getContent(), locale));
