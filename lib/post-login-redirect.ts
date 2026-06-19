import { getSafeInternalReturnPath } from "@/lib/safe-callback-url";

function hasAny(perms: string[], codes: string[]): boolean {
  return codes.some((c) => perms.includes(c));
}

/** Primeira rota "home" que o usuário pode acessar (ordem alinhada ao menu). */
export function getDefaultLandingPath(permissions: string[]): string {
  if (permissions.includes("list-painel-dev")) return "/painel";
  if (hasAny(permissions, ["list-case", "list-report"])) return "/casos";
  if (permissions.includes("list-project")) return "/projetos";
  if (hasAny(permissions, ["audit-all-users", "audit-user"])) {
    return "/auditoria/horas-colaboradores";
  }
  if (permissions.includes("list-acquirer")) return "/cadastros/adquirentes";
  if (permissions.includes("list-user")) return "/configuracoes/usuarios";
  if (permissions.includes("assign-user-role")) return "/configuracoes/perfis";
  return "/avisos";
}

/** Verifica se o usuário pode acessar um path (prefixos das rotas protegidas). */
export function canAccessPath(path: string, permissions: string[]): boolean {
  if (path === "/painel" || path.startsWith("/painel/")) {
    return permissions.includes("list-painel-dev");
  }
  if (path === "/casos" || path.startsWith("/casos/")) {
    return hasAny(permissions, ["list-case", "list-report"]);
  }
  if (path === "/projetos" || path.startsWith("/projetos/")) {
    return permissions.includes("list-project");
  }
  if (path.startsWith("/auditoria/")) {
    return hasAny(permissions, ["audit-all-users", "audit-user"]);
  }
  if (path.startsWith("/cadastros/")) {
    return permissions.includes("list-acquirer");
  }
  if (path.startsWith("/configuracoes/usuarios")) {
    return permissions.includes("list-user");
  }
  if (path.startsWith("/configuracoes/perfis")) {
    return permissions.includes("assign-user-role");
  }
  return true;
}

export function resolvePostLoginPath(
  callbackUrl: string | null | undefined,
  permissions: string[] | null | undefined,
): string {
  const perms = permissions ?? [];
  const safePath = getSafeInternalReturnPath(callbackUrl);

  if (safePath && canAccessPath(safePath, perms)) {
    return safePath;
  }

  return getDefaultLandingPath(perms);
}
