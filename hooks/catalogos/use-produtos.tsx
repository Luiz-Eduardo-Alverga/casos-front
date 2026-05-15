"use client";

import { useQuery } from "@tanstack/react-query";
import { getProdutos } from "@/services/auxiliar/produtos";

export function useProdutos(params?: { search?: string; enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["produtos", params?.search ?? ""],
    queryFn: () => getProdutos(params),
    enabled,
  });
}

