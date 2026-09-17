"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  updateProduto,
  type ProdutoPayload,
} from "@/services/produtos/produtos";

export function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: ProdutoPayload;
    }) => updateProduto(id, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: produtosKeys.all });
      queryClient.invalidateQueries({
        queryKey: produtosKeys.detail(variables.id),
      });
    },
  });
}
