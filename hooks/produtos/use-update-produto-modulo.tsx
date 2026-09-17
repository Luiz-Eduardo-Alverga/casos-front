"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  updateProdutoModulo,
  type ProdutoModuloPayload,
} from "@/services/produtos/modulos";

export function useUpdateProdutoModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      sequencia,
      data,
    }: {
      produtoId: number | string;
      sequencia: number | string;
      data: ProdutoModuloPayload;
    }) => updateProdutoModulo(produtoId, sequencia, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.modulos(variables.produtoId),
      });
    },
  });
}
