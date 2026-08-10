"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { carregarLiberacaoChecklist } from "@/services/sprint/carregar-liberacao-checklist";

export interface CarregarLiberacaoChecklistVariables {
  registro: number | string;
}

export function useCarregarLiberacaoChecklist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ registro }: CarregarLiberacaoChecklistVariables) =>
      carregarLiberacaoChecklist(registro),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["liberacoes", variables.registro, "checklist"],
      });
    },
  });
}
