"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoCasosEmProducao,
  type GetVisaoCasosEmProducaoParams,
} from "@/services/sprint/get-visao-casos-em-producao";
import type { UseVisaoQueryOptions } from "@/hooks/painel/use-visao-geral";

export function useVisaoCasosEmProducao(
  params: GetVisaoCasosEmProducaoParams = {},
  options?: UseVisaoQueryOptions,
) {
  const idProjeto = params.id_projeto?.trim() ?? "";
  const produtoId = params.produto_id?.trim() ?? "";
  const setor = params.setor?.trim() ?? "";

  return useQuery({
    queryKey: ["visao-casos-em-producao", idProjeto, produtoId, setor],
    enabled: Boolean(idProjeto || produtoId || setor),
    queryFn: () =>
      getVisaoCasosEmProducao({
        ...(idProjeto ? { id_projeto: idProjeto } : {}),
        ...(produtoId ? { produto_id: produtoId } : {}),
        ...(setor ? { setor } : {}),
      }),
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground ?? true,
  });
}
