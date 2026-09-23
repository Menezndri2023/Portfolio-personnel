import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

/** Applique le thème avant le premier rendu pour éviter le flash. Clair par défaut. */
const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:'light'}catch(e){document.documentElement.dataset.theme='light'}})()`;

/** Squelette HTML commun aux deux layouts racines (site public et back-office). */
export function RootHtml({ lang, children }: { lang: string; children: React.ReactNode }) {
  return (
    <html
      lang={lang}
      data-theme="light"
      suppressHydrationWarning
      className={`${inter.variable} ${grotesk.variable} ${mono.variable}`}
    >
      {/* Rendu par les layouts racines de app/ : la règle vise next/head des pages classiques. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
