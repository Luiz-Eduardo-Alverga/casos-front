"use client";

import { useQuery } from "@tanstack/react-query";
import { getModulos } from "@/services/auxiliar/modulos";

export function useModulos(params?: {
  produto_id?: string;
  search?: string;
}) {
  const hasSearch = params?.search && params.search.trim().length > 0;
  const hasProdutoId = !!params?.produto_id;
  
  return useQuery({
    queryKey: ["modulos", params?.produto_id ?? "", params?.search ?? ""],
    queryFn: () => getModulos({ produto_id: params!.produto_id!, search: params?.search }),
    enabled: hasProdutoId, // Só faz requisição quando houver produto_id E busca
  });
}
