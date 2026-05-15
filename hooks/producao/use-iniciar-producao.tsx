"use client";

import { useMutation } from "@tanstack/react-query";
import {
  iniciarProducao,
  type IniciarProducaoResponse,
  IniciarProducaoError,
} from "@/services/projeto-casos-producao/iniciar-producao";

export function useIniciarProducao() {
  return useMutation({
    mutationFn: (registro: number | string) => iniciarProducao(registro),
  });
}

export type { IniciarProducaoResponse, IniciarProducaoError };
