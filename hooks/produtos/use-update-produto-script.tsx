"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  updateProdutoScript,
  type ProdutoScriptPayload,
} from "@/services/produtos/scripts";

export function useUpdateProdutoScript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      scriptId,
      data,
    }: {
      produtoId: number | string;
      scriptId: number | string;
      data: ProdutoScriptPayload;
    }) => updateProdutoScript(produtoId, scriptId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.scripts(variables.produtoId),
      });
    },
  });
}
