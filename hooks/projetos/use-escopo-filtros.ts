"use client";

import { useCallback, useMemo } from "react";
import { useQueryStates } from "nuqs";
import {
  escopoFiltrosParsers,
  type EscopoFiltrosAplicados,
} from "@/components/projetos/edicao/escopo/escopo-filtros-parsers";
import {
  filtrosAplicadosToNuqsState,
  filtrosQueryKey,
  nuqsStateToFiltrosAplicados,
} from "@/components/projetos/edicao/escopo/escopo-filtros-mappers";
import type { EscopoNaoPlanejadoFiltro } from "@/components/projetos/edicao/escopo/utils";

export function useEscopoFiltros() {
  const [nuqsState, setNuqsState] = useQueryStates(escopoFiltrosParsers, {
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
    (filtros: EscopoFiltrosAplicados) => {
      void setNuqsState(filtrosAplicadosToNuqsState(filtros));
    },
    [setNuqsState],
  );

  const setStatusIds = useCallback(
    (statusIds: string[]) => {
      aplicarFiltros({ ...filtrosAplicados, statusIds });
    },
    [aplicarFiltros, filtrosAplicados],
  );

  const setUsuarioDevId = useCallback(
    (usuarioDevId: string) => {
      aplicarFiltros({ ...filtrosAplicados, usuarioDevId });
    },
    [aplicarFiltros, filtrosAplicados],
  );

  const setNaoPlanejadoFiltro = useCallback(
    (naoPlanejadoFiltro: EscopoNaoPlanejadoFiltro) => {
      aplicarFiltros({ ...filtrosAplicados, naoPlanejadoFiltro });
    },
    [aplicarFiltros, filtrosAplicados],
  );

  const limparFiltros = useCallback(() => {
    void setNuqsState({
      escopo_usuario_dev_id: null,
      escopo_status_id: null,
      escopo_nao_planejado: null,
    });
  }, [setNuqsState]);

  return {
    filtrosAplicados,
    aplicarFiltros,
    setStatusIds,
    setUsuarioDevId,
    setNaoPlanejadoFiltro,
    limparFiltros,
  };
}
