"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getProdutosOrdem } from "@/services/projeto-dev/get-produtos-ordem";

export function useProdutosOrdem(params: { id_colaborador: string }) {
  return useInfiniteQuery({
    queryKey: ["produtos-ordem", params.id_colaborador],
    enabled: Boolean(params.id_colaborador),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getProdutosOrdem({
        id_colaborador: params.id_colaborador,
        page: Number(pageParam) || 1,
      }),
    getNextPageParam: (lastPage) => {
      const current = lastPage?.pagination?.current_page ?? 1;
      const last = lastPage?.pagination?.last_page ?? 1;
      return current < last ? current + 1 : undefined;
    },
  });
}
