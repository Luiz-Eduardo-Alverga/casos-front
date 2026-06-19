"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAppUser } from "@/lib/auth";
import {
  readCasosFiltrosPreferencias,
  writeCasosFiltrosPreferencias,
} from "@/lib/casos-filtros-preferencias-storage";
import {
  getUserFiltrosPreferenciasClient,
  upsertUserFiltrosPreferenciasClient,
} from "@/services/db-api/user-filtros-preferencias";
import {
  DEFAULT_FILTROS_RESUMO,
  type FiltroResumoItem,
} from "@/lib/types/filtros-resumo";

export const USER_FILTROS_PREFS_QUERY_KEY = ["user-filtros-preferencias"] as const;

function resolveInitialFiltrosResumo(): FiltroResumoItem[] {
  const appUser = getAppUser();
  if (!appUser) return DEFAULT_FILTROS_RESUMO;
  return readCasosFiltrosPreferencias(appUser.id) ?? DEFAULT_FILTROS_RESUMO;
}

export function useUserFiltrosPreferencias() {
  const initialData = useMemo(() => resolveInitialFiltrosResumo(), []);

  return useQuery({
    queryKey: USER_FILTROS_PREFS_QUERY_KEY,
    queryFn: async () => {
      const data = await getUserFiltrosPreferenciasClient();
      const appUser = getAppUser();
      if (appUser) {
        writeCasosFiltrosPreferencias(appUser.id, data);
      }
      return data;
    },
    initialData,
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useUpsertUserFiltrosPreferencias() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (filtros: FiltroResumoItem[]) =>
      upsertUserFiltrosPreferenciasClient(filtros),
    onSuccess: (_data, filtros) => {
      const appUser = getAppUser();
      if (appUser) {
        writeCasosFiltrosPreferencias(appUser.id, filtros);
      }
      queryClient.setQueryData(USER_FILTROS_PREFS_QUERY_KEY, filtros);
    },
  });
}
