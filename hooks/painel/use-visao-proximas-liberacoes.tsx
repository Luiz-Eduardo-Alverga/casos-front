"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getVisaoProximasLiberacoes,
  type GetVisaoProximasLiberacoesParams,
} from "@/services/sprint/get-visao-proximas-liberacoes";
import type { UseVisaoQueryOptions } from "@/hooks/painel/use-visao-geral";

export function useVisaoProximasLiberacoes(
  params: GetVisaoProximasLiberacoesParams = {},
  options?: UseVisaoQueryOptions,
) {
  const produtoId = params.produto_id?.trim() ?? "";
  const setor = params.setor?.trim() ?? "";
  const tipoLiberacao = params.tipo_liberacao?.trim() ?? "";

  return useQuery({
    queryKey: ["visao-proximas-liberacoes", produtoId, setor, tipoLiberacao],
    enabled: Boolean(produtoId || setor || tipoLiberacao),
    queryFn: () =>
      getVisaoProximasLiberacoes({
        ...(produtoId ? { produto_id: produtoId } : {}),
        ...(setor ? { setor } : {}),
        ...(tipoLiberacao
          ? {
              tipo_liberacao:
                tipoLiberacao as GetVisaoProximasLiberacoesParams["tipo_liberacao"],
            }
          : {}),
      }),
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: options?.refetchIntervalInBackground ?? true,
  });
}
