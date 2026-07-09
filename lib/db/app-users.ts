import { and, asc, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  appUsers,
  permissions,
  rolePermissions,
  roles,
  userRoles,
} from "@/db/schema";
import type { RoleRow } from "@/lib/db/roles";
import { ilikeContains, ilikeContainsAsText } from "@/lib/db/search-ilike";
import type { LegacyUserInput } from "@/lib/validators/db/legacy-user";
import { TOP_HIERARCHY_LEVEL } from "@/lib/rbac-hierarchy";

export type AppUserRow = typeof appUsers.$inferSelect;
export type AppUserListRow = AppUserRow & {
  roleName: string | null;
  /** Menor hierarchyLevel entre os perfis do usuário; null se sem perfil. */
  roleHierarchyLevel: number | null;
};

export type AppUserWithRoles = AppUserRow & { roles: RoleRow[] };

export type ManageableUsersFilter = {
  assignerUserId: string;
  assignerLevel: number;
};

const APP_USER_GROUP_BY = [
  appUsers.id,
  appUsers.legacyUserId,
  appUsers.email,
  appUsers.nome,
  appUsers.setor,
  appUsers.usuarioGrupoId,
  appUsers.avatarPath,
  appUsers.avatarUpdatedAt,
  appUsers.createdAt,
  appUsers.updatedAt,
] as const;

function manageableUsersHaving(
  assignerLevel: number,
  assignerUserId: string,
) {
  return sql`(${appUsers.id} = ${assignerUserId}) or min(${roles.hierarchyLevel}) is null or min(${roles.hierarchyLevel}) > ${assignerLevel} or (${assignerLevel} = ${TOP_HIERARCHY_LEVEL} and min(${roles.hierarchyLevel}) = ${TOP_HIERARCHY_LEVEL})`;
}

function normalizeEmail(usuario: string): string {
  return usuario.trim().toLowerCase();
}

export async function upsertAppUserFromLegacy(
  legacy: LegacyUserInput,
): Promise<AppUserRow> {
  const email = normalizeEmail(legacy.usuario);
  const now = new Date();

  const rows = await db
    .insert(appUsers)
    .values({
      legacyUserId: legacy.id,
      email,
      nome: legacy.nome,
      setor: legacy.setor,
      usuarioGrupoId: legacy.usuario_grupo_id,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: appUsers.legacyUserId,
      set: {
        email,
        nome: legacy.nome,
        setor: legacy.setor,
        usuarioGrupoId: legacy.usuario_grupo_id,
        updatedAt: now,
      },
    })
    .returning();

  const row = rows[0];
  if (!row) {
    throw new Error("upsertAppUserFromLegacy: nenhuma linha retornada");
  }
  return row;
}

/**
 * Códigos de permissão efetivos (distinct) via papéis do usuário.
 */
export async function getPermissionCodesForUserId(
  appUserId: string,
): Promise<string[]> {
  const rows = await db
    .selectDistinct({ code: permissions.code })
    .from(userRoles)
    .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(eq(userRoles.userId, appUserId));

  return rows.map((r) => r.code).sort();
}

export async function listAppUsers(search?: string): Promise<AppUserListRow[]> {
  const term = search?.trim();
  const base = db
    .select({
      user: appUsers,
      roleName: sql<string | null>`min(${roles.name})`.as("role_name"),
      roleHierarchyLevel: sql<
        number | null
      >`min(${roles.hierarchyLevel})`.as("role_hierarchy_level"),
    })
    .from(appUsers)
    .leftJoin(userRoles, eq(userRoles.userId, appUsers.id))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .groupBy(...APP_USER_GROUP_BY);

  const rows = term
    ? await base
        .where(
          or(
            ilikeContains(appUsers.email, term),
            ilikeContains(appUsers.nome, term),
            ilikeContainsAsText(appUsers.legacyUserId, term),
          ),
        )
        .orderBy(asc(appUsers.nome), asc(appUsers.email))
    : await base.orderBy(asc(appUsers.nome), asc(appUsers.email));

  return rows.map((row) => ({
    ...row.user,
    roleName: row.roleName ?? null,
    roleHierarchyLevel: row.roleHierarchyLevel ?? null,
  }));
}

export interface ListAppUsersPageResult {
  items: AppUserListRow[];
  nextCursor: number | null;
  total: number;
}

async function countAppUsers(
  search?: string,
  manageableBy?: ManageableUsersFilter,
): Promise<number> {
  const term = search?.trim();

  if (!manageableBy) {
    const base = db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(appUsers);

    const rows = term
      ? await base.where(
          or(
            ilikeContains(appUsers.email, term),
            ilikeContains(appUsers.nome, term),
            ilikeContainsAsText(appUsers.legacyUserId, term),
          ),
        )
      : await base;

    return rows[0]?.count ?? 0;
  }

  const searchCondition = term
    ? or(
        ilikeContains(appUsers.email, term),
        ilikeContains(appUsers.nome, term),
        ilikeContainsAsText(appUsers.legacyUserId, term),
      )
    : undefined;

  const manageableSubquery = db
    .select({ id: appUsers.id })
    .from(appUsers)
    .leftJoin(userRoles, eq(userRoles.userId, appUsers.id))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .where(searchCondition ?? undefined)
    .groupBy(...APP_USER_GROUP_BY)
    .having(
      manageableUsersHaving(
        manageableBy.assignerLevel,
        manageableBy.assignerUserId,
      ),
    )
    .as("manageable_users");

  const rows = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(manageableSubquery);

  return rows[0]?.count ?? 0;
}

export async function listAppUsersPage(params: {
  search?: string;
  limit: number;
  cursor?: number;
  manageableBy?: ManageableUsersFilter;
}): Promise<ListAppUsersPageResult> {
  const term = params.search?.trim();
  const limit =
    typeof params.limit === "number" && Number.isFinite(params.limit)
      ? Math.max(1, params.limit)
      : 20;
  const cursor =
    typeof params.cursor === "number" && Number.isFinite(params.cursor)
      ? Math.max(0, params.cursor)
      : 0;

  const base = db
    .select({
      user: appUsers,
      roleName: sql<string | null>`min(${roles.name})`.as("role_name"),
      roleHierarchyLevel: sql<
        number | null
      >`min(${roles.hierarchyLevel})`.as("role_hierarchy_level"),
    })
    .from(appUsers)
    .leftJoin(userRoles, eq(userRoles.userId, appUsers.id))
    .leftJoin(roles, eq(userRoles.roleId, roles.id))
    .groupBy(...APP_USER_GROUP_BY);

  const searchCondition = term
    ? or(
        ilikeContains(appUsers.email, term),
        ilikeContains(appUsers.nome, term),
        ilikeContainsAsText(appUsers.legacyUserId, term),
      )
    : undefined;

  let query = base;

  if (params.manageableBy) {
    query = query
      .where(searchCondition ?? undefined)
      .having(
        manageableUsersHaving(
          params.manageableBy.assignerLevel,
          params.manageableBy.assignerUserId,
        ),
      )
      .orderBy(asc(appUsers.nome), asc(appUsers.email)) as typeof base;
  } else if (searchCondition) {
    query = query
      .where(searchCondition)
      .orderBy(asc(appUsers.nome), asc(appUsers.email)) as typeof base;
  } else {
    query = query.orderBy(
      asc(appUsers.nome),
      asc(appUsers.email),
    ) as typeof base;
  }

  const [rows, total] = await Promise.all([
    query.limit(limit).offset(cursor),
    countAppUsers(term, params.manageableBy),
  ]);

  const items = rows.map((row) => ({
    ...row.user,
    roleName: row.roleName ?? null,
    roleHierarchyLevel: row.roleHierarchyLevel ?? null,
  }));

  return {
    items,
    nextCursor: items.length >= limit ? cursor + limit : null,
    total,
  };
}

export async function getAppUserById(
  id: string,
): Promise<AppUserRow | undefined> {
  const rows = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.id, id))
    .limit(1);
  return rows[0];
}

export async function getAppUserByLegacyUserId(
  legacyUserId: number,
): Promise<AppUserRow | undefined> {
  const rows = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.legacyUserId, legacyUserId))
    .limit(1);
  return rows[0];
}

export async function listRolesForAppUserId(
  userId: string,
): Promise<RoleRow[]> {
  return db
    .select({ role: roles })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))
    .orderBy(asc(roles.name))
    .then((rows) => rows.map((r) => r.role));
}

/** Menor hierarchyLevel entre os perfis do usuário (mais senior); null se sem perfil. */
export async function getMinHierarchyLevelForUserId(
  userId: string,
): Promise<number | null> {
  const rows = await db
    .select({ level: roles.hierarchyLevel })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  if (rows.length === 0) return null;
  return Math.min(...rows.map((r) => r.level));
}

export async function getAppUserByIdWithRoles(
  id: string,
): Promise<AppUserWithRoles | undefined> {
  const user = await getAppUserById(id);
  if (!user) return undefined;
  const roleRows = await listRolesForAppUserId(id);
  return { ...user, roles: roleRows };
}

export async function linkUserRole(
  userId: string,
  roleId: string,
): Promise<{ userId: string; roleId: string }> {
  const rows = await db
    .insert(userRoles)
    .values({ userId, roleId })
    .returning();
  const row = rows[0];
  if (!row) throw new Error("linkUserRole: sem retorno");
  return row;
}

export async function unlinkUserRole(
  userId: string,
  roleId: string,
): Promise<boolean> {
  const rows = await db
    .delete(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
    .returning({ userId: userRoles.userId });
  return rows.length > 0;
}

/**
 * Substitui o perfil do usuário em transação:
 * remove vínculos atuais em `user_roles` e vincula apenas o `roleId` informado.
 */
export async function replaceUserRole(
  userId: string,
  roleId: string,
): Promise<{ userId: string; roleId: string }> {
  return db.transaction(async (tx) => {
    await tx.delete(userRoles).where(eq(userRoles.userId, userId));

    const rows = await tx
      .insert(userRoles)
      .values({ userId, roleId })
      .returning();
    const row = rows[0];
    if (!row) throw new Error("replaceUserRole: sem retorno");
    return row;
  });
}

export async function userRoleLinkExists(
  userId: string,
  roleId: string,
): Promise<boolean> {
  const r = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
    .limit(1);
  return r.length > 0;
}

export async function updateAppUserAvatar(
  userId: string,
  avatarPath: string,
): Promise<AppUserRow> {
  const now = new Date();
  const rows = await db
    .update(appUsers)
    .set({
      avatarPath,
      avatarUpdatedAt: now,
      updatedAt: now,
    })
    .where(eq(appUsers.id, userId))
    .returning();

  const row = rows[0];
  if (!row) throw new Error("updateAppUserAvatar: usuário não encontrado");
  return row;
}

export async function clearAppUserAvatar(userId: string): Promise<AppUserRow> {
  const now = new Date();
  const rows = await db
    .update(appUsers)
    .set({
      avatarPath: null,
      avatarUpdatedAt: null,
      updatedAt: now,
    })
    .where(eq(appUsers.id, userId))
    .returning();

  const row = rows[0];
  if (!row) throw new Error("clearAppUserAvatar: usuário não encontrado");
  return row;
}
