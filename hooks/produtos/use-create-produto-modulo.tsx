"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  createProdutoModulo,
  type ProdutoModuloPayload,
} from "@/services/produtos/modulos";

export function useCreateProdutoModulo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      produtoId,
      data,
    }: {
      produtoId: number | string;
      data: ProdutoModuloPayload;
    }) => createProdutoModulo(produtoId, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: produtosKeys.modulos(variables.produtoId),
      });
    },
  });
}
