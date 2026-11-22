import { ImageResponse } from "next/og";

/**
 * Image de partage (Open Graph / X) aux couleurs du site : fond sombre,
 * grille, accent orange et logo « M ». Utilisée par les fichiers opengraph-image.tsx.
 */

export const ogSize = { width: 1200, height: 630 };

const BG = "#0a0b0f";
const FG = "#eceef3";
const MUTED = "#9aa0ae";
const ACCENT = "#ff6a33";

export function renderOgImage({
  eyebrow,
  title,
  subtitle,
  tags = [],
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  footer: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: BG,
          backgroundImage: `radial-gradient(70% 90% at 100% 0%, rgba(255,106,51,0.28), transparent 60%), linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 48px 48px, 48px 48px",
          color: FG,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="16" fill="#14161d" />
            <path d="M16 46V18h6l10 14 10-14h6v28h-7V30l-9 12-9-12v16z" fill={ACCENT} />
          </svg>
          <span style={{ fontSize: 26, color: MUTED, letterSpacing: 4, textTransform: "uppercase" }}>{eyebrow}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span style={{ fontSize: title.length > 40 ? 64 : 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </span>
          {subtitle && (
            <span style={{ fontSize: 30, color: MUTED, lineHeight: 1.35, maxWidth: 980 }}>
              {subtitle.length > 150 ? `${subtitle.slice(0, 147)}…` : subtitle}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {tags.slice(0, 4).map((t) => (
              <span
                key={t}
                style={{
                  fontSize: 22,
                  color: MUTED,
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  padding: "6px 14px",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 26, color: ACCENT }}>{footer}</span>
        </div>
      </div>
    ),
    ogSize,
  );
}

/** Domaine affiché en bas de l'image (« manasse.dev »). */
export const displayHost = (base: string) => base.replace(/^https?:\/\//, "") || "Portfolio";
