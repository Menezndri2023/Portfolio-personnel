import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { RootHtml } from "@/components/RootHtml";
import { getLocalizedContent } from "@/lib/content";
import { getDictionary, isLocale, localePath, locales } from "@/lib/i18n";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { settings, profile } = await getLocalizedContent(lang);
  return {
    metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined,
    title: { default: settings.seoTitle, template: `%s — ${profile.shortName}` },
    description: settings.seoDescription,
    authors: [{ name: profile.name }],
    alternates: {
      canonical: localePath(lang),
      languages: Object.fromEntries(locales.map((l) => [l, localePath(l)])),
    },
    openGraph: {
      type: "website",
      locale: getDictionary(lang).ogLocale,
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: profile.photo ? [profile.photo] : undefined,
    },
    twitter: { card: "summary_large_image", title: settings.seoTitle, description: settings.seoDescription },
    icons: { icon: "/icon.svg" },
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
