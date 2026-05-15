"use client";

import { useMutation } from "@tanstack/react-query";
import {
  updateCasoRelacao,
  type UpdateCasoRelacaoRequest,
} from "@/services/projeto-casos-relacoes/update";

export function useUpdateCasoRelacao() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateCasoRelacaoRequest;
    }) => updateCasoRelacao(id, data),
  });
}

