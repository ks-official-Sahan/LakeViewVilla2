import "./env-fallback";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import {
  readFallbackData,
  addToSyncQueue,
  getSyncQueue,
  removeQueueItem,
  warmCacheFromPostgres,
  applyOfflineCreate,
  applyOfflineUpdate,
  applyOfflineDelete,
  applyOfflineUpsert,
} from "./fallback-provider";

// Configure WebSocket for Node.js Server Components
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  rawPrisma: PrismaClient | undefined;
  prisma: any | undefined;
};

function toCamelCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

let isSyncing = false;
let cacheWarmed = false;

async function syncPendingQueue(client: PrismaClient) {
  if (isSyncing) return;
  const queue = getSyncQueue();
  if (queue.length === 0) return;

  isSyncing = true;
  console.log(`[Fallback DB] Found ${queue.length} pending operations in SyncQueue. Syncing to Neon...`);

  for (const item of queue) {
    try {
      const camelModel = toCamelCase(item.entityType);
      const model = (client as any)[camelModel];
      if (model) {
        if (item.operation === "CREATE") {
          await model.create({ data: item.payload });
        } else if (item.operation === "UPDATE") {
          await model.update({ where: item.payload.where, data: item.payload.data });
        } else if (item.operation === "DELETE") {
          await model.delete({ where: item.payload.where });
        } else if (item.operation === "UPSERT") {
          await model.upsert({
            where: item.payload.where,
            create: item.payload.create,
            update: item.payload.update,
          });
        }
      }
      removeQueueItem(item.id);
      console.log(`[Fallback DB] Synced successfully: ${item.operation} on ${item.entityType}`);
    } catch (err) {
      console.error(`[Fallback DB] Sync failed for item ${item.id}:`, err);
      break;
    }
  }
  isSyncing = false;
}

function readFallbackMany(modelName: string, queryArgs: any): Promise<any[]> {
  return readFallbackData(modelName).then((records) => {
    if (!queryArgs || !queryArgs.where) return records;

    return records.filter((r) => {
      for (const [key, val] of Object.entries(queryArgs.where)) {
        if (val !== undefined && r[key] !== val) {
          if (typeof val === "object" && val !== null) {
            if ("equals" in val && r[key] !== (val as any).equals) return false;
            if ("in" in val && Array.isArray((val as any).in) && !(val as any).in.includes(r[key]))
              return false;
          } else {
            return false;
          }
        }
      }
      return true;
    });
  });
}

function readFallbackFirst(modelName: string, queryArgs: any): Promise<any | null> {
  return readFallbackMany(modelName, queryArgs).then((matched) => matched[0] || null);
}

async function handleOfflineMethod(modelName: string, methodName: string, args: any[]): Promise<any> {
  if (methodName === "findMany") {
    return readFallbackMany(modelName, args[0]);
  }
  if (methodName === "findFirst" || methodName === "findUnique") {
    return readFallbackFirst(modelName, args[0]);
  }
  if (methodName === "count") {
    const rows = await readFallbackMany(modelName, args[0]);
    return rows.length;
  }

  if (methodName === "create") {
    const data = args[0]?.data ?? {};
    const record = await applyOfflineCreate(modelName, data);
    addToSyncQueue("CREATE", modelName, data);
    return record;
  }

  if (methodName === "update") {
    const where = args[0]?.where ?? {};
    const data = args[0]?.data ?? {};
    const record = await applyOfflineUpdate(modelName, where, data);
    addToSyncQueue("UPDATE", modelName, { where, data });
    return record;
  }

  if (methodName === "delete") {
    const where = args[0]?.where ?? {};
    const record = await applyOfflineDelete(modelName, where);
    addToSyncQueue("DELETE", modelName, { where });
    return record;
  }

  if (methodName === "upsert") {
    const create = args[0]?.create ?? {};
    const update = args[0]?.update ?? {};
    const where = args[0]?.where ?? {};
    const record = await applyOfflineUpsert(modelName, create, update, where);
    addToSyncQueue("UPSERT", modelName, { where, create, update });
    return record;
  }

  return undefined;
}

function createResilientPrismaClient(): any {
  const fallbackUrl = "postgresql://dummy:dummy@localhost:5432/dummy";
  const connectionString = process.env.DATABASE_URL === fallbackUrl ? undefined : process.env.DATABASE_URL;
  const hasRealDatabase = Boolean(connectionString);
  let isDbOffline = !hasRealDatabase;
  let consecutiveFailures = 0;
  const CIRCUIT_OPEN_THRESHOLD = 3;

  if (isDbOffline) {
    console.warn("[Fallback DB] DATABASE_URL not set — PrismaClient initialized in offline fallback mode.");
  }

  const adapter = new PrismaNeon({
    connectionString: connectionString || fallbackUrl,
  });
  const rawClient = new PrismaClient({
    adapter: adapter as any,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  function maybeWarmCache() {
    if (!hasRealDatabase || cacheWarmed || isDbOffline) return;
    cacheWarmed = true;
    warmCacheFromPostgres(rawClient as unknown as Record<string, unknown>).catch((err) => {
      console.warn("[Fallback DB] Cache warm failed:", err);
      cacheWarmed = false;
    });
  }

  return new Proxy(rawClient, {
    get(target, prop) {
      const orig = (target as any)[prop];
      if (typeof orig === "object" && orig !== null && !prop.toString().startsWith("$")) {
        return new Proxy(orig, {
          get(modelTarget, method) {
            const origMethod = (modelTarget as any)[method];
            const methodName = typeof method === "string" ? method : method.toString();
            const PRISMA_METHODS = [
              "findMany",
              "findFirst",
              "findUnique",
              "count",
              "create",
              "update",
              "delete",
              "upsert",
              "updateMany",
              "deleteMany",
              "createMany",
            ];

            if (typeof origMethod === "function" && PRISMA_METHODS.includes(methodName)) {
              return async function (...args: any[]) {
                const modelName = prop.toString();

                if (isDbOffline) {
                  const offlineResult = await handleOfflineMethod(modelName, methodName, args);
                  if (offlineResult !== undefined) return offlineResult;
                }

                if (methodName.startsWith("find") || methodName === "count") {
                  syncPendingQueue(target).catch(() => {});
                }

                try {
                  const res = await origMethod.apply(modelTarget, args);
                  consecutiveFailures = 0;
                  if (hasRealDatabase) {
                    if (isDbOffline) {
                      console.log("[Fallback DB] Circuit breaker closed — Postgres recovered.");
                    }
                    isDbOffline = false;
                    maybeWarmCache();
                  }
                  return res;
                } catch (err: any) {
                  consecutiveFailures += 1;
                  const openCircuit =
                    !hasRealDatabase || consecutiveFailures >= CIRCUIT_OPEN_THRESHOLD;
                  if (openCircuit) {
                    isDbOffline = true;
                    console.warn(
                      `[Fallback DB] Database query failed. Circuit breaker opened. Falling back to Turso/libSQL → SQLite → JSON. Method: ${methodName} on ${modelName}. Error: ${err?.message || err}`
                    );
                  } else {
                    console.warn(
                      `[Fallback DB] Database query failed (${consecutiveFailures}/${CIRCUIT_OPEN_THRESHOLD}). Retrying on next request. Method: ${methodName} on ${modelName}. Error: ${err?.message || err}`
                    );
                    throw err;
                  }

                  const offlineResult = await handleOfflineMethod(modelName, methodName, args);
                  if (offlineResult !== undefined) return offlineResult;

                  throw err;
                }
              };
            }
            return origMethod;
          },
        });
      }
      return orig;
    },
  });
}

export const prisma = (globalForPrisma.prisma ?? createResilientPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
