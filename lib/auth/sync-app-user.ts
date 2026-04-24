import type { AppUserSummary } from "@/lib/auth";
import {
  getPermissionCodesForUserId,
  linkUserRole,
  listRolesForAppUserId,
  upsertAppUserFromLegacy,
  type AppUserRow,
} from "@/lib/db/app-users";
import { getLegacyUserFromToken } from "@/lib/legacy-auth/me";
import { legacyUserSchema } from "@/lib/validators/db/legacy-user";

export type SyncAppUserResult = {
  appUser: AppUserRow;
  permissions: string[];
};

const DEFAULT_ROLE_NON_SQUAD = "a668ee62-30f8-482d-ac33-ca2d591a950b";
const DEFAULT_ROLE_SQUAD = "22917bd2-02c4-467d-a152-b7edfa757166";

function includesSquad(setor: string): boolean {
  return setor.toUpperCase().includes("SQUAD");
}

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

  // Role padrão: se o usuário não tiver roles vinculadas, atribui baseado em `setor`.
  const existingRoles = await listRolesForAppUserId(appUser.id);
  if (existingRoles.length === 0) {
    const roleId = includesSquad(parsed.data.setor)
      ? DEFAULT_ROLE_SQUAD
      : DEFAULT_ROLE_NON_SQUAD;
    await linkUserRole(appUser.id, roleId);
  }

  const permissions = await getPermissionCodesForUserId(appUser.id);
  return { appUser, permissions };
}
