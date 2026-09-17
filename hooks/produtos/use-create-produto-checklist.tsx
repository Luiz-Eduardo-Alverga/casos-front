"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  createProdutoChecklist,
  type ProdutoChecklistPayload,
} from "@/services/produtos/checklist";

export function useCreateProdutoChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      data,
    }: {
      produtoId: number | string;
      data: ProdutoChecklistPayload;
    }) => createProdutoChecklist(produtoId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.checklist(variables.produtoId),
      });
    },
  });
}
