import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  lt,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  appUsers,
  docActivity,
  docCategories,
  docLinks,
  docs,
  docTagLinks,
  docTags,
} from "@/db/schema";
import { normalizeDocTags } from "@/lib/db/docs-utils";
import type {
  CreateDocCategoryInput,
  CreateDocInput,
  DocLinkInput,
  ListDocsQuery,
  UpdateDocInput,
} from "@/lib/validators/db/doc";

const ownerUser = alias(appUsers, "doc_owner_user");
const updatedUser = alias(appUsers, "doc_updated_user");

export class InvalidDocCursorError extends Error {
  constructor() {
    super("Cursor de paginação inválido");
    this.name = "InvalidDocCursorError";
  }
}

type DocCursor = { updatedAt: Date; id: string };

function encodeCursor(cursor: DocCursor): string {
  return Buffer.from(
    JSON.stringify({
      updatedAt: cursor.updatedAt.toISOString(),
      id: cursor.id,
    }),
  ).toString("base64url");
}

function decodeCursor(value: string): DocCursor {
  try {
    const parsed = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    ) as { updatedAt?: unknown; id?: unknown };
    const updatedAt = new Date(String(parsed.updatedAt));
    if (
      Number.isNaN(updatedAt.getTime()) ||
      typeof parsed.id !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(parsed.id)
    ) {
      throw new InvalidDocCursorError();
    }
    return { updatedAt, id: parsed.id };
  } catch (error) {
    if (error instanceof InvalidDocCursorError) throw error;
    throw new InvalidDocCursorError();
  }
}

function listConditions(params: ListDocsQuery): SQL[] {
  const conditions: SQL[] = [];
  if (params.categoryId) {
    conditions.push(eq(docs.categoryId, params.categoryId));
  }
  if (params.status) conditions.push(eq(docs.status, params.status));
  if (params.sector) conditions.push(ilike(docs.sector, params.sector));
  if (params.search) {
    conditions.push(
      sql`docs.search_tsv @@ plainto_tsquery('portuguese', ${params.search})`,
    );
  }
  if (params.tag) {
    conditions.push(sql`exists (
      select 1
      from ${docTagLinks}
      inner join ${docTags} on ${docTags.id} = ${docTagLinks.tagId}
      where ${docTagLinks.docId} = ${docs.id}
        and ${docTags.label} = ${params.tag}
    )`);
  }
  if (params.entityType && params.entityId) {
    conditions.push(sql`exists (
      select 1
      from ${docLinks}
      where ${docLinks.docId} = ${docs.id}
        and ${docLinks.entityType} = ${params.entityType}
        and ${docLinks.entityId} = ${params.entityId}
    )`);
  }
  if (params.cursor) {
    const cursor = decodeCursor(params.cursor);
    conditions.push(
      or(
        lt(docs.updatedAt, cursor.updatedAt),
        and(eq(docs.updatedAt, cursor.updatedAt), lt(docs.id, cursor.id)),
      )!,
    );
  }
  return conditions;
}

async function tagsByDocIds(docIds: string[]): Promise<Map<string, string[]>> {
  const result = new Map<string, string[]>();
  if (docIds.length === 0) return result;
  const rows = await db
    .select({ docId: docTagLinks.docId, label: docTags.label })
    .from(docTagLinks)
    .innerJoin(docTags, eq(docTagLinks.tagId, docTags.id))
    .where(inArray(docTagLinks.docId, docIds))
    .orderBy(asc(docTags.label));
  for (const row of rows) {
    const current = result.get(row.docId) ?? [];
    current.push(row.label);
    result.set(row.docId, current);
  }
  return result;
}

export type DocListItemRow = typeof docs.$inferSelect & {
  categoryName: string;
  categorySlug: string;
  ownerName: string | null;
  updatedByName: string | null;
  tags: string[];
};

export type ListDocsResult = {
  items: DocListItemRow[];
  nextCursor: string | null;
  total: number;
};

export async function listDocs(
  params: ListDocsQuery,
): Promise<ListDocsResult> {
  const conditions = listConditions(params);
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const rank = params.search
    ? sql<number>`ts_rank(docs.search_tsv, plainto_tsquery('portuguese', ${params.search}))`
    : sql<number>`0`;

  const base = db
    .select({
      doc: docs,
      categoryName: docCategories.name,
      categorySlug: docCategories.slug,
      ownerName: ownerUser.nome,
      updatedByName: updatedUser.nome,
      rank,
    })
    .from(docs)
    .innerJoin(docCategories, eq(docs.categoryId, docCategories.id))
    .leftJoin(ownerUser, eq(docs.ownerUserId, ownerUser.id))
    .leftJoin(updatedUser, eq(docs.updatedBy, updatedUser.id))
    .where(where)
    .orderBy(
      ...(params.search ? [desc(rank)] : []),
      desc(docs.updatedAt),
      desc(docs.id),
    )
    .limit(params.limit + 1);

  const countConditions = listConditions({ ...params, cursor: undefined });
  const countWhere =
    countConditions.length > 0 ? and(...countConditions) : undefined;

  const [rows, countRows] = await Promise.all([
    base,
    db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(docs)
      .where(countWhere),
  ]);

  const hasNextPage = rows.length > params.limit;
  const pageRows = hasNextPage ? rows.slice(0, params.limit) : rows;
  const tagMap = await tagsByDocIds(pageRows.map((row) => row.doc.id));
  const items = pageRows.map((row) => ({
    ...row.doc,
    categoryName: row.categoryName,
    categorySlug: row.categorySlug,
    ownerName: row.ownerName ?? null,
    updatedByName: row.updatedByName ?? null,
    tags: tagMap.get(row.doc.id) ?? [],
  }));
  const last = items.at(-1);
  const nextCursor =
    hasNextPage && last
      ? encodeCursor({
          updatedAt: last.updatedAt ?? new Date(0),
          id: last.id,
        })
      : null;

  return { items, nextCursor, total: countRows[0]?.value ?? 0 };
}

export type DocDetailRow = typeof docs.$inferSelect & {
  category: typeof docCategories.$inferSelect;
  owner: typeof appUsers.$inferSelect | null;
  tags: string[];
  links: (typeof docLinks.$inferSelect)[];
};

export async function docExists(id: string): Promise<boolean> {
  const rows = await db
    .select({ id: docs.id })
    .from(docs)
    .where(eq(docs.id, id))
    .limit(1);
  return rows.length > 0;
}

export async function getDocById(
  id: string,
): Promise<DocDetailRow | undefined> {
  const rows = await db
    .select({ doc: docs, category: docCategories, owner: ownerUser })
    .from(docs)
    .innerJoin(docCategories, eq(docs.categoryId, docCategories.id))
    .leftJoin(ownerUser, eq(docs.ownerUserId, ownerUser.id))
    .where(eq(docs.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return undefined;

  const [tagRows, links] = await Promise.all([
    db
      .select({ label: docTags.label })
      .from(docTagLinks)
      .innerJoin(docTags, eq(docTagLinks.tagId, docTags.id))
      .where(eq(docTagLinks.docId, id))
      .orderBy(asc(docTags.label)),
    db
      .select()
      .from(docLinks)
      .where(eq(docLinks.docId, id))
      .orderBy(asc(docLinks.entityType), asc(docLinks.entityLabel)),
  ]);

  return {
    ...row.doc,
    category: row.category,
    owner: row.owner ?? null,
    tags: tagRows.map((tag) => tag.label),
    links,
  };
}

async function upsertTags(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  labels: string[],
) {
  if (labels.length === 0) return [];
  return tx
    .insert(docTags)
    .values(labels.map((label) => ({ label })))
    .onConflictDoUpdate({
      target: docTags.label,
      set: { label: sql`excluded.label` },
    })
    .returning();
}

async function syncDocTags(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  docId: string,
  inputTags: string[],
) {
  const desiredLabels = normalizeDocTags(inputTags);
  const desiredTags = await upsertTags(tx, desiredLabels);
  const current = await tx
    .select({ tagId: docTagLinks.tagId })
    .from(docTagLinks)
    .where(eq(docTagLinks.docId, docId));
  const currentIds = new Set(current.map((row) => row.tagId));
  const desiredIds = new Set(desiredTags.map((tag) => tag.id));
  const toRemove = current
    .map((row) => row.tagId)
    .filter((tagId) => !desiredIds.has(tagId));
  const toAdd = desiredTags
    .map((tag) => tag.id)
    .filter((tagId) => !currentIds.has(tagId));

  if (toRemove.length > 0) {
    await tx
      .delete(docTagLinks)
      .where(
        and(
          eq(docTagLinks.docId, docId),
          inArray(docTagLinks.tagId, toRemove),
        ),
      );
  }
  if (toAdd.length > 0) {
    await tx
      .insert(docTagLinks)
      .values(toAdd.map((tagId) => ({ docId, tagId })))
      .onConflictDoNothing();
  }
}

function docLinkKey(link: Pick<DocLinkInput, "entityType" | "entityId">) {
  return `${link.entityType}:${link.entityId}`;
}

async function syncDocLinks(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  docId: string,
  desired: DocLinkInput[],
) {
  const unique = [
    ...new Map(desired.map((link) => [docLinkKey(link), link])).values(),
  ];
  const current = await tx
    .select()
    .from(docLinks)
    .where(eq(docLinks.docId, docId));
  const desiredByKey = new Map(unique.map((link) => [docLinkKey(link), link]));
  const currentByKey = new Map(
    current.map((link) => [docLinkKey(link), link]),
  );
  const removeIds = current
    .filter((link) => !desiredByKey.has(docLinkKey(link)))
    .map((link) => link.id);
  if (removeIds.length > 0) {
    await tx.delete(docLinks).where(inArray(docLinks.id, removeIds));
  }
  for (const link of current) {
    const desiredLink = desiredByKey.get(docLinkKey(link));
    if (desiredLink && desiredLink.entityLabel !== link.entityLabel) {
      await tx
        .update(docLinks)
        .set({ entityLabel: desiredLink.entityLabel })
        .where(eq(docLinks.id, link.id));
    }
  }
  const toAdd = unique.filter(
    (link) => !currentByKey.has(docLinkKey(link)),
  );
  if (toAdd.length > 0) {
    await tx
      .insert(docLinks)
      .values(toAdd.map((link) => ({ docId, ...link })));
  }
}

export async function createDoc(input: CreateDocInput, userId: string) {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(docs)
      .values({
        title: input.title,
        summary: input.summary ?? null,
        contentMd: input.contentMd,
        categoryId: input.categoryId,
        status: input.status,
        sector: input.sector ?? null,
        ownerUserId: input.ownerUserId ?? null,
        reviewDueAt: input.reviewDueAt ?? null,
        createdBy: userId,
        updatedBy: userId,
      })
      .returning();
    const doc = inserted[0];
    if (!doc) throw new Error("createDoc: nenhuma linha retornada");

    await syncDocTags(tx, doc.id, input.tags ?? []);
    await syncDocLinks(tx, doc.id, input.links ?? []);
    await tx.insert(docActivity).values({
      docId: doc.id,
      userId,
      action: "created",
    });
    if (doc.status === "publicado") {
      await tx.insert(docActivity).values({
        docId: doc.id,
        userId,
        action: "published",
      });
    }
    return doc;
  });
}

export async function updateDoc(
  id: string,
  input: UpdateDocInput,
  userId: string,
) {
  return db.transaction(async (tx) => {
    const currentRows = await tx
      .select()
      .from(docs)
      .where(eq(docs.id, id))
      .limit(1);
    const current = currentRows[0];
    if (!current) return undefined;

    const updatedRows = await tx
      .update(docs)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.summary !== undefined
          ? { summary: input.summary || null }
          : {}),
        ...(input.contentMd !== undefined
          ? { contentMd: input.contentMd }
          : {}),
        ...(input.categoryId !== undefined
          ? { categoryId: input.categoryId }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.sector !== undefined
          ? { sector: input.sector || null }
          : {}),
        ...(input.ownerUserId !== undefined
          ? { ownerUserId: input.ownerUserId || null }
          : {}),
        ...(input.reviewDueAt !== undefined
          ? { reviewDueAt: input.reviewDueAt }
          : {}),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(docs.id, id))
      .returning();
    const updated = updatedRows[0];
    if (!updated) return undefined;

    if (input.tags !== undefined) {
      await syncDocTags(tx, id, input.tags);
    }
    if (input.links !== undefined) {
      await syncDocLinks(tx, id, input.links);
    }
    await tx.insert(docActivity).values({
      docId: id,
      userId,
      action: "updated",
    });
    if (input.status === "publicado" && current.status !== "publicado") {
      await tx.insert(docActivity).values({
        docId: id,
        userId,
        action: "published",
      });
    }
    if (
      input.status === "desatualizado" &&
      current.status !== "desatualizado"
    ) {
      await tx.insert(docActivity).values({
        docId: id,
        userId,
        action: "archived",
      });
    }
    return updated;
  });
}

export async function deleteDoc(id: string): Promise<boolean> {
  const rows = await db
    .delete(docs)
    .where(eq(docs.id, id))
    .returning({ id: docs.id });
  return rows.length > 0;
}

export async function listDocActivity(docId: string) {
  return db
    .select({
      id: docActivity.id,
      docId: docActivity.docId,
      userId: docActivity.userId,
      userName: appUsers.nome,
      action: docActivity.action,
      createdAt: docActivity.createdAt,
    })
    .from(docActivity)
    .innerJoin(appUsers, eq(docActivity.userId, appUsers.id))
    .where(eq(docActivity.docId, docId))
    .orderBy(desc(docActivity.createdAt), desc(docActivity.id));
}

export async function listDocCategories() {
  return db
    .select()
    .from(docCategories)
    .orderBy(asc(docCategories.sortOrder), asc(docCategories.name));
}

export async function createDocCategory(input: CreateDocCategoryInput) {
  const rows = await db
    .insert(docCategories)
    .values({
      name: input.name,
      slug: input.slug,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  const row = rows[0];
  if (!row) throw new Error("createDocCategory: nenhuma linha retornada");
  return row;
}

export async function searchDocTags(term: string) {
  const normalized = term.trim();
  const base = db.select().from(docTags);
  return normalized
    ? base
        .where(ilike(docTags.label, `%${normalized}%`))
        .orderBy(asc(docTags.label))
        .limit(20)
    : base.orderBy(asc(docTags.label)).limit(20);
}
