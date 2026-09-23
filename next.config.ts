import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  // Masque le bouton flottant « N » de Next.js en développement.
  devIndicators: false,
  // Le store local lit data/content.json : on l'embarque dans les fonctions serverless.
  outputFileTracingIncludes: { "/**": ["./data/content.json"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
