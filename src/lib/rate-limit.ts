import { isMongoEnabled, mongo } from "./store";

/**
 * Limiteur de débit (connexion admin, formulaire de contact).
 *
 * - Avec MongoDB : compteur partagé par toutes les instances serverless
 *   (fenêtre fixe, documents supprimés automatiquement par un index TTL).
 * - Sans MongoDB, ou si la base ne répond pas : compteur en mémoire de l'instance.
 *   Il freine un abus ponctuel mais se réinitialise à chaque démarrage à froid.
 */

const MAX_KEYS = 5000;
const hits = new Map<string, number[]>();

function memoryLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  hits.delete(key);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  // Au-delà du plafond, on retire les clés les plus anciennes, jamais tout le tableau :
  // un flot d'adresses différentes ne doit pas pouvoir remettre les compteurs à zéro.
  for (const k of hits.keys()) {
    if (hits.size <= MAX_KEYS) break;
    hits.delete(k);
  }
  return true;
}

type HitDoc = { _id: string; count: number; expireAt: Date };
let ttlIndexReady: Promise<unknown> | null = null;

async function mongoLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const db = await mongo();
  const col = db.collection<HitDoc>("ratelimits");
  ttlIndexReady ??= col.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 }).catch(() => (ttlIndexReady = null));
  const bucket = Math.floor(Date.now() / windowMs);
  const doc = await col.findOneAndUpdate(
    { _id: `${key}:${bucket}` },
    { $inc: { count: 1 }, $setOnInsert: { expireAt: new Date((bucket + 1) * windowMs) } },
    { upsert: true, returnDocument: "after" },
  );
  return (doc?.count ?? 1) <= limit;
}

/** `true` si la requête est autorisée. */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  if (isMongoEnabled()) {
    try {
      return await mongoLimit(key, limit, windowMs);
    } catch (err) {
      console.error("Limiteur MongoDB indisponible, repli en mémoire", err);
    }
  }
  return memoryLimit(key, limit, windowMs);
}

/**
 * Adresse IP du visiteur.
 * Sur Vercel, `x-vercel-forwarded-for` et `x-forwarded-for` sont posés par la plateforme
 * (non falsifiables). Ailleurs, ces en-têtes ne sont fiables que derrière un proxy
 * qui les réécrit.
 */
export function clientIp(req: Request): string {
  const h = req.headers;
  const first = (v: string | null) => v?.split(",")[0]?.trim() || "";
  return first(h.get("x-vercel-forwarded-for")) || first(h.get("x-forwarded-for")) || h.get("x-real-ip") || "local";
}
