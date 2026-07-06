"use client";

import { useQuery } from "@tanstack/react-query";
import { getClienteById } from "@/services/clientes/get-cliente-by-id";
import { isHttpError } from "@/lib/http-error";

export interface UseClienteByIdOptions {
  enabled?: boolean;
}

export function useClienteById(
  id: number | string | null | undefined,
  options?: UseClienteByIdOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = id != null && id !== "" && enabled;

  return useQuery({
    queryKey: ["cliente", id],
    queryFn: () => getClienteById(id as number | string),
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isHttpError(error) && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}
