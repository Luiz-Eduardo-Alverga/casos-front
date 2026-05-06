"use client";

import { useQuery } from "@tanstack/react-query";
import { getSgpCadastroById } from "@/services/sgp-cadastros/get-sgp-cadastro";

export interface UseSgpCadastroByIdOptions {
  enabled?: boolean;
}

export function useSgpCadastroById(
  id: number | string | null | undefined,
  options?: UseSgpCadastroByIdOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = id != null && id !== "" && enabled;

  return useQuery({
    queryKey: ["sgp-cadastro", id],
    queryFn: () => getSgpCadastroById(id as number | string),
    enabled: shouldFetch,
  });
}
