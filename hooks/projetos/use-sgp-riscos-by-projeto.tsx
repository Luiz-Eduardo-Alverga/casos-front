"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getSgpRiscosByProjeto,
  type GetSgpRiscosByProjetoParams,
} from "@/services/sgp-riscos/get-sgp-riscos-by-projeto";
import { sgpRiscosQueryKeys } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseSgpRiscosByProjetoOptions {
  enabled?: boolean;
  per_page?: number;
  cursor?: string | null;
}

export function useSgpRiscosByProjeto(
  projetoId: number | string | null | undefined,
  options?: UseSgpRiscosByProjetoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;

  const params: GetSgpRiscosByProjetoParams | null = shouldFetch
    ? {
        projetoId: projetoId as number | string,
        per_page: options?.per_page,
        cursor: options?.cursor,
      }
    : null;

  return useQuery({
    queryKey: sgpRiscosQueryKeys.list(
      projetoId ?? "",
      options?.per_page ?? "",
      options?.cursor ?? "",
    ),
    queryFn: () => getSgpRiscosByProjeto(params!),
    enabled: Boolean(params),
  });
}

export function useSgpRiscosByProjetoInfinite(
  projetoId: number | string | null | undefined,
  options?: UseSgpRiscosByProjetoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;
  const perPage = options?.per_page ?? 15;

  return useInfiniteQuery({
    queryKey: sgpRiscosQueryKeys.infinite(
      projetoId as number | string,
      perPage,
    ),
    queryFn: ({ pageParam }) =>
      getSgpRiscosByProjeto({
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
