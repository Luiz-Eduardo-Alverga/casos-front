"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteCasoRelacao } from "@/services/projeto-casos-relacoes/delete";

export function useDeleteCasoRelacao() {
  return useMutation({
    mutationFn: (id: number | string) => deleteCasoRelacao(id),
  });
}

