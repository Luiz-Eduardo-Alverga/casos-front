"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getUsuariosComunicado } from "@/services/comunicados";
import type { ComunicadoFiltros } from "@/services/comunicados/types";

const DEBOUNCE_MS = 300;

/**
 * Usuários que batem nos filtros (OR dentro do grupo, AND entre grupos).
 * `filtros` já vem montado (grupo sem seleção = todos os valores); `null` desliga a busca.
 * Debounce de 300ms para não disparar a cada clique no multi-select.
 */
export function useUsuariosComunicado(filtros: ComunicadoFiltros | null) {
  const [debounced, setDebounced] = useState(filtros);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(filtros), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [filtros]);

  return useQuery({
    queryKey: ["usuarios-comunicado", debounced],
    queryFn: () => getUsuariosComunicado(debounced as ComunicadoFiltros),
    enabled: debounced !== null,
    placeholderData: keepPreviousData,
  });
}
