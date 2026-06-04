import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { defineConfig } from "prisma/config";

// Ensure DATABASE_URL is always set for `prisma generate` on CI/Vercel
// where the env var may not be configured yet. A dummy URL is sufficient
// for code generation; actual connection only happens at runtime.
const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://dummy:dummy@localhost:5432/dummy?schema=public";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },

  datasource: {
    url: DATABASE_URL,
  },
});
