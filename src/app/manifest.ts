import type { MetadataRoute } from "next";
import { getContent } from "@/lib/content";

export const revalidate = 3600;

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
