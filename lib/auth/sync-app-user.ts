import type { AppUserSummary } from "@/lib/auth";
import {
  getPermissionCodesForUserId,
  upsertAppUserFromLegacy,
  type AppUserRow,
} from "@/lib/db/app-users";
import { getLegacyUserFromToken } from "@/lib/legacy-auth/me";
import { legacyUserSchema } from "@/lib/validators/db/legacy-user";

export type SyncAppUserResult = {
  appUser: AppUserRow;
  permissions: string[];
};

export function appUserToSummary(row: AppUserRow): AppUserSummary {
  return {
    id: row.id,
    legacyUserId: row.legacyUserId,
    email: row.email,
    nome: row.nome,
    setor: row.setor,
    usuarioGrupoId: row.usuarioGrupoId,
  };
}

export class SyncAppUserValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SyncAppUserValidationError";
  }
}

/**
 * Sincroniza `app_users` a partir do usuário Soft Flow e retorna permissões locais (RBAC).
 * Se `legacyUser` for informado (ex.: resposta do `POST /auth/login`), evita `GET /auth/me`.
 */
export async function syncAppUserAndPermissions(
  authorizationHeader: { Authorization: string },
  options?: { legacyUser?: unknown },
): Promise<SyncAppUserResult> {
  let raw: unknown;
  if (options?.legacyUser !== undefined) {
    raw = options.legacyUser;
  } else {
    raw = await getLegacyUserFromToken(authorizationHeader);
  }

  const parsed = legacyUserSchema.safeParse(raw);
  if (!parsed.success) {
    throw new SyncAppUserValidationError(
      "Resposta de usuário inválida (login ou /auth/me)",
    );
  }

  const appUser = await upsertAppUserFromLegacy(parsed.data);
  const permissions = await getPermissionCodesForUserId(appUser.id);
  return { appUser, permissions };
}
