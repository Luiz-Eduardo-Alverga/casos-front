"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getLiberacaoItens } from "@/services/sprint/get-liberacao-itens";

const DEFAULT_LIMIT = 15;

export interface UseLiberacaoItensOptions {
  enabled?: boolean;
  liberacao?: string;
  resumo?: string;
  limit?: number;
}

export function useLiberacaoItens(
  registro: number | string | null | undefined,
  options?: UseLiberacaoItensOptions,
) {
  const enabled = options?.enabled ?? true;
  const liberacao = options?.liberacao ?? "todos";
  const resumo = options?.resumo;
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const shouldFetch = registro != null && registro !== "" && enabled;

  return useInfiniteQuery({
    queryKey: ["liberacoes", registro, "itens", liberacao, resumo ?? "", limit],
    queryFn: ({ pageParam }) =>
      getLiberacaoItens(registro as number | string, {
        liberacao,
        resumo,
        limit,
        offset: pageParam,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.next_offset != null ? lastPage.next_offset : undefined,
    enabled: shouldFetch,
    refetchOnWindowFocus: false,
  });
}
