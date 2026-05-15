"use client";

import { useQuery } from "@tanstack/react-query";
import { getTamanhos } from "@/services/auxiliar/tamanhos";

export function useTamanhos(params?: { enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["tamanhos"],
    queryFn: () => getTamanhos(),
    enabled,
  });
}
