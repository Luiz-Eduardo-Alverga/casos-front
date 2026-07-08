"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { casosFiltrosParsers } from "@/components/casos/filtros/casos-filtros-parsers";
import {
  filtrosAplicadosToNuqsState,
  filtrosQueryKey,
  nuqsStateToFiltrosAplicados,
  nuqsStateToSortState,
  sortStateToNuqsUpdate,
} from "@/components/casos/filtros/casos-filtros-mappers";
import type { CasosFiltrosAplicados } from "@/components/casos/filtros/casos-filtros.types";
import type { ProjetoMemoriaSortState } from "@/components/projetos/tabela/projeto-memoria-sort";

export function useCasosFiltros() {
  const searchParams = useSearchParams();
  const legacyStatus = searchParams.get("status");

  const [nuqsState, setNuqsState] = useQueryStates(casosFiltrosParsers, {
    history: "replace",
    shallow: false,
  });

  const filtrosQueryKeyStable = useMemo(
    () => filtrosQueryKey(nuqsStateToFiltrosAplicados(nuqsState, legacyStatus)),
    [nuqsState, legacyStatus],
  );

  const filtrosAplicados = useMemo(
    () => nuqsStateToFiltrosAplicados(nuqsState, legacyStatus),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key estável representa nuqsState
    [filtrosQueryKeyStable, legacyStatus],
  );

  const sort = useMemo(() => nuqsStateToSortState(nuqsState), [nuqsState]);

  const aplicarFiltros = useCallback(
    (filtros: CasosFiltrosAplicados) => {
      void setNuqsState(filtrosAplicadosToNuqsState(filtros));
    },
    [setNuqsState],
  );

  const setSort = useCallback(
    (nextSort: ProjetoMemoriaSortState) => {
      void setNuqsState(sortStateToNuqsUpdate(nextSort));
    },
    [setNuqsState],
  );

  const limparFiltros = useCallback(() => {
    void setNuqsState({
      produto: null,
      versao: null,
      modulo: null,
      tipo_categoria: null,
      tipo_abertura: null,
      descricao_resumo: null,
      projeto_id: null,
      usuario_abertura_id: null,
      usuario_dev_id: null,
      usuario_qa_id: null,
      data_producao_inicio: null,
      data_producao_fim: null,
      status_id: null,
      sort_by: null,
      sort_order: null,
    });
  }, [setNuqsState]);

  return {
    filtrosAplicados,
    sort,
    aplicarFiltros,
    setSort,
    limparFiltros,
  };
}
