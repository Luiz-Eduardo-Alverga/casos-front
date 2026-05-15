"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProdutosOrdem } from "@/services/projeto-dev/delete-produtos-ordem";

export function useDeleteProdutosOrdem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: string | number; id_colaborador: number }) =>
      deleteProdutosOrdem({ id: params.id }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["produtos-ordem", String(variables.id_colaborador)],
      });
    },
  });
}

