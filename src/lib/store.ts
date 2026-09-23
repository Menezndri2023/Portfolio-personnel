import { promises as fs } from "node:fs";
import path from "node:path";
import { MongoClient, type Db } from "mongodb";
import seed from "../../data/content.json";
import { emptyTranslations } from "./translations";
import type { Message, SiteContent } from "./types";

/**
 * Persistance du contenu et des messages.
 *
 * - `MONGODB_URI` défini → MongoDB (production, ex. MongoDB Atlas).
 * - sinon → fichiers JSON dans /data (développement local).
 *
 * En local, les modifications faites dans /admin sont écrites dans data/content.json :
 * il suffit de committer ce fichier pour publier le contenu sans base de données.
 */

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");
const MESSAGES_FILE = path.join(DATA_DIR, "messages.json");

const SEED = seed as unknown as SiteContent;

export class ReadOnlyStoreError extends Error {
  constructor() {
    super(
      "Le stockage est en lecture seule sur cet hébergement. Définissez MONGODB_URI pour pouvoir modifier le contenu en production.",
    );
  }
}

/** Complète un contenu stocké avec les champs ajoutés au seed depuis sa création. */
function withDefaults(stored: Partial<SiteContent> | null | undefined): SiteContent {
  if (!stored) return withDefaults({});
  return {
    ...structuredClone(SEED),
    ...stored,
    profile: { ...SEED.profile, ...stored.profile, socials: { ...SEED.profile.socials, ...stored.profile?.socials } },
    settings: { ...SEED.settings, ...stored.settings },
    translations: { en: { ...emptyTranslations(), ...SEED.translations?.en, ...stored.translations?.en } },
  };
}

/* ------------------------------------------------------------------ MongoDB */

const globalForMongo = globalThis as unknown as { _mongo?: Promise<MongoClient> };

async function mongo(): Promise<Db> {
  const uri = process.env.MONGODB_URI!;
  globalForMongo._mongo ??= new MongoClient(uri).connect();
  const client = await globalForMongo._mongo;
  return client.db(process.env.MONGODB_DB || "portfolio");
}

type ContentDoc = { _id: string; data: SiteContent };
type MessageDoc = Message & { _id: string };

/* ------------------------------------------------------------------ Fichiers */

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  try {
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n", "utf8");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === "EROFS" || code === "EACCES" || code === "EPERM") throw new ReadOnlyStoreError();
    throw err;
  }
}

/* ------------------------------------------------------------------ API */

const mongoEnabled = () => Boolean(process.env.MONGODB_URI);

export const storeKind = () => (mongoEnabled() ? "mongodb" : "fichier local");

export async function readContent(): Promise<SiteContent> {
  if (mongoEnabled()) {
    const doc = await (await mongo()).collection<ContentDoc>("content").findOne({ _id: "site" });
    return withDefaults(doc?.data);
  }
  return withDefaults(await readJson<Partial<SiteContent> | null>(CONTENT_FILE, null));
}

export async function writeContent(content: SiteContent): Promise<void> {
  if (mongoEnabled()) {
    await (await mongo())
      .collection<ContentDoc>("content")
      .updateOne({ _id: "site" }, { $set: { data: content } }, { upsert: true });
    return;
  }
  await writeJson(CONTENT_FILE, content);
}

export async function listMessages(): Promise<Message[]> {
  if (mongoEnabled()) {
    const docs = await (await mongo())
      .collection<MessageDoc>("messages")
      .find()
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return docs.map(({ _id, ...m }) => ({ ...m, id: _id }));
  }
  const all = await readJson<Message[]>(MESSAGES_FILE, []);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function insertMessage(message: Message): Promise<void> {
  if (mongoEnabled()) {
    const { id, ...rest } = message;
    await (await mongo()).collection<MessageDoc>("messages").insertOne({ _id: id, id, ...rest });
    return;
  }
  const all = await readJson<Message[]>(MESSAGES_FILE, []);
  await writeJson(MESSAGES_FILE, [message, ...all]);
}

export async function updateMessage(id: string, patch: Partial<Pick<Message, "read">>): Promise<void> {
  if (mongoEnabled()) {
    await (await mongo()).collection<MessageDoc>("messages").updateOne({ _id: id }, { $set: patch });
    return;
  }
  const all = await readJson<Message[]>(MESSAGES_FILE, []);
  await writeJson(
    MESSAGES_FILE,
    all.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  );
}

export async function deleteMessage(id: string): Promise<void> {
  if (mongoEnabled()) {
    await (await mongo()).collection<MessageDoc>("messages").deleteOne({ _id: id });
    return;
  }
  const all = await readJson<Message[]>(MESSAGES_FILE, []);
  await writeJson(
    MESSAGES_FILE,
    all.filter((m) => m.id !== id),
  );
}
