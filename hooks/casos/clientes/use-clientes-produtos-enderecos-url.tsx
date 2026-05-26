"use client";

import { useQuery } from "@tanstack/react-query";
import { getClientesProdutosEnderecosUrl } from "@/services/clientes/get-clientes-produtos-enderecos-url";

export function useClientesProdutosEnderecosUrl(params?: {
  registro?: number | string;
  enabled?: boolean;
}) {
  const baseEnabled = Boolean(params?.registro);
  const enabled = baseEnabled && (params?.enabled ?? true);

  return useQuery({
    queryKey: [
      "clientes-produtos-enderecos-url",
      String(params?.registro ?? ""),
    ],
    enabled,
    queryFn: () =>
      getClientesProdutosEnderecosUrl({ registro: params!.registro! }),
  });
}
