"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLiberacaoVersao } from "@/services/sprint/delete-liberacao-versao";

export interface DeleteLiberacaoVersaoVariables {
  registro: number | string;
  sequencia: number | string;
}

export function useDeleteLiberacaoVersao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registro, sequencia }: DeleteLiberacaoVersaoVariables) =>
      deleteLiberacaoVersao(registro, sequencia),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liberacoes"] });
      queryClient.invalidateQueries({
        queryKey: ["liberacoes", variables.registro],
      });
    },
  });
}
