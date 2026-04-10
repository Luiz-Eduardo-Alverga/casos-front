import { type SQL, sql } from "drizzle-orm";
import type { AnyPgColumn } from "drizzle-orm/pg-core";

/**
 * Condição `ILIKE '%termo%'` com escape de `%`, `_` e `\` (Postgres `ESCAPE '\\'`).
 */
export function ilikeContains(column: AnyPgColumn, rawSearch: string): SQL {
  const escaped = rawSearch
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
  const pattern = `%${escaped}%`;
  return sql`${column} ILIKE ${pattern} ESCAPE '\\'`;
}

/**
 * Mesmo que {@link ilikeContains}, aplicado a `cast(column as text)` (ex.: UUID).
 */
export function ilikeContainsAsText(column: AnyPgColumn, rawSearch: string): SQL {
  const escaped = rawSearch
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_");
  const pattern = `%${escaped}%`;
  return sql`cast(${column} as text) ILIKE ${pattern} ESCAPE '\\'`;
}
