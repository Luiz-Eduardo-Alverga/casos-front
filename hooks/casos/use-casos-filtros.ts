"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryStates } from "nuqs";
import { casosFiltrosParsers } from "@/components/casos/filtros/casos-filtros-parsers";
import {
  filtrosAplicadosToNuqsState,
  filtrosQueryKey,
  nuqsStateToFiltrosAplicados,
} from "@/components/casos/filtros/casos-filtros-mappers";
import type { CasosFiltrosAplicados } from "@/components/casos/filtros/casos-filtros.types";

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

  const aplicarFiltros = useCallback(
    (filtros: CasosFiltrosAplicados) => {
      void setNuqsState(filtrosAplicadosToNuqsState(filtros));
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
    });
  }, [setNuqsState]);

  return {
    filtrosAplicados,
    aplicarFiltros,
    limparFiltros,
  };
}
