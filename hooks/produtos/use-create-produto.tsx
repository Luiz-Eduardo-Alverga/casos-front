"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  createProduto,
  type ProdutoPayload,
} from "@/services/produtos/produtos";

export function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProdutoPayload) => createProduto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: produtosKeys.all });
    },
  });
}
