"use client";

import { useQuery } from "@tanstack/react-query";
import { getProdutosOrdem } from "@/services/projeto-dev/get-produtos-ordem";

export function useProdutosOrdem(params: { id_colaborador: string }) {
  return useQuery({
    queryKey: ["produtos-ordem", params.id_colaborador],
    enabled: Boolean(params.id_colaborador),
    queryFn: () => getProdutosOrdem({ id_colaborador: params.id_colaborador }),
  });
}
