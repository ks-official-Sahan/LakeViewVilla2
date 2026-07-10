/**
 * JSON last-resort offline store + sync queue for Postgres replay.
 * Prefer reads/writes through fallback-provider.ts (SQLite → JSON).
 */
import fs from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "fallback_db.json");
const QUEUE_PATH = path.join(process.cwd(), "data", "fallback_sync_queue.json");

function ensureDirectories() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readJsonFallbackData(modelName: string): any[] {
  ensureDirectories();
  if (!fs.existsSync(STORE_PATH)) return [];
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed[modelName] || [];
  } catch (err) {
    console.error(`[Fallback DB] Failed to read ${modelName}:`, err);
    return [];
  }
}

export function writeJsonFallbackData(modelName: string, records: any[]) {
  ensureDirectories();
  try {
    let current: Record<string, any[]> = {};
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, "utf-8");
      try {
        current = JSON.parse(raw);
      } catch {
        current = {};
      }
    }
    current[modelName] = records;
    fs.writeFileSync(STORE_PATH, JSON.stringify(current, null, 2), "utf-8");
  } catch (err) {
    console.error(`[Fallback DB] Failed to write ${modelName}:`, err);
  }
}

export function addToSyncQueue(operation: string, modelName: string, payload: any) {
  ensureDirectories();
  try {
    let queue: any[] = [];
    if (fs.existsSync(QUEUE_PATH)) {
      const raw = fs.readFileSync(QUEUE_PATH, "utf-8");
      try {
        queue = JSON.parse(raw);
      } catch {
        queue = [];
      }
    }
    queue.push({
      id: `sq_${Math.random().toString(36).substring(2, 11)}`,
      operation,
      entityType: modelName,
      payload,
      createdAt: new Date().toISOString(),
    });
    fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2), "utf-8");
    console.log(`[Fallback DB] Added mutating operation to SyncQueue: ${operation} on ${modelName}`);
  } catch (err) {
    console.error("[Fallback DB] Failed to queue to SyncQueue:", err);
  }
}

export function getSyncQueue(): any[] {
  if (!fs.existsSync(QUEUE_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(QUEUE_PATH, "utf-8"));
  } catch {
    return [];
  }
}

export function removeQueueItem(itemId: string) {
  try {
    if (!fs.existsSync(QUEUE_PATH)) return;
    const queue = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf-8"));
    const filtered = queue.filter((item: any) => item.id !== itemId);
    if (filtered.length === 0) {
      fs.unlinkSync(QUEUE_PATH);
    } else {
      fs.writeFileSync(QUEUE_PATH, JSON.stringify(filtered, null, 2), "utf-8");
    }
  } catch (err) {
    console.error("[Fallback DB] Failed to remove sync queue item:", err);
  }
}
