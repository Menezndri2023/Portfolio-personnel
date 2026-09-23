import type { Metadata } from "next";
import { RootHtml } from "@/components/RootHtml";
import "../globals.css";

export const metadata: Metadata = {
  title: "Back-office",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RootHtml lang="fr">{children}</RootHtml>;
}
