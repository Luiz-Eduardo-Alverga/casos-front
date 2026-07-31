"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLiberacao } from "@/services/sprint/delete-liberacao";

export function useDeleteLiberacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registro: number | string) => deleteLiberacao(registro),
    onSuccess: (_response, registro) => {
      queryClient.invalidateQueries({ queryKey: ["liberacoes"] });
      queryClient.removeQueries({ queryKey: ["liberacoes", registro] });
    },
  });
}
