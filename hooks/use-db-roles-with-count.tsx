"use client";

import { useQuery } from "@tanstack/react-query";
import { listRolesWithCountClient } from "@/services/db-api/rbac";

const STALE_MS = 60_000;
const GC_MS = 5 * 60_000;

/**
 * Lista de papéis com `permissionsCount` agregada.
 * Usada na sidebar da tela "Papéis e Acessos".
 */
export function useDbRolesWithCount(search?: string) {
  const trimmed = search?.trim() ?? "";
  return useQuery({
    queryKey: ["db-roles", trimmed, "permissionsCount"] as const,
    queryFn: () => listRolesWithCountClient(trimmed || undefined),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
