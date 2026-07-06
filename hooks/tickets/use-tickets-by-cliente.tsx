"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getTicketsByCliente } from "@/services/tickets/get-tickets-by-cliente";
import { isHttpError } from "@/lib/http-error";

export interface UseTicketsByClienteOptions {
  enabled?: boolean;
}

export function useTicketsByCliente(
  params: {
    registro: number | string | null | undefined;
    pageSize?: number;
  },
  options?: UseTicketsByClienteOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch =
    params.registro != null && params.registro !== "" && enabled;

  return useInfiniteQuery({
    queryKey: ["tickets-cliente", params.registro, params.pageSize ?? null],
    queryFn: ({ pageParam }) =>
      getTicketsByCliente({
        registro: params.registro as number | string,
        page: pageParam,
        pageSize: params.pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage && lastPage.pagination.nextPage != null
        ? lastPage.pagination.nextPage
        : undefined,
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (isHttpError(error) && error.status === 404) return false;
      return failureCount < 1;
    },
  });
}
