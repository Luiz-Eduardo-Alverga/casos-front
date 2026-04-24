import { asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db";
import { permissionModules, permissions } from "@/db/schema";
import { ilikeContains } from "@/lib/db/search-ilike";

type PermissionRow = typeof permissions.$inferSelect;

export type PermissionModuleRow = typeof permissionModules.$inferSelect;
export type PermissionModuleInsert = typeof permissionModules.$inferInsert;

export type PermissionModuleWithPermissions = PermissionModuleRow & {
  permissions: PermissionRow[];
};

function searchCondition(term: string) {
  return or(
    ilikeContains(permissionModules.slug, term),
    ilikeContains(permissionModules.name, term),
    ilikeContains(permissionModules.description, term),
  );
}

export async function listPermissionModules(
  search?: string,
): Promise<PermissionModuleRow[]> {
  const term = search?.trim();
  const q = db.select().from(permissionModules);
  if (term) {
    return q
      .where(searchCondition(term))
      .orderBy(
        asc(permissionModules.sortOrder),
        asc(permissionModules.name),
      );
  }
  return q.orderBy(
    asc(permissionModules.sortOrder),
    asc(permissionModules.name),
  );
}

export async function listPermissionModulesWithPermissions(
  search?: string,
): Promise<PermissionModuleWithPermissions[]> {
  const mods = await listPermissionModules(search);
  if (mods.length === 0) return [];

  const ids = mods.map((m) => m.id);
  const perms = await db
    .select()
    .from(permissions)
    .where(inArray(permissions.moduleId, ids))
    .orderBy(
      asc(permissions.moduleId),
      asc(permissions.sortOrder),
      asc(permissions.label),
    );

  const byModule = new Map<string, PermissionRow[]>();
  for (const p of perms) {
    const list = byModule.get(p.moduleId) ?? [];
    list.push(p);
    byModule.set(p.moduleId, list);
  }

  return mods.map((m) => ({
    ...m,
    permissions: byModule.get(m.id) ?? [],
  }));
}

export async function getPermissionModuleById(
  id: string,
): Promise<PermissionModuleRow | undefined> {
  const rows = await db
    .select()
    .from(permissionModules)
    .where(eq(permissionModules.id, id))
    .limit(1);
  return rows[0];
}

export async function getPermissionModuleByIdWithPermissions(
  id: string,
): Promise<PermissionModuleWithPermissions | undefined> {
  const mod = await getPermissionModuleById(id);
  if (!mod) return undefined;
  const perms = await db
    .select()
    .from(permissions)
    .where(eq(permissions.moduleId, id))
    .orderBy(asc(permissions.sortOrder), asc(permissions.label));
  return { ...mod, permissions: perms };
}

export async function insertPermissionModule(
  values: PermissionModuleInsert,
): Promise<PermissionModuleRow> {
  const rows = await db.insert(permissionModules).values(values).returning();
  const row = rows[0];
  if (!row) throw new Error("insertPermissionModule: sem retorno");
  return row;
}

export async function updatePermissionModule(
  id: string,
  values: Partial<Omit<PermissionModuleInsert, "id">>,
): Promise<PermissionModuleRow | undefined> {
  const rows = await db
    .update(permissionModules)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(permissionModules.id, id))
    .returning();
  return rows[0];
}

export async function deletePermissionModule(id: string): Promise<boolean> {
  const rows = await db
    .delete(permissionModules)
    .where(eq(permissionModules.id, id))
    .returning({ id: permissionModules.id });
  return rows.length > 0;
}
