"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getPainelIdeias,
  type GetPainelIdeiasParams,
} from "@/services/painel-ideias/get-painel-ideias";

export type PainelIdeiasQueryParams = Omit<GetPainelIdeiasParams, "page">;

export interface UsePainelIdeiasOptions {
  enabled?: boolean;
}

export function usePainelIdeias(
  params: GetPainelIdeiasParams = {},
  options?: UsePainelIdeiasOptions,
) {
  const perPage = params.per_page ?? 15;
  const page = params.page ?? 1;

  return useQuery({
    queryKey: [
      "painel-ideias",
      {
        ...params,
        per_page: perPage,
        page,
      },
    ],
    enabled: options?.enabled ?? true,
    queryFn: () =>
      getPainelIdeias({
        ...params,
        per_page: perPage,
        page,
      }),
  });
}

export function usePainelIdeiasInfinite(
  params: PainelIdeiasQueryParams = {},
  options?: UsePainelIdeiasOptions,
) {
  const perPage = params.per_page ?? 15;

  return useInfiniteQuery({
    queryKey: ["painel-ideias", "infinite", { ...params, per_page: perPage }],
    enabled: options?.enabled ?? true,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPainelIdeias({
        ...params,
        per_page: perPage,
        page: Number(pageParam) || 1,
      }),
    getNextPageParam: (lastPage) => {
      const current = lastPage?.pagination?.current_page ?? 1;
      const last = lastPage?.pagination?.last_page ?? 1;
      return current < last ? current + 1 : undefined;
    },
  });
}
