"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoCasosEmProducao,
  type GetVisaoCasosEmProducaoParams,
} from "@/services/sprint/get-visao-casos-em-producao";

export function useVisaoCasosEmProducao(
  params: GetVisaoCasosEmProducaoParams = {},
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
  });
}
