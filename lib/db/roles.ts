import { asc, count, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { rolePermissions, roles } from "@/db/schema";
import { ilikeContains } from "@/lib/db/search-ilike";

export type RoleRow = typeof roles.$inferSelect;
export type RoleInsert = typeof roles.$inferInsert;
export type RoleWithPermissionCountRow = RoleRow & {
  permissionsCount: number;
};

export async function listRoles(search?: string): Promise<RoleRow[]> {
  const term = search?.trim();
  const q = db.select().from(roles);
  if (term) {
    return q
      .where(
        or(
          ilikeContains(roles.name, term),
          ilikeContains(roles.description, term),
        ),
      )
      .orderBy(asc(roles.name));
  }
  return q.orderBy(asc(roles.name));
}

export async function listRolesWithPermissionCount(
  search?: string,
): Promise<RoleWithPermissionCountRow[]> {
  const term = search?.trim();
  const base = db
    .select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
      permissionsCount: count(rolePermissions.permissionId),
    })
    .from(roles)
    .leftJoin(rolePermissions, eq(rolePermissions.roleId, roles.id))
    .groupBy(roles.id);

  const rows = term
    ? await base
        .where(
          or(
            ilikeContains(roles.name, term),
            ilikeContains(roles.description, term),
          ),
        )
        .orderBy(asc(roles.name))
    : await base.orderBy(asc(roles.name));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    permissionsCount: Number(r.permissionsCount),
  }));
}

export async function getRoleById(id: string): Promise<RoleRow | undefined> {
  const rows = await db
    .select()
    .from(roles)
    .where(eq(roles.id, id))
    .limit(1);
  return rows[0];
}

export async function insertRole(values: RoleInsert): Promise<RoleRow> {
  const rows = await db.insert(roles).values(values).returning();
  const row = rows[0];
  if (!row) throw new Error("insertRole: sem retorno");
  return row;
}

export async function updateRole(
  id: string,
  values: Partial<Omit<RoleInsert, "id">>,
): Promise<RoleRow | undefined> {
  const rows = await db
    .update(roles)
    .set(values)
    .where(eq(roles.id, id))
    .returning();
  return rows[0];
}

export async function deleteRole(id: string): Promise<boolean> {
  const rows = await db
    .delete(roles)
    .where(eq(roles.id, id))
    .returning({ id: roles.id });
  return rows.length > 0;
}
