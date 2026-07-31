"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLiberacao,
  type CreateLiberacaoRequest,
} from "@/services/sprint/create-liberacao";

export function useCreateLiberacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLiberacaoRequest) => createLiberacao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["liberacoes"] });
    },
  });
}
