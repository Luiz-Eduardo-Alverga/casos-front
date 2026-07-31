"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addLiberacaoVersoes,
  type AddLiberacaoVersoesRequest,
} from "@/services/sprint/add-liberacao-versoes";

export interface AddLiberacaoVersoesVariables {
  registro: number | string;
  data: AddLiberacaoVersoesRequest;
}

export function useAddLiberacaoVersoes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registro, data }: AddLiberacaoVersoesVariables) =>
      addLiberacaoVersoes(registro, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["liberacoes"] });
      queryClient.invalidateQueries({
        queryKey: ["liberacoes", variables.registro],
      });
    },
  });
}
