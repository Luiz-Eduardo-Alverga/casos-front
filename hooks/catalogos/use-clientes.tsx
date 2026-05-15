"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getClientes } from "@/services/auxiliar/clientes";

export interface UseClientesParams {
  search?: string;
  per_page?: number;
}

export interface UseClientesOptions {
  enabled?: boolean;
}

export function useClientes(
  params: UseClientesParams = {},
  options?: UseClientesOptions,
) {
  return useInfiniteQuery({
    queryKey: ["clientes", params],
    queryFn: ({ pageParam }) =>
      getClientes({
        ...params,
        per_page: params.per_page ?? 50,
        cursor: pageParam ?? null,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? lastPage.pagination.next_cursor
        : undefined,
    enabled: options?.enabled ?? true,
  });
}
