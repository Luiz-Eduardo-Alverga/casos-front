"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getSgpRiscosHistorico,
  type GetSgpRiscosHistoricoParams,
} from "@/services/sgp-riscos-historico/get-sgp-riscos-historico";
import { sgpRiscosHistoricoQueryKeys } from "@/hooks/projetos/sgp-projeto-query-keys";

export interface UseSgpRiscosHistoricoByRiscoOptions {
  enabled?: boolean;
  per_page?: number;
  cursor?: string | null;
}

export function useSgpRiscosHistoricoByRisco(
  id_seq: number | string | null | undefined,
  options?: UseSgpRiscosHistoricoByRiscoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch =
    id_seq != null && id_seq !== "" && !Number.isNaN(Number(id_seq)) && enabled;

  const params: GetSgpRiscosHistoricoParams | null = shouldFetch
    ? {
        id_seq: id_seq as number | string,
        per_page: options?.per_page,
        cursor: options?.cursor,
      }
    : null;

  return useQuery({
    queryKey: sgpRiscosHistoricoQueryKeys.list(
      id_seq ?? "",
      options?.per_page ?? "",
      options?.cursor ?? "",
    ),
    queryFn: () => getSgpRiscosHistorico(params!),
    enabled: Boolean(params),
  });
}

export function useSgpRiscosHistoricoByRiscoInfinite(
  id_seq: number | string | null | undefined,
  options?: UseSgpRiscosHistoricoByRiscoOptions,
) {
  const enabled = options?.enabled ?? true;
  const shouldFetch =
    id_seq != null && id_seq !== "" && !Number.isNaN(Number(id_seq)) && enabled;
  const perPage = options?.per_page ?? 15;

  return useInfiniteQuery({
    queryKey: sgpRiscosHistoricoQueryKeys.infinite(
      id_seq ?? "",
      perPage,
    ),
    queryFn: ({ pageParam }) =>
      getSgpRiscosHistorico({
        id_seq: id_seq as number | string,
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
