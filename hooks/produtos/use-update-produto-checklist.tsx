"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  updateProdutoChecklist,
  type ProdutoChecklistPayload,
} from "@/services/produtos/checklist";

export function useUpdateProdutoChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      itemId,
      data,
    }: {
      produtoId: number | string;
      itemId: number | string;
      data: ProdutoChecklistPayload;
    }) => updateProdutoChecklist(produtoId, itemId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.checklist(variables.produtoId),
      });
    },
  });
}
