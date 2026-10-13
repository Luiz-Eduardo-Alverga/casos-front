"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marcarCasoDuplicado } from "@/services/projeto-casos/marcar-duplicado";

export function useMarcarCasoDuplicado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { id: number | string; caso_relacionado: number }) =>
      marcarCasoDuplicado(params.id, {
        caso_relacionado: params.caso_relacionado,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
      queryClient.invalidateQueries({ queryKey: ["agenda-dev"] });
      queryClient.invalidateQueries({ queryKey: ["projeto-casos-relacoes"] });
    },
  });
}
