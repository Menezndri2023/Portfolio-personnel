import { cache } from "react";
import type { Locale } from "./i18n";
import { readContent } from "./store";
import { localize } from "./translations";

/** Contenu du site, lu une seule fois par rendu. */
export const getContent = cache(readContent);

/** Contenu dans la langue de la page (les champs non traduits restent en français). */
export const getLocalizedContent = cache(async (locale: Locale) => localize(await getContent(), locale));
