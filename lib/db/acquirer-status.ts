import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { acquirerStatus } from "@/db/schema";

export type AcquirerStatusRow = typeof acquirerStatus.$inferSelect;
export type AcquirerStatusInsert = typeof acquirerStatus.$inferInsert;

export async function listAcquirerStatus(): Promise<AcquirerStatusRow[]> {
  return db
    .select()
    .from(acquirerStatus)
    .orderBy(asc(acquirerStatus.sortOrder), desc(acquirerStatus.createdAt));
}

export async function getAcquirerStatusById(
  id: string,
): Promise<AcquirerStatusRow | undefined> {
  const rows = await db
    .select()
    .from(acquirerStatus)
    .where(eq(acquirerStatus.id, id))
    .limit(1);
  return rows[0];
}

export async function getAcquirerStatusByAcquirerId(
  acquirerId: string,
): Promise<AcquirerStatusRow | undefined> {
  const rows = await db
    .select()
    .from(acquirerStatus)
    .where(eq(acquirerStatus.acquirerId, acquirerId))
    .limit(1);
  return rows[0];
}

export async function getAcquirerStatusBySortOrder(
  sortOrder: number,
): Promise<AcquirerStatusRow | undefined> {
  const rows = await db
    .select()
    .from(acquirerStatus)
    .where(eq(acquirerStatus.sortOrder, sortOrder))
    .limit(1);
  return rows[0];
}

export async function insertAcquirerStatus(
  values: AcquirerStatusInsert,
): Promise<AcquirerStatusRow> {
  const rows = await db.insert(acquirerStatus).values(values).returning();
  return rows[0];
}

export async function updateAcquirerStatus(
  id: string,
  values: Partial<Omit<AcquirerStatusInsert, "id">>,
): Promise<AcquirerStatusRow | undefined> {
  const rows = await db
    .update(acquirerStatus)
    .set(values)
    .where(eq(acquirerStatus.id, id))
    .returning();
  return rows[0];
}

export async function deleteAcquirerStatus(id: string): Promise<boolean> {
  const rows = await db
    .delete(acquirerStatus)
    .where(eq(acquirerStatus.id, id))
    .returning({ id: acquirerStatus.id });
  return rows.length > 0;
}
