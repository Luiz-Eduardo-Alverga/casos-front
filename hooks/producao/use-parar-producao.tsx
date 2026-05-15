"use client";

import { useMutation } from "@tanstack/react-query";
import {
  pararProducao,
  type PararProducaoResponse,
} from "@/services/projeto-casos-producao/parar-producao";

export function usePararProducao() {
  return useMutation({
    mutationFn: (registro: number | string) => pararProducao(registro),
  });
}

export type { PararProducaoResponse };
