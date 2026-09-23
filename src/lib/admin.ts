import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./auth";
import { ReadOnlyStoreError } from "./store";

/** Renvoie une réponse 401 si la requête ne provient pas d'un administrateur connecté. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return (await verifySessionToken(token)) ? null : NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

export function errorResponse(err: unknown) {
  if (err instanceof ReadOnlyStoreError) {
    return NextResponse.json({ error: err.message }, { status: 503 });
  }
  console.error(err);
  return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
}
