"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fecharLiberacao,
  type FecharLiberacaoRequest,
} from "@/services/sprint/fechar-liberacao";

export interface FecharLiberacaoVariables {
  registro: number | string;
  data: FecharLiberacaoRequest;
}

export function useFecharLiberacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registro, data }: FecharLiberacaoVariables) =>
      fecharLiberacao(registro, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liberacoes"] });
      queryClient.invalidateQueries({
        queryKey: ["liberacoes", variables.registro],
      });
    },
  });
}
