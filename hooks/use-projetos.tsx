"use client";

import { useQuery } from "@tanstack/react-query";
import { getProjetos } from "@/services/auxiliar/projetos";

export function useProjetos(params?: {
  usuario_id?: number;
  setor_projeto?: string;
  numero_projeto?: number;
  search?: string;
  enabled?: boolean;
}) {
  const hasSetorProjeto = !!params?.setor_projeto;
  const enabled = hasSetorProjeto && (params?.enabled ?? true);
  return useQuery({
    queryKey: ["projetos", params?.usuario_id, params?.setor_projeto, params?.numero_projeto, params?.search ?? ""],
    queryFn: () => getProjetos(params),
    enabled,
  });
}
