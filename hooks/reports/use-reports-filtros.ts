"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useQueryStates } from "nuqs";
import { reportsFiltrosParsers } from "@/components/reports/filtros/reports-filtros-parsers";
import {
  filtrosAplicadosToNuqsState,
  filtrosQueryKey,
  nuqsStateToFiltrosAplicados,
  resolveSetorIdByNome,
} from "@/components/reports/filtros/reports-filtros-mappers";
import type { ReportsFiltrosAplicados } from "@/components/reports/types";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { getUser } from "@/lib/auth";

export function useReportsFiltros() {
  const { data: setores, isSuccess: setoresReady } = useSetores();

  const [nuqsState, setNuqsState] = useQueryStates(reportsFiltrosParsers, {
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

  useEffect(() => {
    if (nuqsState.setor?.trim()) return;
    if (!setoresReady || !setores?.length) return;

    const setorId = resolveSetorIdByNome(getUser()?.setor, setores);
    if (!setorId) return;

    void setNuqsState({ setor: setorId });
  }, [nuqsState.setor, setores, setoresReady, setNuqsState]);

  const aplicarFiltros = useCallback(
    (filtros: ReportsFiltrosAplicados) => {
      void setNuqsState(filtrosAplicadosToNuqsState(filtros));
    },
    [setNuqsState],
  );

  const limparFiltros = useCallback(() => {
    const setorId = resolveSetorIdByNome(getUser()?.setor, setores);

    void setNuqsState({
      setor: setorId || null,
      produto: null,
      status_id: null,
    });
  }, [setores, setNuqsState]);

  return {
    filtrosAplicados,
    aplicarFiltros,
    limparFiltros,
  };
}
