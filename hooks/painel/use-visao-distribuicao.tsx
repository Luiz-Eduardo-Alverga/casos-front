"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoDistribuicao,
  type GetVisaoDistribuicaoParams,
} from "@/services/sprint/get-visao-distribuicao";

export function useVisaoDistribuicao(params: GetVisaoDistribuicaoParams = {}) {
  const idProjeto = params.id_projeto?.trim() ?? "";
  const produtoId = params.produto_id?.trim() ?? "";
  const setor = params.setor?.trim() ?? "";
  const atribuidoPara = params.atribuido_para?.trim() ?? "";

  return useQuery({
    queryKey: [
      "visao-distribuicao",
      idProjeto,
      produtoId,
      setor,
      atribuidoPara,
    ],
    enabled: Boolean(idProjeto || produtoId || setor),
    queryFn: () =>
      getVisaoDistribuicao({
        ...(idProjeto ? { id_projeto: idProjeto } : {}),
        ...(produtoId ? { produto_id: produtoId } : {}),
        ...(setor ? { setor } : {}),
        ...(atribuidoPara ? { atribuido_para: atribuidoPara } : {}),
      }),
  });
}
