"use client";

import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { getClientesProdutosEnderecosUrl } from "@/services/clientes/get-clientes-produtos-enderecos-url";

export interface UseClientesProdutosEnderecosUrlPorClientesParams {
  clienteIds: number[];
  enabled?: boolean;
}

export function useClientesProdutosEnderecosUrlPorClientes({
  clienteIds,
  enabled = true,
}: UseClientesProdutosEnderecosUrlPorClientesParams) {
  const queries = useQueries({
    queries: clienteIds.map((clienteId) => ({
      queryKey: ["clientes-produtos-enderecos-url", String(clienteId)],
      queryFn: () => getClientesProdutosEnderecosUrl({ registro: clienteId }),
      enabled: enabled && clienteIds.length > 0,
    })),
  });

  const urlPorCliente = useMemo(() => {
    const map = new Map<number, string>();
    queries.forEach((query, index) => {
      const clienteId = clienteIds[index];
      if (clienteId == null) return;
      const urls =
        query.data?.data
          ?.map((item) => item.url?.trim())
          .filter((url): url is string => Boolean(url)) ?? [];
      if (urls.length > 0) {
        map.set(clienteId, urls.join(", "));
      }
    });
    return map;
  }, [queries, clienteIds]);

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);
  const hasError = queries.some((q) => q.isError);

  return {
    urlPorCliente,
    isLoading,
    isFetching,
    hasError,
    queries,
  };
}
