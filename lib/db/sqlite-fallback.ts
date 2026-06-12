/**
 * SQLite first-tier offline fallback store.
 *
 * Uses a generic (model_name, record_id, data) table so we can mirror Prisma
 * models without maintaining a second Prisma schema. Falls back gracefully when
 * better-sqlite3 cannot load (e.g. missing native bindings).
 *
 * Env: FALLBACK_SQLITE_PATH — defaults to data/fallback.db
 */
import fs from "fs";
import path from "path";
import type Database from "better-sqlite3";

const DEFAULT_SQLITE_PATH = path.join(process.cwd(), "data", "fallback.db");

let db: Database.Database | null = null;
let sqliteUnavailable = false;

function resolveSqlitePath(): string {
  return process.env.FALLBACK_SQLITE_PATH || DEFAULT_SQLITE_PATH;
}

function ensureDataDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS fallback_records (
      model_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      data TEXT NOT NULL,
      PRIMARY KEY (model_name, record_id)
    );
    CREATE INDEX IF NOT EXISTS idx_fallback_records_model ON fallback_records(model_name);
  `);
}

export function isSqliteAvailable(): boolean {
  return getSqliteDb() !== null;
}

export function getSqliteDb(): Database.Database | null {
  if (sqliteUnavailable) return null;
  if (db) return db;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const BetterSqlite3 = require("better-sqlite3") as typeof import("better-sqlite3");
    const dbPath = resolveSqlitePath();
    ensureDataDir(dbPath);
    db = new BetterSqlite3(dbPath);
    initSchema(db);
    return db;
  } catch (err) {
    sqliteUnavailable = true;
    console.warn("[Fallback DB] SQLite unavailable — using JSON fallback only:", err);
    return null;
  }
}

export function recordIdFor(modelName: string, record: Record<string, unknown>): string | null {
  if (modelName === "setting" && typeof record.key === "string") {
    return record.key;
  }
  if (typeof record.id === "string") {
    return record.id;
  }
  return null;
}

export function sqliteReadAll(modelName: string): any[] {
  const database = getSqliteDb();
  if (!database) return [];

  try {
    const rows = database
      .prepare("SELECT data FROM fallback_records WHERE model_name = ?")
      .all(modelName) as { data: string }[];

    return rows.map((row) => JSON.parse(row.data));
  } catch (err) {
    console.error(`[Fallback DB] SQLite read failed for ${modelName}:`, err);
    return [];
  }
}

export function sqliteReplaceModel(modelName: string, records: any[]) {
  const database = getSqliteDb();
  if (!database) return false;

  try {
    const replace = database.transaction((items: any[]) => {
      database.prepare("DELETE FROM fallback_records WHERE model_name = ?").run(modelName);
      const insert = database.prepare(
        "INSERT OR REPLACE INTO fallback_records (model_name, record_id, data) VALUES (?, ?, ?)"
      );
      for (const record of items) {
        const recordId = recordIdFor(modelName, record);
        if (!recordId) continue;
        insert.run(modelName, recordId, JSON.stringify(record));
      }
    });
    replace(records);
    return true;
  } catch (err) {
    console.error(`[Fallback DB] SQLite bulk replace failed for ${modelName}:`, err);
    return false;
  }
}

export function sqliteUpsertRecord(modelName: string, record: any): boolean {
  const database = getSqliteDb();
  if (!database) return false;

  const recordId = recordIdFor(modelName, record);
  if (!recordId) return false;

  try {
    database
      .prepare(
        "INSERT OR REPLACE INTO fallback_records (model_name, record_id, data) VALUES (?, ?, ?)"
      )
      .run(modelName, recordId, JSON.stringify(record));
    return true;
  } catch (err) {
    console.error(`[Fallback DB] SQLite upsert failed for ${modelName}:`, err);
    return false;
  }
}

export function sqliteDeleteRecord(modelName: string, recordId: string): boolean {
  const database = getSqliteDb();
  if (!database) return false;

  try {
    database
      .prepare("DELETE FROM fallback_records WHERE model_name = ? AND record_id = ?")
      .run(modelName, recordId);
    return true;
  } catch (err) {
    console.error(`[Fallback DB] SQLite delete failed for ${modelName}:`, err);
    return false;
  }
}
