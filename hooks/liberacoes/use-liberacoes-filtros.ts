"use client";

import { useCallback } from "react";
import { useQueryStates } from "nuqs";
import { liberacoesFiltrosParsers } from "@/components/liberacoes/filtros/liberacoes-filtros-parsers";
import type { LiberacoesFiltrosState } from "@/components/liberacoes/filtros/liberacoes-filtros.types";

export function useLiberacoesFiltros() {
  const [filtros, setFiltros] = useQueryStates(liberacoesFiltrosParsers, {
    history: "replace",
    shallow: false,
  });

  const setFiltro = useCallback(
    <K extends keyof LiberacoesFiltrosState>(
      key: K,
      value: LiberacoesFiltrosState[K],
    ) => {
      void setFiltros({ [key]: value || null });
    },
    [setFiltros],
  );

  const limparFiltros = useCallback(() => {
    void setFiltros({
      produtoId: null,
      status: null,
      tipoLiberacao: null,
      versao: null,
    });
  }, [setFiltros]);

  return { filtros, setFiltro, limparFiltros };
}
