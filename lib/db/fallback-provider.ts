/**
 * Layered offline fallback: SQLite (first) → JSON (last resort).
 *
 * Read path:  SQLite → JSON file (data/fallback_db.json)
 * Write path: SQLite → JSON file (only when SQLite fails)
 * Sync queue: always JSON (data/fallback_sync_queue.json) for Postgres replay
 */
import {
  readJsonFallbackData,
  writeJsonFallbackData,
  addToSyncQueue,
  getSyncQueue,
  removeQueueItem,
} from "./fallback-store";
import {
  isSqliteAvailable,
  recordIdFor,
  sqliteDeleteRecord,
  sqliteReadAll,
  sqliteReplaceModel,
  sqliteUpsertRecord,
} from "./sqlite-fallback";

export { addToSyncQueue, getSyncQueue, removeQueueItem };

/** Models mirrored for site + admin offline operation */
export const FALLBACK_MODELS = [
  "user",
  "setting",
  "contentBlock",
  "blogPost",
  "mediaAsset",
  "mediaLocation",
  "auditLog",
] as const;

let jsonHydrated = false;

function hydrateSqliteFromJsonOnce() {
  if (jsonHydrated || !isSqliteAvailable()) return;
  jsonHydrated = true;

  for (const modelName of FALLBACK_MODELS) {
    const sqliteRows = sqliteReadAll(modelName);
    if (sqliteRows.length > 0) continue;

    const jsonRows = readJsonFallbackData(modelName);
    if (jsonRows.length > 0) {
      sqliteReplaceModel(modelName, jsonRows);
      console.log(`[Fallback DB] Hydrated SQLite ${modelName} from JSON (${jsonRows.length} rows)`);
    }
  }
}

export function readFallbackData(modelName: string): any[] {
  hydrateSqliteFromJsonOnce();

  if (isSqliteAvailable()) {
    const rows = sqliteReadAll(modelName);
    if (rows.length > 0) {
      return rows;
    }
  }

  return readJsonFallbackData(modelName);
}

export function writeFallbackData(modelName: string, records: any[]) {
  if (isSqliteAvailable()) {
    const ok = sqliteReplaceModel(modelName, records);
    if (ok) return;
  }

  writeJsonFallbackData(modelName, records);
}

function upsertLocalRecord(modelName: string, record: any) {
  if (isSqliteAvailable() && sqliteUpsertRecord(modelName, record)) {
    return;
  }

  const existing = readJsonFallbackData(modelName);
  const id = recordIdFor(modelName, record);
  if (!id) {
    existing.push(record);
  } else {
    const idx = existing.findIndex((r) => recordIdFor(modelName, r) === id);
    if (idx >= 0) {
      existing[idx] = record;
    } else {
      existing.push(record);
    }
  }
  writeJsonFallbackData(modelName, existing);
}

function deleteLocalRecord(modelName: string, where: Record<string, unknown>) {
  const id =
    modelName === "setting" && typeof where.key === "string"
      ? where.key
      : typeof where.id === "string"
        ? where.id
        : null;

  if (!id) return;

  if (isSqliteAvailable() && sqliteDeleteRecord(modelName, id)) {
    return;
  }

  const filtered = readJsonFallbackData(modelName).filter(
    (r) => recordIdFor(modelName, r) !== id
  );
  writeJsonFallbackData(modelName, filtered);
}

function findLocalRecord(modelName: string, where: Record<string, unknown>): any | null {
  const records = readFallbackData(modelName);
  return (
    records.find((r) => {
      for (const [key, val] of Object.entries(where)) {
        if (r[key] !== val) return false;
      }
      return true;
    }) ?? null
  );
}

export function applyOfflineCreate(modelName: string, data: Record<string, unknown>) {
  const now = new Date().toISOString();
  const record =
    modelName === "setting"
      ? { ...data, updatedAt: now }
      : {
          id: typeof data.id === "string" ? data.id : `offline_${Date.now()}`,
          ...data,
          createdAt: (data.createdAt as string) ?? now,
          updatedAt: (data.updatedAt as string) ?? now,
        };

  upsertLocalRecord(modelName, record);
  return record;
}

export function applyOfflineUpdate(
  modelName: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>
) {
  const existing = findLocalRecord(modelName, where);
  const base = existing ?? where;
  const record = {
    ...base,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  upsertLocalRecord(modelName, record);
  return record;
}

export function applyOfflineDelete(modelName: string, where: Record<string, unknown>) {
  const existing = findLocalRecord(modelName, where);
  deleteLocalRecord(modelName, where);
  return existing ?? { ...where };
}

export function applyOfflineUpsert(
  modelName: string,
  create: Record<string, unknown>,
  update: Record<string, unknown>,
  where?: Record<string, unknown>
) {
  const whereKey =
    where ??
    (modelName === "setting" && typeof create.key === "string"
      ? { key: create.key }
      : typeof create.id === "string"
        ? { id: create.id }
        : null);

  if (whereKey && findLocalRecord(modelName, whereKey)) {
    return applyOfflineUpdate(modelName, whereKey, { ...create, ...update });
  }

  return applyOfflineCreate(modelName, { ...create, ...update });
}

export async function warmSqliteFromPostgres(client: Record<string, unknown>) {
  if (!isSqliteAvailable()) return;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = client[modelName] as { findMany?: (args?: unknown) => Promise<any[]> };
      if (!model?.findMany) continue;

      const records = await model.findMany();
      if (records.length > 0) {
        sqliteReplaceModel(modelName, records);
      }
    } catch (err) {
      console.warn(`[Fallback DB] Warm cache skipped for ${modelName}:`, err);
    }
  }

  console.log("[Fallback DB] SQLite warm cache complete");
}
