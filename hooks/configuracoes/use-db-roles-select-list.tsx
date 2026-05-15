"use client";

import { useQuery } from "@tanstack/react-query";
import { listRolesClient } from "@/services/db-api/rbac";

const STALE_MS = 60_000;
const GC_MS = 5 * 60_000;

/**
 * Lista de papéis para selects (ex.: modal de gerenciar perfil).
 * Encapsula o padrão Componente -> Hook -> Service.
 */
export function useDbRolesSelectList() {
  return useQuery({
    queryKey: ["db-roles", "select-list"] as const,
    queryFn: () => listRolesClient(),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

