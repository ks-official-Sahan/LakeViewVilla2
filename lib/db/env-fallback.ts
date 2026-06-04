// lib/db/env-fallback.ts
// Set default database fallback URL inside environment variables before Prisma Client is imported.
// This prevents Prisma 7 from printing localhost/empty database warnings at compile and run time.

const fallbackUrl = "postgresql://dummy:dummy@localhost:5432/dummy";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = fallbackUrl;
}
if (!process.env.DIRECT_DATABASE_URL) {
  process.env.DIRECT_DATABASE_URL = fallbackUrl;
}

// Disable native bufferutil in 'ws' to prevent "b.mask is not a function" errors during static pre-rendering
process.env.WS_NO_BUFFER_UTIL = "1";

