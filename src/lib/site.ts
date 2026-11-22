import type { Settings } from "./types";

/**
 * URL publique du site, sans barre finale.
 *
 * Ordre de priorité : réglage de l'admin (Paramètres → URL publique), puis la
 * variable SITE_URL, puis le domaine de production fourni par Vercel.
 * Sans URL, les liens canoniques restent relatifs et le sitemap est vide.
 */
export function siteUrl(settings: Pick<Settings, "siteUrl">): string {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = settings.siteUrl || process.env.SITE_URL || (vercel ? `https://${vercel}` : "");
  return url.trim().replace(/\/+$/, "");
}
