"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsuariosComunicado } from "@/services/comunicados";
import type { ComunicadoFiltros } from "@/services/comunicados/types";

/**
 * Todos os usuários da empresa: `usuarios-comunicado` com todos os valores de cada grupo.
 * Base do modo "Todos os usuários" e da busca de "Adicionar usuário específico" (decisão #6).
 */
export function useTodosUsuariosComunicado(
  todosFiltros: ComunicadoFiltros | undefined,
) {
  return useQuery({
    queryKey: ["usuarios-comunicado", "todos", todosFiltros],
    queryFn: () => getUsuariosComunicado(todosFiltros as ComunicadoFiltros),
    enabled: !!todosFiltros,
    staleTime: 5 * 60 * 1000,
  });
}
