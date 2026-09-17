"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  updateProdutoVersao,
  type ProdutoVersaoPayload,
} from "@/services/produtos/versoes";

export function useUpdateProdutoVersao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      sequencia,
      data,
    }: {
      produtoId: number | string;
      sequencia: number | string;
      data: ProdutoVersaoPayload;
    }) => updateProdutoVersao(produtoId, sequencia, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.versoes(variables.produtoId),
      });
    },
  });
}
