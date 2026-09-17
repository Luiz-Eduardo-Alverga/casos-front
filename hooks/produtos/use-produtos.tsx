"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import {
  getProdutos,
  type GetProdutosParams,
} from "@/services/produtos/produtos";

export type ProdutosQueryParams = Omit<GetProdutosParams, "cursor">;

export interface UseProdutosOptions {
  enabled?: boolean;
  cursor?: string | null;
}

export function useProdutos(
  params: ProdutosQueryParams = {},
  options?: UseProdutosOptions,
) {
  return useQuery({
    queryKey: produtosKeys.list({ ...params, cursor: options?.cursor ?? null }),
    queryFn: () =>
      getProdutos({
        ...params,
        cursor: options?.cursor ?? null,
      }),
    enabled: options?.enabled ?? true,
  });
}

export function useProdutosInfinite(
  params: ProdutosQueryParams = {},
  options?: Pick<UseProdutosOptions, "enabled">,
) {
  return useInfiniteQuery({
    queryKey: produtosKeys.infinite(params),
    queryFn: ({ pageParam }) =>
      getProdutos({
        ...params,
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

/** @deprecated Use useProdutos */
export const useProdutosLista = useProdutos;
/** @deprecated Use useProdutosInfinite */
export const useProdutosListaInfinite = useProdutosInfinite;
