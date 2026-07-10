/**
 * Smoke-test integrations: Neon, fallback cache, Resend config, IndexNow key file.
 * Run: npx dotenv -e .env.local -- tsx scripts/verify-integrations.ts
 */
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

type Check = { name: string; ok: boolean; detail: string };

const results: Check[] = [];

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}: ${detail}`);
}

async function main() {
  console.log("=== Lake View Villa integration checks ===\n");

  // 1. Neon Postgres (direct, bypasses fallback proxy)
  try {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaNeon } = await import("@prisma/adapter-neon");
    const { neonConfig } = await import("@neondatabase/serverless");
    const ws = (await import("ws")).default;
    neonConfig.webSocketConstructor = ws;

    const url = process.env.DATABASE_URL;
    if (!url || url.includes("dummy")) {
      record("Neon Postgres", false, "DATABASE_URL missing or dummy");
    } else {
      const adapter = new PrismaNeon({ connectionString: url });
      const client = new PrismaClient({ adapter: adapter as never });
      const count = await client.user.count();
      await client.$disconnect();
      record("Neon Postgres", true, `connected (${count} users)`);
    }
  } catch (err) {
    record("Neon Postgres", false, err instanceof Error ? err.message : String(err));
  }

  // 2. Resilient prisma proxy (warm cache path)
  try {
    const { prisma } = await import("../lib/db/prisma");
    const settings = await prisma.setting.count();
    record("Prisma fallback proxy", true, `setting.count() = ${settings}`);
  } catch (err) {
    record("Prisma fallback proxy", false, err instanceof Error ? err.message : String(err));
  }

  // 3. Local SQLite fallback tier
  try {
    const { isSqliteAvailable, sqliteReadAll } = await import("../lib/db/sqlite-fallback");
    const ok = isSqliteAvailable();
    if (ok) {
      const users = sqliteReadAll("user");
      record("Local SQLite fallback", true, `available (${users.length} cached users)`);
    } else {
      record("Local SQLite fallback", false, "better-sqlite3 not available");
    }
  } catch (err) {
    record("Local SQLite fallback", false, err instanceof Error ? err.message : String(err));
  }

  // 4. Turso / libSQL tier
  try {
    const { isTursoConfigured, isLibsqlAvailable, libsqlReadAll } = await import(
      "../lib/db/libsql-fallback"
    );
    if (!isTursoConfigured()) {
      record("Turso/libSQL fallback", true, "not configured (optional — using SQLite/JSON)");
    } else {
      const available = await isLibsqlAvailable();
      if (available) {
        const users = await libsqlReadAll("user");
        record("Turso/libSQL fallback", true, `connected (${users.length} cached users)`);
      } else {
        record("Turso/libSQL fallback", false, "TURSO_* set but client init failed");
      }
    }
  } catch (err) {
    record("Turso/libSQL fallback", false, err instanceof Error ? err.message : String(err));
  }

  // 5. JSON fallback read
  try {
    const { readJsonFallbackData } = await import("../lib/db/fallback-store");
    const users = readJsonFallbackData("user");
    record("JSON fallback read", true, `${users.length} users in fallback_db.json`);
  } catch (err) {
    record("JSON fallback read", false, err instanceof Error ? err.message : String(err));
  }

  // 6. Resend config
  try {
    const { getResendConfig } = await import("../lib/email/config");
    const cfg = getResendConfig();
    if (cfg.ok) {
      record(
        "Resend email config",
        true,
        `sender configured, ${cfg.config.recipientEmails.length} recipient(s)`
      );
    } else {
      record("Resend email config", false, cfg.reason);
    }
  } catch (err) {
    record("Resend email config", false, err instanceof Error ? err.message : String(err));
  }

  // 7. IndexNow key file
  try {
    const key = process.env.INDEXNOW_KEY?.trim();
    if (!key) {
      record("IndexNow", false, "INDEXNOW_KEY not set");
    } else {
      const keyFile = path.join(process.cwd(), "public", `${key}.txt`);
      const exists = fs.existsSync(keyFile);
      const content = exists ? fs.readFileSync(keyFile, "utf8").trim() : "";
      const match = content === key;
      record(
        "IndexNow key file",
        exists && match,
        exists
          ? match
            ? `public/${key}.txt matches INDEXNOW_KEY`
            : "key file content mismatch"
          : `missing public/${key}.txt`
      );
    }
  } catch (err) {
    record("IndexNow", false, err instanceof Error ? err.message : String(err));
  }

  // 8. IndexNow ping (dry — only if key set)
  try {
    const { pingIndexNow, absoluteSiteUrl } = await import("../lib/indexnow");
    if (!process.env.INDEXNOW_KEY) {
      record("IndexNow ping", true, "skipped (no key)");
    } else {
      await pingIndexNow([absoluteSiteUrl("/")]);
      record("IndexNow ping", true, "submitted homepage URL to Bing/IndexNow API");
    }
  } catch (err) {
    record("IndexNow ping", false, err instanceof Error ? err.message : String(err));
  }

  console.log("\n=== Summary ===");
  const failed = results.filter((r) => !r.ok);
  console.log(`${results.length - failed.length}/${results.length} passed`);
  if (failed.length > 0) {
    console.log("Failed:", failed.map((f) => f.name).join(", "));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
