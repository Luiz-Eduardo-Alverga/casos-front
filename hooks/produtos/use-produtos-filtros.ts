"use client";

import { useCallback, useMemo } from "react";
import { useQueryStates } from "nuqs";
import {
  EMPTY_PRODUTOS_FILTROS,
  produtosFiltrosParsers,
  type ProdutosFiltrosAplicados,
} from "@/components/produtos/filtros/produtos-filtros.types";

export function hasProdutosFiltros(filtros: ProdutosFiltrosAplicados): boolean {
  return Boolean(filtros.nome.trim() || filtros.setor.trim());
}

export function useProdutosFiltros() {
  const [nuqsState, setNuqsState] = useQueryStates(produtosFiltrosParsers, {
    history: "replace",
    shallow: false,
  });

  const filtros = useMemo<ProdutosFiltrosAplicados>(
    () => ({
      nome: nuqsState.nome?.trim() ?? "",
      setor: nuqsState.setor?.trim() ?? "",
    }),
    [nuqsState.nome, nuqsState.setor],
  );

  const setFiltro = useCallback(
    (key: keyof ProdutosFiltrosAplicados, value: string | undefined) => {
      void setNuqsState({ [key]: value?.trim() ? value.trim() : null });
    },
    [setNuqsState],
  );

  const limparFiltros = useCallback(() => {
    void setNuqsState({
      nome: null,
      setor: null,
    });
  }, [setNuqsState]);

  return {
    filtros,
    setFiltro,
    limparFiltros,
    hasFilters: hasProdutosFiltros(filtros),
    emptyFiltros: EMPTY_PRODUTOS_FILTROS,
  };
}
