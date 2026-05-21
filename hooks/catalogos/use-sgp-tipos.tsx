"use client";

import { useQuery } from "@tanstack/react-query";
import { getSgpTipos } from "@/services/auxiliar/sgp-tipos";

export interface UseSgpTiposOptions {
  enabled?: boolean;
  /** Filtra por `Tipo` no endpoint GET /auxiliar/sgp-tipos */
  tipo?: string;
}

export function useSgpTipos(options?: UseSgpTiposOptions) {
  const enabled = options?.enabled ?? true;
  const tipo = options?.tipo?.trim() || undefined;

  return useQuery({
    queryKey: ["sgp-tipos", tipo ?? null],
    queryFn: () => getSgpTipos(tipo ? { tipo } : undefined),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
