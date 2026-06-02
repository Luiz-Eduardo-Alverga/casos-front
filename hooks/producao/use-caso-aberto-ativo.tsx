"use client";

import { useQuery } from "@tanstack/react-query";
import { isAuthenticated } from "@/lib/auth";
import { getCasoAbertoAtivo } from "@/services/projeto-casos-producao/get-caso-aberto-ativo";
import { casoAbertoAtivoQueryKey } from "@/hooks/producao/caso-aberto-ativo-cache";

const REFETCH_INTERVAL_MS = 300_000;

export function useCasoAbertoAtivo() {
  const enabled = isAuthenticated();

  return useQuery({
    queryKey: casoAbertoAtivoQueryKey,
    queryFn: getCasoAbertoAtivo,
    enabled,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  });
}

export { casoAbertoAtivoQueryKey };
export type { CasoAbertoAtivoCache } from "@/hooks/producao/caso-aberto-ativo-cache";
