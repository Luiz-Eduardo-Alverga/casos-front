"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteClienteCaso } from "@/services/projeto-casos-clientes/delete";

export function useDeleteClienteCaso() {
  return useMutation({
    mutationFn: (id: number | string) => deleteClienteCaso(id),
  });
}
