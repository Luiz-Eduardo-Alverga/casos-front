"use client";

import { useQuery } from "@tanstack/react-query";
import { getSgpRiscosCadastro } from "@/services/auxiliar/sgp-riscos-cadastro";

export interface UseSgpRiscosCadastroParams {
  search?: string;
  enabled?: boolean;
}

export function useSgpRiscosCadastro(params?: UseSgpRiscosCadastroParams) {
  const enabled = params?.enabled ?? true;
  return useQuery({
    queryKey: ["sgp-riscos-cadastro", params?.search ?? ""],
    queryFn: () => getSgpRiscosCadastro({ search: params?.search }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
