"use client";

import { useQuery } from "@tanstack/react-query";
import { getComunicadoFiltros } from "@/services/comunicados";

export function useComunicadoFiltros() {
  return useQuery({
    queryKey: ["comunicado-filtros"],
    queryFn: getComunicadoFiltros,
    staleTime: 10 * 60 * 1000,
  });
}
