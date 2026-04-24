import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import {
  permissionModules,
  permissions,
  rolePermissions,
  roles,
} from "@/db/schema";

export type RolePermissionRow = typeof rolePermissions.$inferSelect;

export class MissingPermissionIdsError extends Error {
  readonly missingPermissionIds: string[];
  constructor(missingPermissionIds: string[]) {
    super("Uma ou mais permissões não existem");
    this.name = "MissingPermissionIdsError";
    this.missingPermissionIds = missingPermissionIds;
  }
}

/** Permissão vinculada ao papel + dados do módulo (matriz na UI). */
export type RolePermissionWithDetails = {
  roleId: string;
  permissionId: string;
  permission: typeof permissions.$inferSelect;
  module: typeof permissionModules.$inferSelect;
};

export async function listRolePermissionsWithDetails(
  roleId: string,
): Promise<RolePermissionWithDetails[]> {
  const rows = await db
    .select({
      roleId: rolePermissions.roleId,
      permissionId: rolePermissions.permissionId,
      permission: permissions,
      module: permissionModules,
    })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(
      permissionModules,
      eq(permissions.moduleId, permissionModules.id),
    )
    .where(eq(rolePermissions.roleId, roleId))
    .orderBy(
      asc(permissionModules.sortOrder),
      asc(permissionModules.name),
      asc(permissions.sortOrder),
      asc(permissions.label),
    );

  return rows.map((r) => ({
    roleId: r.roleId,
    permissionId: r.permissionId,
    permission: r.permission,
    module: r.module,
  }));
}

export async function linkRolePermission(
  roleId: string,
  permissionId: string,
): Promise<RolePermissionRow> {
  const rows = await db
    .insert(rolePermissions)
    .values({ roleId, permissionId })
    .returning();
  const row = rows[0];
  if (!row) throw new Error("linkRolePermission: sem retorno");
  return row;
}

export type LinkRolePermissionsBatchResult = {
  created: RolePermissionRow[];
  /** Já vinculadas (ou duplicata no corpo) — `onConflictDoNothing` */
  skippedPermissionIds: string[];
};

/**
 * Cria vários vínculos em uma ida. Ignora pares (role, permission) já existentes.
 * Valida existência de permissões: chame com IDs únicos; retorno contém `created` e `skipped`.
 */
export async function linkRolePermissionsBatch(
  roleId: string,
  permissionIds: string[],
): Promise<LinkRolePermissionsBatchResult> {
  const unique = [...new Set(permissionIds)];
  if (unique.length === 0) {
    return { created: [], skippedPermissionIds: [] };
  }

  const existingPerms = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(inArray(permissions.id, unique));
  const existSet = new Set(existingPerms.map((p) => p.id));
  const missing = unique.filter((id) => !existSet.has(id));
  if (missing.length > 0) {
    throw new MissingPermissionIdsError(missing);
  }

  const inserted = await db
    .insert(rolePermissions)
    .values(
      unique.map((permissionId) => ({
        roleId,
        permissionId,
      })),
    )
    .onConflictDoNothing({
      target: [rolePermissions.roleId, rolePermissions.permissionId],
    })
    .returning();

  const createdIds = new Set(inserted.map((r) => r.permissionId));
  const skipped = unique.filter((id) => !createdIds.has(id));

  return { created: inserted, skippedPermissionIds: skipped };
}

export async function unlinkRolePermission(
  roleId: string,
  permissionId: string,
): Promise<boolean> {
  const rows = await db
    .delete(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
      ),
    )
    .returning({ roleId: rolePermissions.roleId });
  return rows.length > 0;
}

export async function roleExists(roleId: string): Promise<boolean> {
  const r = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.id, roleId))
    .limit(1);
  return r.length > 0;
}

export async function permissionExists(permissionId: string): Promise<boolean> {
  const r = await db
    .select({ id: permissions.id })
    .from(permissions)
    .where(eq(permissions.id, permissionId))
    .limit(1);
  return r.length > 0;
}

export async function rolePermissionLinkExists(
  roleId: string,
  permissionId: string,
): Promise<boolean> {
  const r = await db
    .select({ roleId: rolePermissions.roleId })
    .from(rolePermissions)
    .where(
      and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId),
      ),
    )
    .limit(1);
  return r.length > 0;
}

export type SyncRolePermissionsResult = {
  added: string[];
  removed: string[];
  current: string[];
};

/**
 * Sincroniza a matriz de permissões do papel em transação:
 * insere os IDs novos (com `ON CONFLICT DO NOTHING`) e remove os ausentes.
 * Lança `MissingPermissionIdsError` se algum `permissionId` não existir.
 */
export async function syncRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<SyncRolePermissionsResult> {
  const desired = [...new Set(permissionIds)];

  return db.transaction(async (tx) => {
    if (desired.length > 0) {
      const existingPerms = await tx
        .select({ id: permissions.id })
        .from(permissions)
        .where(inArray(permissions.id, desired));
      const existSet = new Set(existingPerms.map((p) => p.id));
      const missing = desired.filter((id) => !existSet.has(id));
      if (missing.length > 0) {
        throw new MissingPermissionIdsError(missing);
      }
    }

    const currentRows = await tx
      .select({ permissionId: rolePermissions.permissionId })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));
    const currentSet = new Set(currentRows.map((r) => r.permissionId));
    const desiredSet = new Set(desired);

    const toAdd = desired.filter((id) => !currentSet.has(id));
    const toRemove = [...currentSet].filter((id) => !desiredSet.has(id));

    if (toRemove.length > 0) {
      await tx
        .delete(rolePermissions)
        .where(
          and(
            eq(rolePermissions.roleId, roleId),
            inArray(rolePermissions.permissionId, toRemove),
          ),
        );
    }

    if (toAdd.length > 0) {
      await tx
        .insert(rolePermissions)
        .values(toAdd.map((permissionId) => ({ roleId, permissionId })))
        .onConflictDoNothing({
          target: [rolePermissions.roleId, rolePermissions.permissionId],
        });
    }

    return {
      added: toAdd,
      removed: toRemove,
      current: desired,
    };
  });
}
