"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getSgpRiscosHistoricoByProjeto,
  type GetSgpRiscosHistoricoByProjetoParams,
} from "@/services/sgp-riscos-historico/get-sgp-riscos-historico-by-projeto";
import { sgpRiscosHistoricoQueryKeys } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseSgpRiscosHistoricoByProjetoOptions {
  enabled?: boolean;
  per_page?: number;
  cursor?: string | null;
}

export function useSgpRiscosHistoricoByProjeto(
  projetoId: number | string | null | undefined,
  options?: UseSgpRiscosHistoricoByProjetoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;

  const params: GetSgpRiscosHistoricoByProjetoParams | null = shouldFetch
    ? {
        projetoId: projetoId as number | string,
        per_page: options?.per_page,
        cursor: options?.cursor,
      }
    : null;

  return useQuery({
    queryKey: sgpRiscosHistoricoQueryKeys.list(
      projetoId ?? "",
      options?.per_page ?? "",
      options?.cursor ?? "",
    ),
    queryFn: () => getSgpRiscosHistoricoByProjeto(params!),
    enabled: Boolean(params),
  });
}

export function useSgpRiscosHistoricoByProjetoInfinite(
  projetoId: number | string | null | undefined,
  options?: UseSgpRiscosHistoricoByProjetoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch = projetoId != null && projetoId !== "" && enabled;
  const perPage = options?.per_page ?? 15;

  return useInfiniteQuery({
    queryKey: sgpRiscosHistoricoQueryKeys.infinite(
      projetoId as number | string,
      perPage,
    ),
    queryFn: ({ pageParam }) =>
      getSgpRiscosHistoricoByProjeto({
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
