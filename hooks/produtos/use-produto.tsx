"use client";

import { useQuery } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { isApiError } from "@/services/produtos/api-error";
import { getProduto } from "@/services/produtos/produtos";

export interface UseProdutoOptions {
  enabled?: boolean;
}

export function useProduto(
  id: number | string | null | undefined,
  options?: UseProdutoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = id != null && id !== "" && enabled;

  return useQuery({
    queryKey: produtosKeys.detail(id ?? ""),
    queryFn: () => getProduto(id as number | string),
    enabled: shouldFetch,
    retry: (failureCount, error) => {
      if (isApiError(error) && (error.status === 404 || error.status === 403)) {
        return false;
      }
      return failureCount < 1;
    },
  });
}

/** @deprecated Use useProduto */
export const useProdutoById = useProduto;
