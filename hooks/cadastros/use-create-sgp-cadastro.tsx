"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSgpCadastro,
  type CreateSgpCadastroRequest,
} from "@/services/sgp-cadastros/create-sgp-cadastro";

export function useCreateSgpCadastro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSgpCadastroRequest) => createSgpCadastro(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sgp-cadastros"] });
    },
  });
}
