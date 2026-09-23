import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { defaultLocale, locales } from "@/lib/i18n";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) return guardAdmin(request, pathname);
  return routeLocale(request, pathname);
}

/**
 * Vérification rapide de la session sur tout l'espace admin.
 * Les route handlers /api/admin revérifient la session eux-mêmes (défense en profondeur).
 */
async function guardAdmin(request: NextRequest, pathname: string) {
  if (pathname === "/admin/login") return NextResponse.next();

  const ok = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const url = new URL("/admin/login", request.url);
  return NextResponse.redirect(url);
}

/**
 * Langue du site public : le français est servi sans préfixe (réécrit en interne
 * vers /fr/…), les autres langues sous leur préfixe (/en/…).
 */
function routeLocale(request: NextRequest, pathname: string) {
  const prefix = `/${defaultLocale}`;
  if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
    // /fr/projets/x → /projets/x : une seule adresse publique par page.
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(prefix.length) || "/";
    return NextResponse.redirect(url, 308);
  }
  if (locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `${prefix}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Tout sauf les API publiques, les fichiers internes de Next.js et les fichiers statiques (avec extension).
  matcher: ["/admin/:path*", "/api/admin/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
