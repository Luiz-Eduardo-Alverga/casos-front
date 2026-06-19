/** Nível padrão para perfis sem classificação ou usuários sem perfil atribuído. */
export const DEFAULT_HIERARCHY_LEVEL = 999;

/** Nível de topo — perfis neste nível permanecem visíveis nas listagens filtradas. */
export const TOP_HIERARCHY_LEVEL = 1;

/**
 * Menor número entre os perfis do usuário = maior autoridade.
 * Array vazio → null (sem perfil).
 */
export function getEffectiveHierarchyLevel(
  roleLevels: number[],
): number | null {
  if (roleLevels.length === 0) return null;
  return Math.min(...roleLevels);
}

/** Perfil gerenciável quando seu nível é estritamente abaixo do atribuidor (nível 1 ↔ 1 permitido). */
export function canManageRoleLevel(
  assignerLevel: number,
  targetRoleLevel: number,
): boolean {
  if (
    assignerLevel === TOP_HIERARCHY_LEVEL &&
    targetRoleLevel === TOP_HIERARCHY_LEVEL
  ) {
    return true;
  }
  return targetRoleLevel > assignerLevel;
}

/** Perfis nível 1 visíveis na listagem apenas para editores também nível 1. */
export function isAlwaysVisibleRole(
  roleHierarchyLevel: number,
  assignerLevel: number,
): boolean {
  return (
    roleHierarchyLevel === TOP_HIERARCHY_LEVEL &&
    assignerLevel === TOP_HIERARCHY_LEVEL
  );
}

/** Usuário alvo gerenciável quando sem perfil ou nível estritamente abaixo. */
export function canManageUserLevel(
  assignerLevel: number,
  targetUserLevel: number | null,
): boolean {
  if (targetUserLevel === null) return true;
  return targetUserLevel > assignerLevel;
}

/** Usuário gerenciável pelo atribuidor (exclui auto-alteração). */
export function canManageUser(
  assignerLevel: number,
  assignerUserId: string,
  targetUserId: string,
  targetUserLevel: number | null,
): boolean {
  if (assignerUserId === targetUserId) return false;
  return canManageUserLevel(assignerLevel, targetUserLevel);
}

/** Matriz híbrida não restringe editores de topo (podem vincular qualquer permissão). */
export function isHybridPermissionRuleExempt(
  assignerHierarchyLevel: number,
): boolean {
  return assignerHierarchyLevel === TOP_HIERARCHY_LEVEL;
}

/** Usuários nível 1 visíveis na listagem apenas para editores também nível 1. */
export function isAlwaysVisibleUser(
  userHierarchyLevel: number,
  assignerLevel: number,
): boolean {
  return (
    userHierarchyLevel === TOP_HIERARCHY_LEVEL &&
    assignerLevel === TOP_HIERARCHY_LEVEL
  );
}

/** Usuário visível na listagem gerenciável. */
export function isUserVisibleInManageableList(
  targetUserLevel: number | null,
  assignerLevel: number,
  targetUserId: string,
  assignerUserId: string,
): boolean {
  if (targetUserId === assignerUserId) return true;
  if (targetUserLevel === null) return true;
  if (isAlwaysVisibleUser(targetUserLevel, assignerLevel)) return true;
  return targetUserLevel > assignerLevel;
}

/** Matriz híbrida: editor só concede permissões que possui (exceto editor nível 1). */
export function canGrantPermissions(
  editorPermissions: string[],
  permissionCodes: string[],
  assignerHierarchyLevel?: number,
): boolean {
  if (
    assignerHierarchyLevel !== undefined &&
    isHybridPermissionRuleExempt(assignerHierarchyLevel)
  ) {
    return true;
  }
  const set = new Set(editorPermissions);
  return permissionCodes.every((code) => set.has(code));
}

export function filterRolesByHierarchy<T extends { hierarchyLevel: number }>(
  roles: T[],
  assignerLevel: number,
): T[] {
  return roles.filter(
    (r) =>
      isAlwaysVisibleRole(r.hierarchyLevel, assignerLevel) ||
      canManageRoleLevel(assignerLevel, r.hierarchyLevel),
  );
}
