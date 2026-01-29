"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsuarios } from "@/services/auxiliar/usuarios";

export function useUsuarios(params?: {
  search?: string;
}) {
  const hasSearch = params?.search && params.search.trim().length > 0;
  
  return useQuery({
    queryKey: ["usuarios", params?.search ?? ""],
    queryFn: () => getUsuarios(params),
    enabled: !!hasSearch, // Só faz requisição quando houver busca
  });
}
