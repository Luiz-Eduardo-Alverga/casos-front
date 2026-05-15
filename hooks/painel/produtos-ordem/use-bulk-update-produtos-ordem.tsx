"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  bulkUpdateProdutosOrdem,
  type BulkUpdateProdutosOrdemBody,
} from "@/services/projeto-dev/bulk-update-produtos-ordem";

export function useBulkUpdateProdutosOrdem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BulkUpdateProdutosOrdemBody) =>
      bulkUpdateProdutosOrdem(body),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["produtos-ordem", String(variables.id_colaborador)],
      });
    },
  });
}

