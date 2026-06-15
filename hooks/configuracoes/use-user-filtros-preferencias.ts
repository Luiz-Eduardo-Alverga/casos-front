"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserFiltrosPreferenciasClient,
  upsertUserFiltrosPreferenciasClient,
} from "@/services/db-api/user-filtros-preferencias";
import {
  DEFAULT_FILTROS_RESUMO,
  type FiltroResumoItem,
} from "@/lib/types/filtros-resumo";

export const USER_FILTROS_PREFS_QUERY_KEY = ["user-filtros-preferencias"] as const;

export function useUserFiltrosPreferencias() {
  return useQuery({
    queryKey: USER_FILTROS_PREFS_QUERY_KEY,
    queryFn: getUserFiltrosPreferenciasClient,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: DEFAULT_FILTROS_RESUMO,
    retry: 1,
  });
}

export function useUpsertUserFiltrosPreferencias() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filtros: FiltroResumoItem[]) =>
      upsertUserFiltrosPreferenciasClient(filtros),
    onSuccess: (_data, filtros) => {
      queryClient.setQueryData(USER_FILTROS_PREFS_QUERY_KEY, filtros);
    },
  });
}
