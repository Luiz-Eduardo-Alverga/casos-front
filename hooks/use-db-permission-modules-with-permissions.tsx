"use client";

import { useQuery } from "@tanstack/react-query";
import { listPermissionModulesClient } from "@/services/db-api/rbac";
import type { PermissionModuleWithPermissions } from "@/lib/db/permission-modules";

const STALE_MS = 5 * 60_000;
const GC_MS = 15 * 60_000;

/**
 * Módulos com suas permissões para montar a matriz. Cache mais longo
 * porque a estrutura de módulos/permissões muda raramente.
 */
export function useDbPermissionModulesWithPermissions() {
  return useQuery({
    queryKey: ["db-permission-modules", "permissions"] as const,
    queryFn: async () =>
      (await listPermissionModulesClient(
        undefined,
        "permissions",
      )) as PermissionModuleWithPermissions[],
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
