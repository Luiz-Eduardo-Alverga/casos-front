import type { ModuleCoverage, PermissionModuleWithPerms } from "./types";

/**
 * Estado de cobertura do módulo: quantas permissões do módulo estão ativas
 * (pertencem ao `selected`) e o estado global (cheio / parcial / nenhum).
 */
export function computeModuleCoverage(
  module: PermissionModuleWithPerms,
  selected: Set<string>,
): ModuleCoverage {
  const total = module.permissions.length;
  if (total === 0) {
    return { total: 0, active: 0, state: "none" };
  }
  let active = 0;
  for (const p of module.permissions) {
    if (selected.has(p.id)) active += 1;
  }
  const state: ModuleCoverage["state"] =
    active === 0 ? "none" : active === total ? "full" : "partial";
  return { total, active, state };
}

/** Comparação de dois sets/arrays de ids (ignorando ordem). */
export function arePermissionSetsEqual(
  a: Set<string>,
  b: Set<string>,
): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) if (!b.has(id)) return false;
  return true;
}

/** Normaliza pesquisa: lowercase + trim. */
export function normalizeSearch(input: string): string {
  return input.trim().toLowerCase();
}
