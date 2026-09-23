import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { getContent } from "@/lib/content";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const { settings, profile } = await getContent();
  return {
    metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined,
    title: { default: settings.seoTitle, template: `%s — ${profile.shortName}` },
    description: settings.seoDescription,
    authors: [{ name: profile.name }],
    openGraph: {
      type: "website",
      locale: "fr_FR",
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

/** Applique le thème avant le premier rendu pour éviter le flash. Clair par défaut. */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
