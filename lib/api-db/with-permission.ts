import { requireSessionAuth } from "@/lib/auth-server";
import { jsonError } from "@/lib/api-db/responses";
import { syncAppUserAndPermissions } from "@/lib/auth/sync-app-user";
import { getMinHierarchyLevelForUserId } from "@/lib/db/app-users";

export type PermissionRequirement = string | string[];

export type PermittedSession = {
  token: string;
  authorizationHeader: { Authorization: string };
  permissions: string[];
  appUserId: string;
  /** Menor hierarchyLevel entre os perfis do usuário; null se sem perfil. */
  assignerHierarchyLevel: number | null;
};

type PermittedHandler = (session: PermittedSession) => Promise<Response>;

function hasAny(perms: string[], required: PermissionRequirement): boolean {
  if (Array.isArray(required)) {
    return required.some((r) => perms.includes(r));
  }
  return perms.includes(required);
}

/**
 * Executa o handler apenas com sessão válida e permissão RBAC local.
 * Retorna 401 quando não autenticado e 403 quando autenticado mas sem permissão.
 */
export async function withPermission(
  required: PermissionRequirement,
  handler: PermittedHandler,
): Promise<Response> {
  const auth = await requireSessionAuth();
  if (!auth.authenticated) return auth.response;

  // Recalcula permissões no servidor a partir do Postgres (fonte de verdade)
  const sync = await syncAppUserAndPermissions(auth.authorizationHeader);
  if (!hasAny(sync.permissions, required)) {
    return jsonError("Sem permissão para executar esta ação", 403);
  }

  return handler({
    token: auth.token,
    authorizationHeader: auth.authorizationHeader,
    permissions: sync.permissions,
    appUserId: sync.appUser.id,
    assignerHierarchyLevel: await getMinHierarchyLevelForUserId(
      sync.appUser.id,
    ),
  });
}

