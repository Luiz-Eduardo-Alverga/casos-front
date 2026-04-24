"use client";

import { useQuery } from "@tanstack/react-query";
import { listRolePermissionsClient } from "@/services/db-api/rbac";

const STALE_MS = 30_000;
const GC_MS = 5 * 60_000;

/**
 * Permissões vinculadas ao papel (com dados de `permission` e `module`).
 * `enabled` depende do `roleId` estar definido (tela edita um papel por vez).
 */
export function useDbRolePermissions(roleId: string | null) {
  return useQuery({
    queryKey: ["db-role-permissions", roleId] as const,
    queryFn: () => listRolePermissionsClient(roleId!),
    enabled: Boolean(roleId),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
