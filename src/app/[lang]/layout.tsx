import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { RootHtml } from "@/components/RootHtml";
import { getLocalizedContent } from "@/lib/content";
import { alternateLanguages, getDictionary, isLocale, localePath, locales } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { settings, profile } = await getLocalizedContent(lang);
  const base = siteUrl(settings);
  const other = locales.filter((l) => l !== lang).map((l) => getDictionary(l).ogLocale);
  return {
    metadataBase: base ? new URL(base) : undefined,
    title: { default: settings.seoTitle, template: `%s — ${profile.shortName}` },
    description: settings.seoDescription,
    applicationName: profile.name,
    authors: [{ name: profile.name, url: base || undefined }],
    creator: profile.name,
    alternates: {
      canonical: localePath(lang),
      languages: alternateLanguages("/"),
    },
    // L'image de partage est générée par opengraph-image.tsx (1200 × 630, une par langue).
    openGraph: {
      type: "website",
      siteName: profile.name,
      locale: getDictionary(lang).ogLocale,
      alternateLocale: other,
      url: localePath(lang),
      title: settings.seoTitle,
      description: settings.seoDescription,
    },
    twitter: { card: "summary_large_image", title: settings.seoTitle, description: settings.seoDescription },
    icons: { icon: "/icon.svg", apple: "/apple-touch-icon.png" },
    manifest: "/manifest.webmanifest",
    // Codes fournis par Google Search Console et Bing Webmaster Tools (variables d'environnement).
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
      other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0f" },
    { media: "(prefers-color-scheme: light)", color: "#f7f6f2" },
  ],
};

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <RootHtml lang={lang}>{children}</RootHtml>;
}
