/**
 * @deprecated Use sqlite-fallback.ts / fallback-provider.ts instead.
 */
import {
  isSqliteAvailable,
  sqliteReadAll,
  sqliteReplaceModel,
} from "./sqlite-fallback";

export const sqliteBackup = {
  isAvailable: isSqliteAvailable,
  write: async (modelName: string, records: unknown[]) => {
    sqliteReplaceModel(modelName, records as Record<string, unknown>[]);
  },
  read: async (modelName: string) => sqliteReadAll(modelName),
};
