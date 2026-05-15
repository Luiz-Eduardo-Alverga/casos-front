"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createProdutosOrdem,
  type CreateProdutosOrdemBody,
} from "@/services/projeto-dev/create-produtos-ordem";

export function useCreateProdutosOrdem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProdutosOrdemBody) => createProdutosOrdem(body),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["produtos-ordem", String(variables.id_colaborador)],
      });
    },
  });
}

