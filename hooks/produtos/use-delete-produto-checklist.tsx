"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { deleteProdutoChecklist } from "@/services/produtos/checklist";

export function useDeleteProdutoChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      itemId,
    }: {
      produtoId: number | string;
      itemId: number | string;
    }) => deleteProdutoChecklist(produtoId, itemId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.checklist(variables.produtoId),
      });
    },
  });
}
