"use client";

import { useMutation } from "@tanstack/react-query";
import { clonarCaso } from "@/services/projeto-casos/clonar";

export function useClonarCaso() {
  return useMutation({
    mutationFn: (id: number | string) => clonarCaso(id),
  });
}
