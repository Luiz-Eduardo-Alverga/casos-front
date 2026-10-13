import { TOP_HIERARCHY_LEVEL } from "@/lib/rbac-hierarchy";

export const DEFAULT_ROLE_NON_SQUAD = "a668ee62-30f8-482d-ac33-ca2d591a950b";
export const DEFAULT_ROLE_SQUAD = "22917bd2-02c4-467d-a152-b7edfa757166";
export const DEFAULT_ROLE_FRANQUIA = "ef2d38f9-3af7-4a79-b463-d93b8b18ccdb";

/** Perfis padrão de primeiro acesso: não podem ser excluídos. */
export const PROTECTED_ROLE_IDS = new Set([
  DEFAULT_ROLE_NON_SQUAD,
  DEFAULT_ROLE_SQUAD,
  DEFAULT_ROLE_FRANQUIA,
]);

export function isFranquiaSetor(setor: string): boolean {
  return setor.trim().toUpperCase() === "FRANQUIA";
}

/**
 * O perfil de franquia só pode ser editado por hierarquia nível 1.
 * Os demais perfis seguem a regra genérica de hierarquia.
 */
export function canEditFranquiaRole(
  roleId: string,
  assignerLevel: number | null,
): boolean {
  if (roleId !== DEFAULT_ROLE_FRANQUIA) return true;
  return assignerLevel === TOP_HIERARCHY_LEVEL;
}
