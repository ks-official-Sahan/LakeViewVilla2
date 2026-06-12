/**
 * Layered offline fallback: Turso/libSQL → local SQLite → JSON (last resort).
 *
 * Sync queue: JSON file (data/fallback_sync_queue.json) for Neon replay.
 */
import {
  readJsonFallbackData,
  writeJsonFallbackData,
  addToSyncQueue,
  getSyncQueue,
  removeQueueItem,
} from "./fallback-store";
import {
  cacheDeleteRecord,
  cacheReadAll,
  cacheReplaceModel,
  cacheUpsertRecord,
  isCacheTierAvailable,
  recordIdFor,
} from "./fallback-cache";

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

async function hydrateCacheFromJsonOnce() {
  if (jsonHydrated || !(await isCacheTierAvailable())) return;
  jsonHydrated = true;

  for (const modelName of FALLBACK_MODELS) {
    const cacheRows = await cacheReadAll(modelName);
    if (cacheRows.length > 0) continue;

    const jsonRows = readJsonFallbackData(modelName);
    if (jsonRows.length > 0) {
      await cacheReplaceModel(modelName, jsonRows);
      console.log(
        `[Fallback DB] Hydrated cache ${modelName} from JSON (${jsonRows.length} rows)`
      );
    }
  }
}

export async function readFallbackData(modelName: string): Promise<any[]> {
  await hydrateCacheFromJsonOnce();

  const cacheRows = await cacheReadAll(modelName);
  if (cacheRows.length > 0) {
    return cacheRows;
  }

  return readJsonFallbackData(modelName);
}

export async function writeFallbackData(modelName: string, records: any[]) {
  const ok = await cacheReplaceModel(modelName, records);
  if (ok) return;

  writeJsonFallbackData(modelName, records);
}

async function upsertLocalRecord(modelName: string, record: any) {
  if (await cacheUpsertRecord(modelName, record)) {
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

async function deleteLocalRecord(modelName: string, where: Record<string, unknown>) {
  const id =
    modelName === "setting" && typeof where.key === "string"
      ? where.key
      : typeof where.id === "string"
        ? where.id
        : null;

  if (!id) return;

  if (await cacheDeleteRecord(modelName, id)) {
    return;
  }

  const filtered = readJsonFallbackData(modelName).filter(
    (r) => recordIdFor(modelName, r) !== id
  );
  writeJsonFallbackData(modelName, filtered);
}

async function findLocalRecord(
  modelName: string,
  where: Record<string, unknown>
): Promise<any | null> {
  const records = await readFallbackData(modelName);
  return (
    records.find((r) => {
      for (const [key, val] of Object.entries(where)) {
        if (r[key] !== val) return false;
      }
      return true;
    }) ?? null
  );
}

export async function applyOfflineCreate(modelName: string, data: Record<string, unknown>) {
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

  await upsertLocalRecord(modelName, record);
  return record;
}

export async function applyOfflineUpdate(
  modelName: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>
) {
  const existing = await findLocalRecord(modelName, where);
  const base = existing ?? where;
  const record = {
    ...base,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  await upsertLocalRecord(modelName, record);
  return record;
}

export async function applyOfflineDelete(
  modelName: string,
  where: Record<string, unknown>
) {
  const existing = await findLocalRecord(modelName, where);
  await deleteLocalRecord(modelName, where);
  return existing ?? { ...where };
}

export async function applyOfflineUpsert(
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

  if (whereKey && (await findLocalRecord(modelName, whereKey))) {
    return applyOfflineUpdate(modelName, whereKey, { ...create, ...update });
  }

  return applyOfflineCreate(modelName, { ...create, ...update });
}

export async function warmCacheFromPostgres(client: Record<string, unknown>) {
  if (!(await isCacheTierAvailable())) return;

  for (const modelName of FALLBACK_MODELS) {
    try {
      const model = client[modelName] as { findMany?: (args?: unknown) => Promise<any[]> };
      if (!model?.findMany) continue;

      const records = await model.findMany();
      if (records.length > 0) {
        await cacheReplaceModel(modelName, records);
      }
    } catch (err) {
      console.warn(`[Fallback DB] Warm cache skipped for ${modelName}:`, err);
    }
  }

  console.log("[Fallback DB] Cache warm complete (Turso/libSQL → local SQLite)");
}

/** @deprecated Use warmCacheFromPostgres */
export const warmSqliteFromPostgres = warmCacheFromPostgres;
