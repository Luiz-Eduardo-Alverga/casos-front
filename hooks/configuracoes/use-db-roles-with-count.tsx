"use client";

import { useQuery } from "@tanstack/react-query";
import { listRolesWithCountClient } from "@/services/db-api/rbac";

const STALE_MS = 60_000;
const GC_MS = 5 * 60_000;

/**
 * Lista de papéis gerenciáveis (hierarchyLevel abaixo do usuário logado).
 */
export function useDbRolesWithCount(search?: string) {
  const trimmed = search?.trim() ?? "";
  return useQuery({
    queryKey: ["db-roles", trimmed, "permissionsCount", "manageable"] as const,
    queryFn: () =>
      listRolesWithCountClient(trimmed || undefined, { manageable: true }),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
