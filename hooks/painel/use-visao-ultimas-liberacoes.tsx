"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoUltimasLiberacoes,
  type GetVisaoUltimasLiberacoesParams,
} from "@/services/sprint/get-visao-ultimas-liberacoes";

export function useVisaoUltimasLiberacoes(
  params: GetVisaoUltimasLiberacoesParams = {},
) {
  const produtoId = params.produto_id?.trim() ?? "";
  const setor = params.setor?.trim() ?? "";
  const tipoLiberacao = params.tipo_liberacao?.trim() ?? "";
  const diasLiberacao = params.dias_liberacao?.trim() ?? "";

  return useQuery({
    queryKey: [
      "visao-ultimas-liberacoes",
      produtoId,
      setor,
      tipoLiberacao,
      diasLiberacao,
    ],
    enabled: Boolean(produtoId || setor || tipoLiberacao || diasLiberacao),
    queryFn: () =>
      getVisaoUltimasLiberacoes({
        ...(produtoId ? { produto_id: produtoId } : {}),
        ...(setor ? { setor } : {}),
        ...(tipoLiberacao
          ? {
              tipo_liberacao:
                tipoLiberacao as GetVisaoUltimasLiberacoesParams["tipo_liberacao"],
            }
          : {}),
        ...(diasLiberacao ? { dias_liberacao: diasLiberacao } : {}),
      }),
  });
}
