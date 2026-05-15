"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { marcarMensagemComoLida } from "@/services/mensagens/marcar-mensagem-lida";

export function useMarcarMensagemComoLida() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => marcarMensagemComoLida(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mensagens"] });
    },
  });
}
