"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  createProdutoScript,
  type ProdutoScriptPayload,
} from "@/services/produtos/scripts";

export function useCreateProdutoScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      data,
    }: {
      produtoId: number | string;
      data: ProdutoScriptPayload;
    }) => createProdutoScript(produtoId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.scripts(variables.produtoId),
      });
    },
  });
}
