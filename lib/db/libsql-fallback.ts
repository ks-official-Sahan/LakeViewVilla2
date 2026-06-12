/**
 * Turso / libSQL fallback cache (remote or embedded replica).
 *
 * Works on Vercel serverless (remote libsql://) and long-running Node hosts
 * (embedded replica: local file + syncUrl). See lib/db/FALLBACK.md.
 *
 * Env (either naming convention):
 *   TURSO_DATABASE_URL / LIBSQL_DATABASE_URL — libsql://…
 *   TURSO_AUTH_TOKEN / LIBSQL_AUTH_TOKEN
 *   FALLBACK_LIBSQL_MODE — "remote" forces remote-only; default tries embedded replica
 *   FALLBACK_LIBSQL_LOCAL_PATH — local replica file (default: data/fallback.db or /tmp on Vercel)
 */
import fs from "fs";
import path from "path";
import { createClient, type Client } from "@libsql/client";
import { recordIdFor } from "./fallback-records";

let client: Client | null = null;
let libsqlUnavailable = false;
let initPromise: Promise<Client | null> | null = null;

function getTursoConfig(): { syncUrl: string; authToken: string } | null {
  const syncUrl =
    process.env.TURSO_DATABASE_URL?.trim() ||
    process.env.LIBSQL_DATABASE_URL?.trim();
  const authToken =
    process.env.TURSO_AUTH_TOKEN?.trim() ||
    process.env.LIBSQL_AUTH_TOKEN?.trim();
  if (!syncUrl || !authToken) return null;
  return { syncUrl, authToken };
}

export function isTursoConfigured(): boolean {
  return getTursoConfig() !== null;
}

function resolveLocalReplicaPath(): string {
  if (process.env.FALLBACK_LIBSQL_LOCAL_PATH) {
    return process.env.FALLBACK_LIBSQL_LOCAL_PATH;
  }
  if (process.env.VERCEL) {
    return path.join("/tmp", "lakeview-fallback.db");
  }
  return (
    process.env.FALLBACK_SQLITE_PATH ||
    path.join(process.cwd(), "data", "fallback.db")
  );
}

async function initSchema(database: Client) {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS fallback_records (
      model_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (model_name, record_id)
    )
  `);
  await database.execute(
    `CREATE INDEX IF NOT EXISTS idx_fallback_records_model ON fallback_records(model_name)`
  );
}

async function createLibsqlClient(): Promise<Client | null> {
  const turso = getTursoConfig();
  if (!turso) return null;

  try {
    const forceRemote = process.env.FALLBACK_LIBSQL_MODE === "remote";

    if (!forceRemote) {
      const localPath = resolveLocalReplicaPath();
      try {
        fs.mkdirSync(path.dirname(localPath), { recursive: true });
      } catch {
        // /tmp or existing dir
      }

      const replica = createClient({
        url: `file:${localPath}`,
        syncUrl: turso.syncUrl,
        authToken: turso.authToken,
        syncInterval: 60,
      });
      await initSchema(replica);
      console.log("[Fallback DB] Turso embedded replica ready:", localPath);
      return replica;
    }

    const remote = createClient({
      url: turso.syncUrl,
      authToken: turso.authToken,
    });
    await initSchema(remote);
    console.log("[Fallback DB] Turso remote libSQL client ready");
    return remote;
  } catch (err) {
    libsqlUnavailable = true;
    console.warn("[Fallback DB] Turso/libSQL unavailable:", err);
    return null;
  }
}

export async function getLibsqlClient(): Promise<Client | null> {
  if (libsqlUnavailable) return null;
  if (client) return client;
  if (!initPromise) {
    initPromise = createLibsqlClient().then((c) => {
      client = c;
      return c;
    });
  }
  return initPromise;
}

export async function isLibsqlAvailable(): Promise<boolean> {
  return (await getLibsqlClient()) !== null;
}

async function syncReplicaIfNeeded(database: Client) {
  if (typeof (database as Client & { sync?: () => Promise<void> }).sync === "function") {
    try {
      await (database as Client & { sync: () => Promise<void> }).sync();
    } catch (err) {
      console.warn("[Fallback DB] Turso replica sync deferred:", err);
    }
  }
}

export async function libsqlReadAll(modelName: string): Promise<any[]> {
  const database = await getLibsqlClient();
  if (!database) return [];

  try {
    const result = await database.execute({
      sql: "SELECT data FROM fallback_records WHERE model_name = ?",
      args: [modelName],
    });
    return result.rows.map((row) => JSON.parse(String(row.data)));
  } catch (err) {
    console.error(`[Fallback DB] libSQL read failed for ${modelName}:`, err);
    return [];
  }
}

export async function libsqlReplaceModel(modelName: string, records: any[]): Promise<boolean> {
  const database = await getLibsqlClient();
  if (!database) return false;

  try {
    await database.execute({
      sql: "DELETE FROM fallback_records WHERE model_name = ?",
      args: [modelName],
    });

    for (const record of records) {
      const recordId = recordIdFor(modelName, record);
      if (!recordId) continue;
      await database.execute({
        sql: `INSERT OR REPLACE INTO fallback_records (model_name, record_id, data) VALUES (?, ?, ?)`,
        args: [modelName, recordId, JSON.stringify(record)],
      });
    }

    await syncReplicaIfNeeded(database);
    return true;
  } catch (err) {
    console.error(`[Fallback DB] libSQL bulk replace failed for ${modelName}:`, err);
    return false;
  }
}

export async function libsqlUpsertRecord(modelName: string, record: any): Promise<boolean> {
  const database = await getLibsqlClient();
  if (!database) return false;

  const recordId = recordIdFor(modelName, record);
  if (!recordId) return false;

  try {
    await database.execute({
      sql: `INSERT OR REPLACE INTO fallback_records (model_name, record_id, data) VALUES (?, ?, ?)`,
      args: [modelName, recordId, JSON.stringify(record)],
    });
    await syncReplicaIfNeeded(database);
    return true;
  } catch (err) {
    console.error(`[Fallback DB] libSQL upsert failed for ${modelName}:`, err);
    return false;
  }
}

export async function libsqlDeleteRecord(modelName: string, recordId: string): Promise<boolean> {
  const database = await getLibsqlClient();
  if (!database) return false;

  try {
    await database.execute({
      sql: "DELETE FROM fallback_records WHERE model_name = ? AND record_id = ?",
      args: [modelName, recordId],
    });
    await syncReplicaIfNeeded(database);
    return true;
  } catch (err) {
    console.error(`[Fallback DB] libSQL delete failed for ${modelName}:`, err);
    return false;
  }
}
