"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoPainelIdeias,
  type GetVisaoPainelIdeiasParams,
} from "@/services/sprint/get-visao-painel-ideias";

export function useVisaoPainelIdeias(params: GetVisaoPainelIdeiasParams = {}) {
  const idProjeto = params.id_projeto?.trim() ?? "";
  const produtoId = params.produto_id?.trim() ?? "";
  const setor = params.setor?.trim() ?? "";

  return useQuery({
    queryKey: ["visao-painel-ideias", idProjeto, produtoId, setor],
    enabled: Boolean(idProjeto || produtoId || setor),
    queryFn: () =>
      getVisaoPainelIdeias({
        ...(idProjeto ? { id_projeto: idProjeto } : {}),
        ...(produtoId ? { produto_id: produtoId } : {}),
        ...(setor ? { setor } : {}),
      }),
  });
}
