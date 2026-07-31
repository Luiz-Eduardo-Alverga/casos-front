"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateLiberacao,
  type UpdateLiberacaoRequest,
} from "@/services/sprint/update-liberacao";

export interface UpdateLiberacaoVariables {
  registro: number | string;
  data: UpdateLiberacaoRequest;
}

export function useUpdateLiberacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registro, data }: UpdateLiberacaoVariables) =>
      updateLiberacao(registro, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liberacoes"] });
      queryClient.invalidateQueries({
        queryKey: ["liberacoes", variables.registro],
      });
    },
  });
}
