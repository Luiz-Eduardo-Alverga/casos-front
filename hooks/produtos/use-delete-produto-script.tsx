"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { deleteProdutoScript } from "@/services/produtos/scripts";

export function useDeleteProdutoScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      scriptId,
    }: {
      produtoId: number | string;
      scriptId: number | string;
    }) => deleteProdutoScript(produtoId, scriptId),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.scripts(variables.produtoId),
      });
    },
  });
}
