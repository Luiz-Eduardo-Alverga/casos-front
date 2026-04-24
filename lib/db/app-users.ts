import { and, asc, eq, or } from "drizzle-orm";
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

export type AppUserRow = typeof appUsers.$inferSelect;

export type AppUserWithRoles = AppUserRow & { roles: RoleRow[] };

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
    .innerJoin(
      permissions,
      eq(rolePermissions.permissionId, permissions.id),
    )
    .where(eq(userRoles.userId, appUserId));

  return rows.map((r) => r.code).sort();
}

export async function listAppUsers(search?: string): Promise<AppUserRow[]> {
  const term = search?.trim();
  const q = db.select().from(appUsers);
  if (term) {
    return q
      .where(
        or(
          ilikeContains(appUsers.email, term),
          ilikeContains(appUsers.nome, term),
          ilikeContainsAsText(appUsers.legacyUserId, term),
        ),
      )
      .orderBy(asc(appUsers.nome), asc(appUsers.email));
  }
  return q.orderBy(asc(appUsers.nome), asc(appUsers.email));
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
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)),
    )
    .returning({ userId: userRoles.userId });
  return rows.length > 0;
}

export async function userRoleLinkExists(
  userId: string,
  roleId: string,
): Promise<boolean> {
  const r = await db
    .select({ userId: userRoles.userId })
    .from(userRoles)
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)),
    )
    .limit(1);
  return r.length > 0;
}
