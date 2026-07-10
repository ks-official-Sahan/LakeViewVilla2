/**
 * Unified fallback cache: Turso/libSQL → local SQLite → (caller falls back to JSON).
 *
 * Turso is preferred on Vercel (remote or /tmp embedded replica).
 * Local better-sqlite3 is used when Turso is not configured (Hostinger / offline dev).
 */
import {
  isLibsqlAvailable,
  libsqlDeleteRecord,
  libsqlReadAll,
  libsqlReplaceModel,
  libsqlUpsertRecord,
  isTursoConfigured,
} from "./libsql-fallback";
import {
  isSqliteAvailable,
  sqliteDeleteRecord,
  sqliteReadAll,
  sqliteReplaceModel,
  sqliteUpsertRecord,
} from "./sqlite-fallback";

export { recordIdFor } from "./fallback-records";
export { isTursoConfigured };

export async function isCacheTierAvailable(): Promise<boolean> {
  if (await isLibsqlAvailable()) return true;
  return isSqliteAvailable();
}

/** @deprecated Use isCacheTierAvailable — sync check for local SQLite only */
export function isLocalSqliteOnly(): boolean {
  return isSqliteAvailable();
}

export async function cacheReadAll(modelName: string): Promise<any[]> {
  if (await isLibsqlAvailable()) {
    const rows = await libsqlReadAll(modelName);
    if (rows.length > 0) return rows;
  }

  if (isSqliteAvailable()) {
    const rows = sqliteReadAll(modelName);
    if (rows.length > 0) return rows;
  }

  return [];
}

export async function cacheReplaceModel(modelName: string, records: any[]): Promise<boolean> {
  if (await isLibsqlAvailable()) {
    const ok = await libsqlReplaceModel(modelName, records);
    if (ok) return true;
  }

  if (isSqliteAvailable()) {
    return sqliteReplaceModel(modelName, records);
  }

  return false;
}

export async function cacheUpsertRecord(modelName: string, record: any): Promise<boolean> {
  if (await isLibsqlAvailable()) {
    const ok = await libsqlUpsertRecord(modelName, record);
    if (ok) return true;
  }

  if (isSqliteAvailable()) {
    return sqliteUpsertRecord(modelName, record);
  }

  return false;
}

export async function cacheDeleteRecord(modelName: string, recordId: string): Promise<boolean> {
  if (await isLibsqlAvailable()) {
    const ok = await libsqlDeleteRecord(modelName, recordId);
    if (ok) return true;
  }

  if (isSqliteAvailable()) {
    return sqliteDeleteRecord(modelName, recordId);
  }

  return false;
}
