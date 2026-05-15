"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteAnotacao } from "@/services/projeto-casos-anotacoes/delete";

export function useDeleteAnotacao() {
  return useMutation({
    mutationFn: (id: number | string) => deleteAnotacao(id),
  });
}
