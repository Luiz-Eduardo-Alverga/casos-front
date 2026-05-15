"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateProdutosOrdem,
  type UpdateProdutosOrdemBody,
} from "@/services/projeto-dev/update-produtos-ordem";

export function useUpdateProdutosOrdem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string | number; body: UpdateProdutosOrdemBody }) =>
      updateProdutosOrdem(params),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["produtos-ordem", String(variables.body.id_colaborador)],
      });
    },
  });
}

