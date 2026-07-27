"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoDistribuicao,
  type GetVisaoDistribuicaoParams,
} from "@/services/sprint/get-visao-distribuicao";
import type { UseVisaoQueryOptions } from "@/hooks/painel/use-visao-geral";

export function useVisaoDistribuicao(
  params: GetVisaoDistribuicaoParams = {},
  options?: UseVisaoQueryOptions,
) {
  const idProjeto = params.id_projeto?.trim() ?? "";
  const produtoId = params.produto_id?.trim() ?? "";
  const setor = params.setor?.trim() ?? "";
  const atribuidoPara = params.atribuido_para?.trim() ?? "";
  const agruparPor = params.agrupar_por?.trim() ?? "";
  const versao = params.versao?.trim() ?? "";

  return useQuery({
    queryKey: [
      "visao-distribuicao",
      idProjeto,
      produtoId,
      setor,
      atribuidoPara,
      agruparPor,
      versao,
    ],
    enabled: Boolean(idProjeto || produtoId || setor),
    queryFn: () =>
      getVisaoDistribuicao({
        ...(idProjeto ? { id_projeto: idProjeto } : {}),
        ...(produtoId ? { produto_id: produtoId } : {}),
        ...(setor ? { setor } : {}),
        ...(atribuidoPara ? { atribuido_para: atribuidoPara } : {}),
        ...(agruparPor ? { agrupar_por: agruparPor } : {}),
        ...(versao ? { versao } : {}),
      }),
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground ?? true,
  });
}
