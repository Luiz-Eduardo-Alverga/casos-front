"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategorias } from "@/services/auxiliar/categorias";

export function useCategorias(params?: {
  search?: string;
}) {
  const hasSearch = params?.search && params.search.trim().length > 0;
  
  return useQuery({
    queryKey: ["categorias", params?.search ?? ""],
    queryFn: () => getCategorias(),
  });
}
