"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  iniciarProducao,
  type IniciarProducaoResponse,
  IniciarProducaoError,
} from "@/services/projeto-casos-producao/iniciar-producao";
import {
  invalidateCasoAbertoAtivo,
  invalidateProjetoMemoriaForRegistro,
  syncCasoAbertoAtivoAfterIniciar,
} from "@/hooks/producao/caso-aberto-ativo-cache";

export function useIniciarProducao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registro: number | string) => iniciarProducao(registro),
    onSuccess: (response) => {
      syncCasoAbertoAtivoAfterIniciar(queryClient, response.data);
      invalidateCasoAbertoAtivo(queryClient);
      invalidateProjetoMemoriaForRegistro(queryClient, response.data.registro);
    },
    onError: (error) => {
      if (
        error instanceof IniciarProducaoError &&
        error.code === "CASO_JA_ABERTO"
      ) {
        invalidateCasoAbertoAtivo(queryClient);
      }
    },
  });
}

export type { IniciarProducaoResponse, IniciarProducaoError };
