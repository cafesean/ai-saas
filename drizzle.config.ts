// drizzle.config.ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});