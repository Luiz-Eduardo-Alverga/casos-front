"use client";

import { useMutation } from "@tanstack/react-query";
import {
  atualizarProducao,
  type AtualizarProducaoPayload,
  type AtualizarProducaoResponse,
} from "@/services/projeto-casos-producao/atualizar-producao";

export function useAtualizarProducao() {
  return useMutation({
    mutationFn: ({
      sequencia,
      payload,
    }: {
      sequencia: number | string;
      payload: AtualizarProducaoPayload;
    }) => atualizarProducao(sequencia, payload),
  });
}

export type { AtualizarProducaoResponse, AtualizarProducaoPayload };
