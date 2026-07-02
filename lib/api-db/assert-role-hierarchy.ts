import { jsonError } from "@/lib/api-db/responses";
import type { PermittedSession } from "@/lib/api-db/with-permission";
import {
  getMinHierarchyLevelForUserId,
} from "@/lib/db/app-users";
import { getRoleById } from "@/lib/db/roles";
import {
  canGrantPermissions,
  canManageRoleLevel,
  canManageUserLevel,
} from "@/lib/rbac-hierarchy";

export function assertNotSelfAssignment(
  assignerId: string,
  targetUserId: string,
): Response | null {
  if (assignerId === targetUserId) {
    return jsonError("Você não pode alterar o seu próprio perfil.", 403);
  }
  return null;
}

export function assertCanManageUserLevel(
  assignerLevel: number,
  targetUserLevel: number | null,
): Response | null {
  if (!canManageUserLevel(assignerLevel, targetUserLevel)) {
    return jsonError(
      "Você não pode alterar o perfil de um usuário com hierarquia igual ou superior à sua.",
      403,
    );
  }
  return null;
}

export function assertCanManageRoleLevel(
  assignerLevel: number,
  targetRoleLevel: number,
  message = "Você não pode gerenciar um perfil com hierarquia igual ou superior à sua.",
): Response | null {
  if (!canManageRoleLevel(assignerLevel, targetRoleLevel)) {
    return jsonError(message, 403);
  }
  return null;
}

export function assertCanGrantPermissionCodes(
  editorPermissions: string[],
  permissionCodes: string[],
  assignerHierarchyLevel?: number,
): Response | null {
  if (
    !canGrantPermissions(
      editorPermissions,
      permissionCodes,
      assignerHierarchyLevel,
    )
  ) {
    return jsonError(
      "Você não pode conceder permissões que você não possui.",
      403,
    );
  }
  return null;
}

export function assertHasAssignableHierarchy(
  assignerLevel: number | null,
): Response | null {
  if (assignerLevel === null) {
    return jsonError(
      "Seu usuário não possui perfil atribuído para delegar acesso.",
      403,
    );
  }
  return null;
}

/** Valida se o usuário pode gerenciar o perfil alvo (por ID). */
export async function assertCanManageRoleById(
  assignerLevel: number | null,
  roleId: string,
): Promise<Response | null> {
  const noHierarchy = assertHasAssignableHierarchy(assignerLevel);
  if (noHierarchy) return noHierarchy;

  const role = await getRoleById(roleId);
  if (!role) return jsonError("Papel não encontrado", 404);

  return assertCanManageRoleLevel(assignerLevel!, role.hierarchyLevel);
}

/** Valida atribuição/troca de perfil (auto-bloqueio + hierarquia alvo + perfil novo). */
export async function validateUserRoleAssignment(
  session: PermittedSession,
  targetUserId: string,
  roleId: string,
): Promise<Response | null> {
  const noHierarchy = assertHasAssignableHierarchy(session.assignerHierarchyLevel);
  if (noHierarchy) return noHierarchy;

  const assignerLevel = session.assignerHierarchyLevel!;

  const selfDenied = assertNotSelfAssignment(session.appUserId, targetUserId);
  if (selfDenied) return selfDenied;

  const targetLevel = await getMinHierarchyLevelForUserId(targetUserId);
  const userDenied = assertCanManageUserLevel(assignerLevel, targetLevel);
  if (userDenied) return userDenied;

  const role = await getRoleById(roleId);
  if (!role) return jsonError("Papel não encontrado", 404);

  return assertCanManageRoleLevel(
    assignerLevel,
    role.hierarchyLevel,
    "Você não pode atribuir um perfil com hierarquia igual ou superior à sua.",
  );
}

/** Valida remoção de perfil de usuário (auto-bloqueio + hierarquia alvo + perfil removido). */
export async function validateUserRoleRemoval(
  session: PermittedSession,
  targetUserId: string,
  roleId: string,
): Promise<Response | null> {
  const noHierarchy = assertHasAssignableHierarchy(session.assignerHierarchyLevel);
  if (noHierarchy) return noHierarchy;

  const assignerLevel = session.assignerHierarchyLevel!;

  const selfDenied = assertNotSelfAssignment(session.appUserId, targetUserId);
  if (selfDenied) return selfDenied;

  const targetLevel = await getMinHierarchyLevelForUserId(targetUserId);
  const userDenied = assertCanManageUserLevel(assignerLevel, targetLevel);
  if (userDenied) return userDenied;

  const role = await getRoleById(roleId);
  if (!role) return jsonError("Papel não encontrado", 404);

  return assertCanManageRoleLevel(
    assignerLevel,
    role.hierarchyLevel,
    "Você não pode remover um perfil com hierarquia igual ou superior à sua.",
  );
}
