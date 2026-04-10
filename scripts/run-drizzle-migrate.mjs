/**
 * Carrega DATABASE_URL de .env.local ou .env e executa `drizzle-kit migrate`.
 * Uso: npm run db:apply
 */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

function loadDatabaseUrl() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(root, name);
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const match = trimmed.match(/^DATABASE_URL=(.*)$/);
      if (!match) continue;
      let v = match[1].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      return v;
    }
  }
  return process.env.DATABASE_URL ?? "";
}

const url = loadDatabaseUrl();
if (!url) {
  console.error(
    "DATABASE_URL não encontrada. Defina em .env.local ou .env na raiz do projeto.",
  );
  process.exit(1);
}

process.env.DATABASE_URL = url;

const r = spawnSync(
  "npx",
  ["drizzle-kit", "migrate"],
  { cwd: root, stdio: "inherit", env: process.env, shell: true },
);

process.exit(r.status ?? 1);
