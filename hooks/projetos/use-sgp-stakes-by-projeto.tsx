"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getSgpStakesByProjeto,
  type GetSgpStakesByProjetoParams,
} from "@/services/sgp-stakes/get-sgp-stakes-by-projeto";

export interface UseSgpStakesByProjetoOptions {
  enabled?: boolean;
  per_page?: number;
  cursor?: string | null;
}

export function useSgpStakesByProjeto(
  projetoId: number | string | null | undefined,
  options?: UseSgpStakesByProjetoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;

  const params: GetSgpStakesByProjetoParams | null = shouldFetch
    ? {
        projetoId: projetoId as number | string,
        per_page: options?.per_page,
        cursor: options?.cursor,
      }
    : null;

  return useQuery({
    queryKey: [
      "sgp-stakes",
      "projeto",
      projetoId ?? "",
      options?.per_page ?? "",
      options?.cursor ?? "",
    ],
    queryFn: () => getSgpStakesByProjeto(params!),
    enabled: Boolean(params),
  });
}

export function useSgpStakesByProjetoInfinite(
  projetoId: number | string | null | undefined,
  options?: UseSgpStakesByProjetoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;
  const perPage = options?.per_page ?? 15;

  return useInfiniteQuery({
    queryKey: ["sgp-stakes", "projeto", "infinite", projetoId ?? "", perPage],
    queryFn: ({ pageParam }) =>
      getSgpStakesByProjeto({
        projetoId: projetoId as number | string,
        per_page: perPage,
        cursor: pageParam ?? null,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_more
        ? lastPage.pagination.next_cursor
        : undefined,
    enabled: shouldFetch,
  });
}
