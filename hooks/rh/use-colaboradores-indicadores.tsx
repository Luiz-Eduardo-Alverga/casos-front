"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getColaboradoresIndicadores,
  type ColaboradorIndicador,
  type ColaboradoresIndicadoresResponse,
  type GetColaboradoresIndicadoresParams,
} from "@/services/rh/get-colaboradores-indicadores";

export interface UseColaboradoresIndicadoresOptions {
  enabled?: boolean;
}

export function useColaboradoresIndicadores(
  params?: Partial<GetColaboradoresIndicadoresParams>,
  options?: UseColaboradoresIndicadoresOptions,
) {
  const suporteId = params?.suporte_id?.trim() ?? "";
  const dataInicial = params?.data_inicial?.trim() ?? "";
  const dataFinal = params?.data_final?.trim() ?? "";

  const enabled =
    (options?.enabled ?? true) && Boolean(suporteId && dataInicial && dataFinal);

  return useQuery({
    queryKey: ["colaboradores-indicadores", suporteId, dataInicial, dataFinal],
    enabled,
    queryFn: () =>
      getColaboradoresIndicadores({
        suporte_id: suporteId,
        data_inicial: dataInicial,
        data_final: dataFinal,
      }),
  });
}

export type {
  ColaboradorIndicador,
  ColaboradoresIndicadoresResponse,
  GetColaboradoresIndicadoresParams,
};
