"use client";

import { useQuery } from "@tanstack/react-query";
import { getAssignerHierarchyClient } from "@/services/db-api/rbac";

const STALE_MS = 60_000;
const GC_MS = 5 * 60_000;

/** Hierarquia efetiva do usuário logado (menor nível entre seus perfis). */
export function useAssignerHierarchy() {
  return useQuery({
    queryKey: ["assigner-hierarchy"] as const,
    queryFn: () => getAssignerHierarchyClient(),
    staleTime: STALE_MS,
    gcTime: GC_MS,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
