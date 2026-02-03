"use client";

import { useQuery } from "@tanstack/react-query";
import { getProdutos } from "@/services/auxiliar/produtos";

export function useProdutos(params?: { search?: string }) {
  const hasSearch = params?.search && params.search.trim().length > 0;
  
  return useQuery({
    queryKey: ["produtos", params?.search ?? ""],
    queryFn: () => getProdutos(params),
    // enabled: !!hasSearch, // Só faz requisição quando houver busca
  });
}

