import { getSafeInternalReturnPath } from "@/lib/safe-callback-url";

function hasAny(perms: string[], codes: string[]): boolean {
  return codes.some((c) => perms.includes(c));
}

/** Primeira rota "home" que o usuário pode acessar (ordem alinhada ao menu). */
export function getDefaultLandingPath(permissions: string[]): string {
  if (permissions.includes("list-painel-dev")) return "/painel";
  if (permissions.includes("list-minha-visao")) return "/painel/minha-visao";
  if (permissions.includes("list-case")) return "/casos";
  if (permissions.includes("list-report")) return "/reports";
  if (permissions.includes("list-project")) return "/projetos";
  if (permissions.includes("list-product")) return "/produtos";
  if (permissions.includes("list-release")) return "/liberacoes";
  if (permissions.includes("list-improvement")) return "/melhorias";
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
  if (
    path === "/painel/minha-visao" ||
    path.startsWith("/painel/minha-visao/")
  ) {
    return permissions.includes("list-minha-visao");
  }
  if (path === "/painel" || path.startsWith("/painel/")) {
    return permissions.includes("list-painel-dev");
  }
  if (path === "/casos/novo" || path.startsWith("/casos/novo/")) {
    return permissions.includes("create-case");
  }
  if (path === "/casos") {
    return permissions.includes("list-case");
  }
  if (path.startsWith("/casos/")) {
    return hasAny(permissions, ["list-case", "list-report"]);
  }
  if (path === "/reports/novo" || path.startsWith("/reports/novo/")) {
    return permissions.includes("create-report");
  }
  if (path === "/reports" || path.startsWith("/reports/")) {
    return permissions.includes("list-report");
  }
  if (path === "/projetos" || path.startsWith("/projetos/")) {
    return permissions.includes("list-project");
  }
  if (path === "/produtos/novo" || path.startsWith("/produtos/novo/")) {
    return permissions.includes("create-product");
  }
  if (path === "/produtos" || path.startsWith("/produtos/")) {
    return permissions.includes("list-product");
  }
  if (path === "/liberacoes" || path.startsWith("/liberacoes/")) {
    return permissions.includes("list-release");
  }
  if (path === "/melhorias" || path.startsWith("/melhorias/")) {
    return permissions.includes("list-improvement");
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
