"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { criarComunicado } from "@/services/comunicados";
import type { CriarComunicadoPayload } from "@/services/comunicados/types";

export function useCriarComunicado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CriarComunicadoPayload) => criarComunicado(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensagens"] });
    },
  });
}
