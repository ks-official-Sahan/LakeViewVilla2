import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import {
  readFallbackData,
  writeFallbackData,
  addToSyncQueue,
  getSyncQueue,
  removeQueueItem,
} from "./fallback-store";

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
        }
      }
      removeQueueItem(item.id);
      console.log(`[Fallback DB] Synced successfully: ${item.operation} on ${item.entityType}`);
    } catch (err) {
      console.error(`[Fallback DB] Sync failed for item ${item.id}:`, err);
      // Stop syncing remaining items to preserve ordering if one fails
      break;
    }
  }
  isSyncing = false;
}

function readFallbackMany(modelName: string, queryArgs: any): any[] {
  const records = readFallbackData(modelName);
  if (!queryArgs || !queryArgs.where) return records;

  // Simple filtering implementation for offline search
  return records.filter((r) => {
    for (const [key, val] of Object.entries(queryArgs.where)) {
      if (val !== undefined && r[key] !== val) {
        if (typeof val === "object" && val !== null) {
          if ("equals" in val && r[key] !== (val as any).equals) return false;
          if ("in" in val && Array.isArray((val as any).in) && !(val as any).in.includes(r[key])) return false;
        } else {
          return false;
        }
      }
    }
    return true;
  });
}

function readFallbackFirst(modelName: string, queryArgs: any): any | null {
  const matched = readFallbackMany(modelName, queryArgs);
  return matched[0] || null;
}

async function updateFallbackCache(client: PrismaClient, modelName: string) {
  const camelModel = toCamelCase(modelName);
  const model = (client as any)[camelModel];
  if (model) {
    try {
      // Keep up to 100 records cached locally for read fallback
      const all = await model.findMany({ take: 100 });
      writeFallbackData(modelName, all);
    } catch (err) {
      console.warn(`[Fallback DB] Failed to update cache for ${modelName}:`, err);
    }
  }
}

function createResilientPrismaClient(): any {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("[DB] DATABASE_URL not set — PrismaClient will fail on queries.");
    return new PrismaClient({ adapter: undefined as any }) as any;
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  const adapter = new PrismaNeon(pool);
  const rawClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Export Proxy client to intercept Neon connection failures
  return new Proxy(rawClient, {
    get(target, prop) {
      const orig = (target as any)[prop];
      if (typeof orig === "object" && orig !== null && !prop.toString().startsWith("$")) {
        return new Proxy(orig, {
          get(modelTarget, method) {
            const origMethod = (modelTarget as any)[method];
            if (typeof origMethod === "function") {
              return async function (...args: any[]) {
                const modelName = prop.toString();
                const methodName = method.toString();

                // Trigger background sync if there's a queue
                if (methodName.startsWith("find") || methodName === "count") {
                  syncPendingQueue(target).catch(() => {});
                }

                try {
                  const res = await origMethod.apply(modelTarget, args);

                  // If this is a mutating write query, update local cache
                  if (["create", "update", "delete", "upsert"].includes(methodName)) {
                    updateFallbackCache(target, modelName).catch(() => {});
                  }

                  return res;
                } catch (err: any) {
                  const isConnectionError =
                    err.message?.includes("Can't reach database server") ||
                    err.message?.includes("connection") ||
                    err.message?.includes("timeout") ||
                    err.message?.includes("Neon") ||
                    err.message?.includes("socket") ||
                    err.message?.includes("ECONNRESET") ||
                    err.message?.includes("RESET") ||
                    err.code === "P1001" ||
                    err.code === "P1002" ||
                    err.code === "P1017";

                  if (isConnectionError) {
                    console.warn(
                      `[Fallback DB] Database query failed. Falling back to local offline DB. Method: ${methodName} on ${modelName}`
                    );

                    if (methodName === "findMany") {
                      return readFallbackMany(modelName, args[0]);
                    } else if (methodName === "findFirst" || methodName === "findUnique") {
                      return readFallbackFirst(modelName, args[0]);
                    } else if (methodName === "count") {
                      return readFallbackMany(modelName, args[0]).length;
                    }

                    if (methodName === "create") {
                      const data = args[0]?.data;
                      addToSyncQueue("CREATE", modelName, data);
                      return { id: `mock_${Date.now()}`, ...data };
                    } else if (methodName === "update") {
                      const where = args[0]?.where;
                      const data = args[0]?.data;
                      addToSyncQueue("UPDATE", modelName, { where, data });
                      return { ...where, ...data };
                    } else if (methodName === "delete") {
                      const where = args[0]?.where;
                      addToSyncQueue("DELETE", modelName, { where });
                      return { ...where };
                    }
                  }

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
