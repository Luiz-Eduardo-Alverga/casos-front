import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { acquirers } from "@/db/schema";
import { ilikeContains } from "@/lib/db/search-ilike";

export type AcquirerRow = typeof acquirers.$inferSelect;
export type AcquirerInsert = typeof acquirers.$inferInsert;

export async function listAcquirers(search?: string): Promise<AcquirerRow[]> {
  const term = search?.trim();
  const q = db.select().from(acquirers);
  if (term) {
    return q.where(ilikeContains(acquirers.name, term)).orderBy(asc(acquirers.name));
  }
  return q.orderBy(asc(acquirers.name));
}

export async function getAcquirerById(
  id: string,
): Promise<AcquirerRow | undefined> {
  const rows = await db
    .select()
    .from(acquirers)
    .where(eq(acquirers.id, id))
    .limit(1);
  return rows[0];
}

export async function insertAcquirer(
  values: AcquirerInsert,
): Promise<AcquirerRow> {
  const rows = await db.insert(acquirers).values(values).returning();
  return rows[0];
}

export async function updateAcquirer(
  id: string,
  values: Partial<Omit<AcquirerInsert, "id">>,
): Promise<AcquirerRow | undefined> {
  const rows = await db
    .update(acquirers)
    .set(values)
    .where(eq(acquirers.id, id))
    .returning();
  return rows[0];
}

export async function deleteAcquirer(id: string): Promise<boolean> {
  const rows = await db
    .delete(acquirers)
    .where(eq(acquirers.id, id))
    .returning({ id: acquirers.id });
  return rows.length > 0;
}
