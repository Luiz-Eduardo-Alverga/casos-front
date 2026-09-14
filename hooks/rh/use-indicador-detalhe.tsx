"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getIndicadorDetalhe,
  type IndicadorDetalhe,
  type IndicadorDetalheResponse,
} from "@/services/rh/get-indicador-detalhe";

export interface UseIndicadorDetalheOptions {
  enabled?: boolean;
}

export function useIndicadorDetalhe(
  id?: number | string | null,
  options?: UseIndicadorDetalheOptions,
) {
  const indicadorId = String(id ?? "").trim();
  const enabled = (options?.enabled ?? true) && Boolean(indicadorId);

  return useQuery({
    queryKey: ["indicador-detalhe", indicadorId],
    enabled,
    queryFn: () => getIndicadorDetalhe(indicadorId),
  });
}

export type { IndicadorDetalhe, IndicadorDetalheResponse };
