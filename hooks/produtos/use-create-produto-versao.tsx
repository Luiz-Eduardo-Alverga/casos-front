"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  createProdutoVersao,
  type ProdutoVersaoPayload,
} from "@/services/produtos/versoes";

export function useCreateProdutoVersao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      data,
    }: {
      produtoId: number | string;
      data: ProdutoVersaoPayload;
    }) => createProdutoVersao(produtoId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.versoes(variables.produtoId),
      });
    },
  });
}
