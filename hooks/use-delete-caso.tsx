"use client";

import { useMutation } from "@tanstack/react-query";
import { deleteCaso } from "@/services/projeto-casos/delete";

export function useDeleteCaso() {
  return useMutation({
    mutationFn: (id: number | string) => deleteCaso(id),
  });
}
