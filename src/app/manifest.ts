import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

// Généré à chaque requête : toujours aligné sur le contenu de l'admin (lecture légère, dépôts GitHub en cache 1 h).
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { profile, settings } = await getContent();
  return {
    name: settings.seoTitle || profile.name,
    short_name: profile.shortName || profile.name,
    description: settings.seoDescription,
    start_url: "/",
    display: "browser",
    background_color: "#0a0b0f",
    theme_color: "#0a0b0f",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
