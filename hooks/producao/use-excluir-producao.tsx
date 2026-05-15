"use client";

import { useMutation } from "@tanstack/react-query";
import {
  excluirProducao,
  type ExcluirProducaoResponse,
} from "@/services/projeto-casos-producao/excluir-producao";

export function useExcluirProducao() {
  return useMutation({
    mutationFn: (sequencia: number | string) => excluirProducao(sequencia),
  });
}

export type { ExcluirProducaoResponse };
