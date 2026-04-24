import { and, asc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { permissionModules, permissions } from "@/db/schema";
import { ilikeContains } from "@/lib/db/search-ilike";

export type PermissionRow = typeof permissions.$inferSelect;
export type PermissionInsert = typeof permissions.$inferInsert;

export type PermissionWithModule = PermissionRow & {
  module: typeof permissionModules.$inferSelect;
};

function searchOr(term: string) {
  return or(
    ilikeContains(permissions.code, term),
    ilikeContains(permissions.label, term),
    ilikeContains(permissions.description, term),
  );
}

export async function listPermissions(options?: {
  search?: string;
  moduleId?: string;
}): Promise<PermissionRow[]> {
  const term = options?.search?.trim();
  const moduleId = options?.moduleId?.trim();

  const order = [
    asc(permissions.moduleId),
    asc(permissions.sortOrder),
    asc(permissions.label),
  ];

  if (term && moduleId) {
    return db
      .select()
      .from(permissions)
      .where(and(searchOr(term), eq(permissions.moduleId, moduleId)))
      .orderBy(...order);
  }
  if (term) {
    return db
      .select()
      .from(permissions)
      .where(searchOr(term))
      .orderBy(...order);
  }
  if (moduleId) {
    return db
      .select()
      .from(permissions)
      .where(eq(permissions.moduleId, moduleId))
      .orderBy(...order);
  }
  return db.select().from(permissions).orderBy(...order);
}

export async function getPermissionById(
  id: string,
): Promise<PermissionRow | undefined> {
  const rows = await db
    .select()
    .from(permissions)
    .where(eq(permissions.id, id))
    .limit(1);
  return rows[0];
}

export async function getPermissionByIdWithModule(
  id: string,
): Promise<PermissionWithModule | undefined> {
  const rows = await db
    .select({
      permission: permissions,
      module: permissionModules,
    })
    .from(permissions)
    .innerJoin(
      permissionModules,
      eq(permissions.moduleId, permissionModules.id),
    )
    .where(eq(permissions.id, id))
    .limit(1);
  const r = rows[0];
  if (!r) return undefined;
  return { ...r.permission, module: r.module };
}

export async function insertPermission(
  values: PermissionInsert,
): Promise<PermissionRow> {
  const rows = await db.insert(permissions).values(values).returning();
  const row = rows[0];
  if (!row) throw new Error("insertPermission: sem retorno");
  return row;
}

export async function updatePermission(
  id: string,
  values: Partial<Omit<PermissionInsert, "id">>,
): Promise<PermissionRow | undefined> {
  const rows = await db
    .update(permissions)
    .set(values)
    .where(eq(permissions.id, id))
    .returning();
  return rows[0];
}

export async function deletePermission(id: string): Promise<boolean> {
  const rows = await db
    .delete(permissions)
    .where(eq(permissions.id, id))
    .returning({ id: permissions.id });
  return rows.length > 0;
}
