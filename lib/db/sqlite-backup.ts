/**
 * @deprecated Use fallback-cache.ts / fallback-provider.ts instead.
 */
import { isCacheTierAvailable, cacheReadAll, cacheReplaceModel } from "./fallback-cache";

export const sqliteBackup = {
  isAvailable: isCacheTierAvailable,
  write: async (modelName: string, records: unknown[]) => {
    await cacheReplaceModel(modelName, records as Record<string, unknown>[]);
  },
  read: async (modelName: string) => cacheReadAll(modelName),
};
