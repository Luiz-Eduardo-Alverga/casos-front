"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjetos } from "@/services/auxiliar/projetos";

export function useProjetos(params?: {
  usuario_id?: number;
  setor_projeto?: string;
  numero_projeto?: number;
  search?: string;
}) {
  const hasSearch = params?.search && params.search.trim().length > 0;
  const hasSetorProjeto = !!params?.setor_projeto;
  
  return useQuery({
    queryKey: ["projetos", params?.usuario_id, params?.setor_projeto, params?.numero_projeto, params?.search ?? ""],
    queryFn: () => getProjetos(params),
    enabled: hasSetorProjeto // Só faz requisição quando houver setor_projeto (produto selecionado) E busca
  });
}
