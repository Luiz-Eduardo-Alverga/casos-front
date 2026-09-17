"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { getProdutoModulos } from "@/services/produtos/modulos";

export interface UseProdutoModulosOptions {
  enabled?: boolean;
  cursor?: string | null;
  per_page?: number;
}

export function useProdutoModulos(
  produtoId: number | string | null | undefined,
  options?: UseProdutoModulosOptions,
) {
  const enabled =
    (options?.enabled ?? true) && produtoId != null && produtoId !== "";

  return useQuery({
    queryKey: [
      ...produtosKeys.modulos(produtoId ?? ""),
      options?.cursor ?? null,
    ],
    queryFn: () =>
      getProdutoModulos({
        produtoId: produtoId as number | string,
        per_page: options?.per_page,
        cursor: options?.cursor ?? null,
      }),
    enabled,
  });
}

export function useProdutoModulosInfinite(
  produtoId: number | string | null | undefined,
  options?: Pick<UseProdutoModulosOptions, "enabled" | "per_page">,
) {
  const enabled =
    (options?.enabled ?? true) && produtoId != null && produtoId !== "";

  return useInfiniteQuery({
    queryKey: produtosKeys.modulosInfinite(produtoId ?? ""),
    queryFn: ({ pageParam }) =>
      getProdutoModulos({
        produtoId: produtoId as number | string,
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
