import { and, asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { docAttachments } from "@/db/schema-doc-attachments";

export type DocAttachmentRow = typeof docAttachments.$inferSelect;
export type DocAttachmentInsert = typeof docAttachments.$inferInsert;

export async function countDocAttachmentsByDocId(
  docId: string,
): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(docAttachments)
    .where(eq(docAttachments.docId, docId));
  return Number(rows[0]?.n ?? 0);
}

export async function listDocAttachmentsByDocId(
  docId: string,
): Promise<DocAttachmentRow[]> {
  return db
    .select()
    .from(docAttachments)
    .where(eq(docAttachments.docId, docId))
    .orderBy(asc(docAttachments.createdAt));
}

export async function getDocAttachmentById(
  id: string,
): Promise<DocAttachmentRow | undefined> {
  const rows = await db
    .select()
    .from(docAttachments)
    .where(eq(docAttachments.id, id))
    .limit(1);
  return rows[0];
}

export async function insertDocAttachment(
  values: DocAttachmentInsert,
): Promise<DocAttachmentRow> {
  const rows = await db.insert(docAttachments).values(values).returning();
  const row = rows[0];
  if (!row) throw new Error("insertDocAttachment: sem retorno");
  return row;
}

export async function deleteDocAttachmentById(
  id: string,
  docId: string,
): Promise<DocAttachmentRow | undefined> {
  const rows = await db
    .delete(docAttachments)
    .where(and(eq(docAttachments.id, id), eq(docAttachments.docId, docId)))
    .returning();
  return rows[0];
}
