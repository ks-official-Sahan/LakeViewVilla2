import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function check() {
  console.log("🔍 Checking database tables...");

  // List all tables in public schema
  const tables = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT CAST(table_name AS text) AS table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`
  );

  console.log("Existing Tables:", tables.map((t) => t.table_name));

  // If users table exists, check its columns
  if (tables.some((t) => t.table_name === "users")) {
    console.log("\n📋 Columns in 'users' table:");
    const columns = await prisma.$queryRawUnsafe<{ column_name: string; data_type: string }[]>(
      `SELECT CAST(column_name AS text) AS column_name, CAST(data_type AS text) AS data_type FROM information_schema.columns WHERE table_name='users' AND table_schema='public';`
    );
    console.table(columns);
  } else {
    console.log("\n❌ 'users' table does not exist!");
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
