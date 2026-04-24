import { getPermissions } from "@/lib/auth";

export type PermissionCode = string;

/**
 * Retorna `true` se a lista de permissões (RBAC) já foi carregada no client.
 * - `null` significa "ainda não sincronizou" (ex.: primeiro acesso pós-login).
 */
export function permissionsLoaded(): boolean {
  return getPermissions() !== null;
}

export function hasPermission(code: PermissionCode): boolean {
  const perms = getPermissions();
  if (!perms) return false;
  return perms.includes(code);
}

export function hasAnyPermission(codes: PermissionCode[]): boolean {
  const perms = getPermissions();
  if (!perms) return false;
  for (const c of codes) {
    if (perms.includes(c)) return true;
  }
  return false;
}

