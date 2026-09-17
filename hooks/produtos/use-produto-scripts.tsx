"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { getProdutoScripts } from "@/services/produtos/scripts";

export interface UseProdutoScriptsOptions {
  enabled?: boolean;
  cursor?: string | null;
  per_page?: number;
}

export function useProdutoScripts(
  produtoId: number | string | null | undefined,
  options?: UseProdutoScriptsOptions,
) {
  const enabled =
    (options?.enabled ?? true) && produtoId != null && produtoId !== "";

  return useQuery({
    queryKey: [
      ...produtosKeys.scripts(produtoId ?? ""),
      options?.cursor ?? null,
    ],
    queryFn: () =>
      getProdutoScripts({
        produtoId: produtoId as number | string,
        per_page: options?.per_page,
        cursor: options?.cursor ?? null,
      }),
    enabled,
  });
}

export function useProdutoScriptsInfinite(
  produtoId: number | string | null | undefined,
  options?: Pick<UseProdutoScriptsOptions, "enabled" | "per_page">,
) {
  const enabled =
    (options?.enabled ?? true) && produtoId != null && produtoId !== "";

  return useInfiniteQuery({
    queryKey: produtosKeys.scriptsInfinite(produtoId ?? ""),
    queryFn: ({ pageParam }) =>
      getProdutoScripts({
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
