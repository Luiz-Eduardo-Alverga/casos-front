"use client";

import { useMemo } from "react";
import { useLiberacaoItens } from "@/hooks/liberacoes/use-liberacao-itens";
import { mapLiberacaoCasoItemToCasoVersaoRow } from "@/components/liberacoes/edicao/casos-versao/utils";

export interface UseCasosVersaoOptions {
  enabled?: boolean;
  liberacao?: string;
}

/**
 * Busca os casos da liberação via GET /sprint/liberacoes/{registro}/itens,
 * com paginação infinita por offset.
 */
export function useCasosVersao(
  registro: number | string | null | undefined,
  options?: UseCasosVersaoOptions,
) {
  const query = useLiberacaoItens(registro, {
    enabled: options?.enabled,
    liberacao: options?.liberacao ?? "todos",
  });

  const mappedPages = useMemo(() => {
    if (!query.data) return undefined;
    return {
      ...query.data,
      pages: query.data.pages.map((page) => ({
        data: page.data.map(mapLiberacaoCasoItemToCasoVersaoRow),
        total_casos: page.total,
        has_more: page.next_offset != null,
      })),
    };
  }, [query.data]);

  return {
    ...query,
    data: mappedPages,
  };
}
