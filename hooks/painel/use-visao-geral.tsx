"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoGeral,
  type GetVisaoGeralParams,
} from "@/services/sprint/get-visao-geral";

export function useVisaoGeral(params: GetVisaoGeralParams = {}) {
  const idProjeto = params.id_projeto?.trim() ?? "";
  const produtoId = params.produto_id?.trim() ?? "";
  const setor = params.setor?.trim() ?? "";
  const agruparPor = params.agrupar_por?.trim() ?? "";
  const atribuidoPara = params.atribuido_para?.trim() ?? "";

  return useQuery({
    queryKey: [
      "visao-geral",
      idProjeto,
      produtoId,
      setor,
      agruparPor,
      atribuidoPara,
    ],
    enabled: Boolean(idProjeto || produtoId || setor),
    queryFn: () =>
      getVisaoGeral({
        ...(idProjeto ? { id_projeto: idProjeto } : {}),
        ...(produtoId ? { produto_id: produtoId } : {}),
        ...(setor ? { setor } : {}),
        ...(agruparPor
          ? {
              agrupar_por:
                agruparPor as NonNullable<GetVisaoGeralParams["agrupar_por"]>,
            }
          : {}),
        ...(atribuidoPara ? { atribuido_para: atribuidoPara } : {}),
      }),
  });
}
