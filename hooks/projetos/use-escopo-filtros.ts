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
      const ids = statusIds.map((s) => s.trim()).filter(Boolean);
      void setNuqsState({
        escopo_status_id: ids.length > 0 ? ids : null,
      });
    },
    [setNuqsState],
  );

  const setUsuarioDevId = useCallback(
    (usuarioDevId: string) => {
      void setNuqsState({
        escopo_usuario_dev_id: usuarioDevId.trim() || null,
      });
    },
    [setNuqsState],
  );

  const setNaoPlanejadoFiltro = useCallback(
    (naoPlanejadoFiltro: EscopoNaoPlanejadoFiltro) => {
      void setNuqsState({
        escopo_nao_planejado:
          naoPlanejadoFiltro === "todos" ? null : naoPlanejadoFiltro,
      });
    },
    [setNuqsState],
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
