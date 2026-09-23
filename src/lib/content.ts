import { cache } from "react";
import { readContent } from "./store";

/** Contenu du site, lu une seule fois par rendu. */
export const getContent = cache(readContent);
