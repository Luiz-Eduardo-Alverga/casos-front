"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getLiberacoes,
  type GetLiberacoesParams,
} from "@/services/sprint/get-liberacoes";

export type LiberacoesQueryParams = Omit<GetLiberacoesParams, "cursor">;

export interface UseLiberacoesOptions {
  enabled?: boolean;
  cursor?: string | null;
}

export function useLiberacoes(
  params: LiberacoesQueryParams = {},
  options?: UseLiberacoesOptions,
) {
  const perPage = params.per_page ?? 15;

  return useQuery({
    queryKey: ["liberacoes", { ...params, per_page: perPage }, options?.cursor ?? null],
    queryFn: () =>
      getLiberacoes({
        ...params,
        per_page: perPage,
        cursor: options?.cursor ?? null,
      }),
    enabled: options?.enabled ?? true,
  });
}

export function useLiberacoesInfinite(
  params: LiberacoesQueryParams = {},
  options?: Pick<UseLiberacoesOptions, "enabled">,
) {
  const perPage = params.per_page ?? 15;

  return useInfiniteQuery({
    queryKey: ["liberacoes", "infinite", { ...params, per_page: perPage }],
    queryFn: ({ pageParam }) =>
      getLiberacoes({
        ...params,
        per_page: perPage,
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
