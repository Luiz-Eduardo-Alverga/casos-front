"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getSgpCadastros,
  type GetSgpCadastrosParams,
} from "@/services/sgp-cadastros/get-sgp-cadastros";

export interface UseSgpCadastrosParams extends GetSgpCadastrosParams {}

export interface UseSgpCadastrosOptions {
  enabled?: boolean;
}

function hasSgpCadastrosFilters(params: UseSgpCadastrosParams): boolean {
  return Boolean(
    params.setor ||
      (params.registro != null && params.registro !== ""),
  );
}

export function useSgpCadastros(
  params: UseSgpCadastrosParams = {},
  options?: UseSgpCadastrosOptions,
) {
  const enabled = (options?.enabled ?? true) && hasSgpCadastrosFilters(params);

  return useQuery({
    queryKey: ["sgp-cadastros", params],
    queryFn: () => getSgpCadastros(params),
    enabled,
  });
}

export function useSgpCadastrosInfinite(
  params: UseSgpCadastrosParams = {},
  options?: UseSgpCadastrosOptions,
) {
  const enabled = (options?.enabled ?? true) && hasSgpCadastrosFilters(params);

  return useInfiniteQuery({
    queryKey: ["sgp-cadastros", "infinite", params],
    queryFn: ({ pageParam }) =>
      getSgpCadastros({
        ...params,
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
