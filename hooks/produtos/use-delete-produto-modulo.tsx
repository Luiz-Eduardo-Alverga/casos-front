"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { deleteProdutoModulo } from "@/services/produtos/modulos";

export function useDeleteProdutoModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      sequencia,
    }: {
      produtoId: number | string;
      sequencia: number | string;
    }) => deleteProdutoModulo(produtoId, sequencia),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.modulos(variables.produtoId),
      });
    },
  });
}
