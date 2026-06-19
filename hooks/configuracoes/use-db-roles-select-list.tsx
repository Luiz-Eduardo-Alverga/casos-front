"use client";

import { useQuery } from "@tanstack/react-query";
import { listRolesClient } from "@/services/db-api/rbac";

const STALE_MS = 60_000;
const GC_MS = 5 * 60_000;

/**
 * Lista de papéis para o modal de gerenciar perfil (filtrados por hierarquia no backend).
 */
export function useDbRolesSelectList() {
  return useQuery({
    queryKey: ["db-roles", "select-list", "assignable"] as const,
    queryFn: () => listRolesClient(undefined, { assignable: true }),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

