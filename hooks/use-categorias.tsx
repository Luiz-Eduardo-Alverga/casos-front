"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategorias } from "@/services/auxiliar/categorias";

export function useCategorias(params?: { search?: string; enabled?: boolean }) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["categorias", params?.search ?? ""],
    queryFn: () => getCategorias(params),
    enabled,
  });
}
