"use client";

import { useQuery } from "@tanstack/react-query";
import { produtosKeys } from "@/hooks/produtos/produtos-query-keys";
import { getProdutoChecklistAll } from "@/services/produtos/checklist";

export interface UseProdutoChecklistOptions {
  enabled?: boolean;
}

export function useProdutoChecklist(
  produtoId: number | string | null | undefined,
  options?: UseProdutoChecklistOptions,
) {
  const enabled =
    (options?.enabled ?? true) && produtoId != null && produtoId !== "";

  return useQuery({
    queryKey: produtosKeys.checklist(produtoId ?? ""),
    queryFn: () => getProdutoChecklistAll(produtoId as number | string),
    enabled,
  });
}
