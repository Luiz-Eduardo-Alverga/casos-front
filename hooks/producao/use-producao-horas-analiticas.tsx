"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getProducaoHorasAnaliticas,
  type ProducaoHorasAnaliticasItem,
  type ProducaoHorasAnaliticasParams,
  type ProducaoHorasAnaliticasResponse,
} from "@/services/projeto-casos-producao/get-producao-horas-analiticas";

export interface UseProducaoHorasAnaliticasOptions {
  enabled?: boolean;
}

function hasRequiredParams(params?: Partial<ProducaoHorasAnaliticasParams>) {
  const hasAtLeastOneFilter = Boolean(
    String(params?.produto_id ?? "").trim() ||
      String(params?.projeto_id ?? "").trim() ||
      String(params?.usuario ?? "").trim(),
  );

  return Boolean(
    hasAtLeastOneFilter &&
      params?.data_producao_inicio?.trim() &&
      params?.data_producao_fim?.trim(),
  );
}

export function useProducaoHorasAnaliticas(
  params?: Partial<ProducaoHorasAnaliticasParams>,
  options?: UseProducaoHorasAnaliticasOptions,
) {
  const enabled = (options?.enabled ?? true) && hasRequiredParams(params);

  return useQuery({
    queryKey: [
      "producao-horas-analiticas",
      params?.produto_id ?? "",
      params?.projeto_id ?? "",
      params?.usuario ?? "",
      params?.data_producao_inicio ?? "",
      params?.data_producao_fim ?? "",
    ],
    enabled,
    queryFn: () =>
      getProducaoHorasAnaliticas({
        produto_id: params?.produto_id,
        projeto_id: params?.projeto_id,
        usuario: params?.usuario,
        data_producao_inicio: params!.data_producao_inicio!,
        data_producao_fim: params!.data_producao_fim!,
      }),
  });
}

export type {
  ProducaoHorasAnaliticasItem,
  ProducaoHorasAnaliticasParams,
  ProducaoHorasAnaliticasResponse,
};
