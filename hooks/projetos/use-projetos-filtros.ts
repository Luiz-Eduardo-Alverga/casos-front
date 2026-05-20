"use client";

import { useCallback, useMemo } from "react";
import { useQueryStates } from "nuqs";
import { projetosFiltrosParsers } from "@/components/projetos/filtros/projetos-filtros-parsers";
import {
  filtrosAplicadosToNuqsState,
  filtrosQueryKey,
  nuqsStateToFiltrosAplicados,
} from "@/components/projetos/filtros/projetos-filtros-mappers";
import type { ProjetosFiltrosAplicados } from "@/components/projetos/filtros/projetos-filtros.types";

export function useProjetosFiltros() {
  const [nuqsState, setNuqsState] = useQueryStates(projetosFiltrosParsers, {
    history: "replace",
    shallow: false,
  });

  const filtrosQueryKeyStable = useMemo(
    () => filtrosQueryKey(nuqsStateToFiltrosAplicados(nuqsState)),
    [nuqsState],
  );

  const filtrosAplicados = useMemo(
    () => nuqsStateToFiltrosAplicados(nuqsState),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key estável representa nuqsState
    [filtrosQueryKeyStable],
  );

  const aplicarFiltros = useCallback(
    (filtros: ProjetosFiltrosAplicados) => {
      void setNuqsState(filtrosAplicadosToNuqsState(filtros));
    },
    [setNuqsState],
  );

  const limparFiltros = useCallback(() => {
    void setNuqsState({
      registro: null,
      setor: null,
    });
  }, [setNuqsState]);

  return {
    filtrosAplicados,
    aplicarFiltros,
    limparFiltros,
  };
}
