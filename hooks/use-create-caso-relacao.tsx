"use client";

import { useMutation } from "@tanstack/react-query";
import {
  createCasoRelacao,
  type CreateCasoRelacaoRequest,
} from "@/services/projeto-casos-relacoes/create";

export function useCreateCasoRelacao() {
  return useMutation({
    mutationFn: (data: CreateCasoRelacaoRequest) => createCasoRelacao(data),
  });
}

