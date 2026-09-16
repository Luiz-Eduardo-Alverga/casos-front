import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: ["./db/schema.ts", "./db/schema-doc-attachments.ts"],
  out: "./db/migrations",             // Onde as migrações SQL serão salvas
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});