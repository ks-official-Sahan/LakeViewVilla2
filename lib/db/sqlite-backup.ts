// Safe stub — @prisma/adapter-better-sqlite3 not installed
// Full SQLite backup implementation deferred to later phase

export const sqliteBackup = {
  isAvailable: () => false,
  write: async () => {},
  read: async () => null,
};

// TODO(Phase 1): Implement actual SQLite backup with @prisma/adapter-better-sqlite3
