"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  pararProducao,
  type PararProducaoResponse,
} from "@/services/projeto-casos-producao/parar-producao";
import {
  invalidateCasoAbertoAtivo,
  invalidateProjetoMemoriaForRegistro,
  syncCasoAbertoAtivoAfterParar,
} from "@/hooks/producao/caso-aberto-ativo-cache";

export function usePararProducao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registro: number | string) => pararProducao(registro),
    onSuccess: (response) => {
      syncCasoAbertoAtivoAfterParar(queryClient);
      invalidateCasoAbertoAtivo(queryClient);
      invalidateProjetoMemoriaForRegistro(queryClient, response.data.registro);
    },
  });
}

export type { PararProducaoResponse };
