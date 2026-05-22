"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getSgpCronogramaByProjeto,
  type GetSgpCronogramaByProjetoParams,
} from "@/services/sgp-cronograma/get-sgp-cronograma-by-projeto";
import { sgpCronogramaQueryKeys } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseSgpCronogramaByProjetoOptions {
  enabled?: boolean;
  per_page?: number;
  cursor?: string | null;
}

export function useSgpCronogramaByProjeto(
  projetoId: number | string | null | undefined,
  options?: UseSgpCronogramaByProjetoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;

  const params: GetSgpCronogramaByProjetoParams | null = shouldFetch
    ? {
        projetoId: projetoId as number | string,
        per_page: options?.per_page,
        cursor: options?.cursor,
      }
    : null;

  return useQuery({
    queryKey: [
      "sgp-cronograma",
      "projeto",
      projetoId ?? "",
      options?.per_page ?? "",
      options?.cursor ?? "",
    ],
    queryFn: () => getSgpCronogramaByProjeto(params!),
    enabled: Boolean(params),
  });
}

export function useSgpCronogramaByProjetoInfinite(
  projetoId: number | string | null | undefined,
  options?: UseSgpCronogramaByProjetoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;
  const perPage = options?.per_page ?? 15;

  return useInfiniteQuery({
    queryKey: sgpCronogramaQueryKeys.infinite(
      projetoId as number | string,
      perPage,
    ),
    queryFn: ({ pageParam }) =>
      getSgpCronogramaByProjeto({
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
