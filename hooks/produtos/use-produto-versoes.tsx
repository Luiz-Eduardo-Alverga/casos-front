"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { getProdutoVersoes } from "@/services/produtos/versoes";

export interface UseProdutoVersoesOptions {
  enabled?: boolean;
  cursor?: string | null;
  per_page?: number;
}

function resolveProdutoId(
  produtoId?: number | string | null,
): number | string | null {
  if (produtoId == null || produtoId === "") return null;
  return produtoId;
}

export function useProdutoVersoes(
  produtoId: number | string | null | undefined,
  options?: UseProdutoVersoesOptions,
) {
  const id = resolveProdutoId(produtoId);
  const enabled = (options?.enabled ?? true) && id != null;

  return useQuery({
    queryKey: [...produtosKeys.versoes(id ?? ""), options?.cursor ?? null],
    queryFn: () =>
      getProdutoVersoes({
        produtoId: id as number | string,
        per_page: options?.per_page,
        cursor: options?.cursor ?? null,
      }),
    enabled,
  });
}

export function useProdutoVersoesInfinite(
  produtoId: number | string | null | undefined,
  options?: Pick<UseProdutoVersoesOptions, "enabled" | "per_page">,
) {
  const id = resolveProdutoId(produtoId);
  const enabled = (options?.enabled ?? true) && id != null;

  return useInfiniteQuery({
    queryKey: produtosKeys.versoesInfinite(id ?? ""),
    queryFn: ({ pageParam }) =>
      getProdutoVersoes({
        produtoId: id as number | string,
        per_page: options?.per_page,
        cursor: pageParam ?? null,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? lastPage.pagination.next_cursor
        : undefined,
    enabled,
  });
}
