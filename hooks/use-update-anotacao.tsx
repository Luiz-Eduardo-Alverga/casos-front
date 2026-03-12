"use client";

import { useMutation } from "@tanstack/react-query";
import {
  updateAnotacao,
  type UpdateAnotacaoRequest,
} from "@/services/projeto-casos-anotacoes/update";

export function useUpdateAnotacao() {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: UpdateAnotacaoRequest;
    }) => updateAnotacao(id, data),
  });
}
