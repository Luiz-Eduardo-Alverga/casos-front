import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { caseAttachments } from "@/db/schema";

export type CaseAttachmentRow = typeof caseAttachments.$inferSelect;
export type CaseAttachmentInsert = typeof caseAttachments.$inferInsert;

export async function countCaseAttachmentsByRegistro(
  casoRegistro: number,
): Promise<number> {
  const rows = await db
    .select({ n: count() })
    .from(caseAttachments)
    .where(eq(caseAttachments.casoRegistro, casoRegistro));
  return Number(rows[0]?.n ?? 0);
}

export async function listCaseAttachmentsByRegistro(
  casoRegistro: number,
): Promise<CaseAttachmentRow[]> {
  return db
    .select()
    .from(caseAttachments)
    .where(eq(caseAttachments.casoRegistro, casoRegistro))
    .orderBy(asc(caseAttachments.createdAt));
}

export async function getCaseAttachmentById(
  id: string,
): Promise<CaseAttachmentRow | undefined> {
  const rows = await db
    .select()
    .from(caseAttachments)
    .where(eq(caseAttachments.id, id))
    .limit(1);
  return rows[0];
}

export async function insertCaseAttachment(
  values: CaseAttachmentInsert,
): Promise<CaseAttachmentRow> {
  const rows = await db.insert(caseAttachments).values(values).returning();
  const row = rows[0];
  if (!row) throw new Error("insertCaseAttachment: sem retorno");
  return row;
}

export async function deleteCaseAttachmentById(
  id: string,
): Promise<CaseAttachmentRow | undefined> {
  const rows = await db
    .delete(caseAttachments)
    .where(eq(caseAttachments.id, id))
    .returning();
  return rows[0];
}
