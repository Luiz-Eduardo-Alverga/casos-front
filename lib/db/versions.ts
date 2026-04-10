import { desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { versions } from "@/db/schema";
import { ilikeContains, ilikeContainsAsText } from "@/lib/db/search-ilike";

export type VersionRow = typeof versions.$inferSelect;
export type VersionInsert = typeof versions.$inferInsert;

export async function listVersions(search?: string): Promise<VersionRow[]> {
  const term = search?.trim();
  const q = db.select().from(versions);
  if (term) {
    return q
      .where(
        or(
          ilikeContains(versions.name, term),
          ilikeContainsAsText(versions.id, term),
        ),
      )
      .orderBy(desc(versions.createdAt));
  }
  return q.orderBy(desc(versions.createdAt));
}

export async function getVersionById(
  id: string,
): Promise<VersionRow | undefined> {
  const rows = await db
    .select()
    .from(versions)
    .where(eq(versions.id, id))
    .limit(1);
  return rows[0];
}

export async function insertVersion(
  values: VersionInsert,
): Promise<VersionRow> {
  const rows = await db.insert(versions).values(values).returning();
  return rows[0];
}

export async function updateVersion(
  id: string,
  values: Partial<Omit<VersionInsert, "id">>,
): Promise<VersionRow | undefined> {
  const rows = await db
    .update(versions)
    .set(values)
    .where(eq(versions.id, id))
    .returning();
  return rows[0];
}

export async function deleteVersion(id: string): Promise<boolean> {
  const rows = await db
    .delete(versions)
    .where(eq(versions.id, id))
    .returning({ id: versions.id });
  return rows.length > 0;
}
