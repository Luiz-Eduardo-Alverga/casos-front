import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  appUsers,
  permissions,
  rolePermissions,
  userRoles,
} from "@/db/schema";
import type { LegacyUserInput } from "@/lib/validators/db/legacy-user";

export type AppUserRow = typeof appUsers.$inferSelect;

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
