"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getSoftcomClientes } from "@/services/clientes/get-clientes";

export interface UseSoftcomClientesParams {
  nome?: string;
  pageSize?: number;
}

export interface UseSoftcomClientesOptions {
  enabled?: boolean;
}

export function useSoftcomClientes(
  params: UseSoftcomClientesParams = {},
  options?: UseSoftcomClientesOptions,
) {
  return useInfiniteQuery({
    queryKey: ["softcom-clientes", params],
    queryFn: ({ pageParam }) =>
      getSoftcomClientes({
        ...params,
        page: pageParam,
        pageSize: params.pageSize ?? 50,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage && lastPage.pagination.nextPage != null
        ? lastPage.pagination.nextPage
        : undefined,
    enabled: options?.enabled ?? true,
  });
}
