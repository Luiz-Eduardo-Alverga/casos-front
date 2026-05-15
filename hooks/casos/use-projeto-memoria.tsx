"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getProjetoMemoria,
  type ProjetoMemoriaParams,
} from "@/services/projeto-memoria/get-projeto-memoria";

export type ProjetoMemoriaQueryParams = Omit<
  ProjetoMemoriaParams,
  "cursor" | "page"
> & { per_page?: number };

export interface UseProjetoMemoriaOptions {
  enabled?: boolean;
}

export function useProjetoMemoria(
  params: ProjetoMemoriaQueryParams = {},
  options?: UseProjetoMemoriaOptions,
) {
  return useInfiniteQuery({
    queryKey: ["projeto-memoria", params],
    queryFn: ({ pageParam }) =>
      getProjetoMemoria({
        ...params,
        per_page: params.per_page ?? 15,
        cursor: pageParam ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? lastPage.pagination.next_cursor
        : undefined,
    enabled: options?.enabled ?? true,
  });
}
