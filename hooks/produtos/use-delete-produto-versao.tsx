"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { deleteProdutoVersao } from "@/services/produtos/versoes";

export function useDeleteProdutoVersao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      sequencia,
    }: {
      produtoId: number | string;
      sequencia: number | string;
    }) => deleteProdutoVersao(produtoId, sequencia),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.versoes(variables.produtoId),
      });
    },
  });
}
