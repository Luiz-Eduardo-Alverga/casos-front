"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useQueryStates } from "nuqs";
import { reportsFiltrosParsers } from "../filtros/reports-filtros-parsers";
import {
  filtrosAplicadosToNuqsState,
  filtrosQueryKey,
  nuqsStateToFiltrosAplicados,
  resolveSetorIdByNome,
} from "../filtros/reports-filtros-mappers";
import type {
  ReportsFiltrosAplicados,
  ReportsViewMode,
} from "../types";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { getUser } from "@/lib/auth";
import { readReportsViewMode, writeReportsViewMode } from "@/lib/reports-view-mode-storage";

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

  // Restaura setor padrão e view do localStorage num único setNuqsState
  // para evitar race entre updates parciais do nuqs no mount.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const updates: {
      setor?: string;
      view?: ReportsViewMode;
    } = {};

    if (!nuqsState.setor?.trim() && setoresReady && setores?.length) {
      const setorId = resolveSetorIdByNome(getUser()?.setor, setores);
      if (setorId) updates.setor = setorId;
    }

    const url = new URL(window.location.href);
    if (!url.searchParams.has("view")) {
      const stored = readReportsViewMode();
      if (stored && stored !== "cards") {
        updates.view = stored;
      }
    }

    if (updates.setor === undefined && updates.view === undefined) return;

    void setNuqsState(updates);
  }, [nuqsState.setor, setores, setoresReady, setNuqsState]);

  const setViewMode = useCallback(
    (mode: ReportsViewMode) => {
      writeReportsViewMode(mode);
      void setNuqsState({ view: mode });
    },
    [setNuqsState],
  );

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
      tipo_categoria: null,
      status_id: null,
    });
  }, [setores, setNuqsState]);

  return {
    filtrosAplicados,
    aplicarFiltros,
    limparFiltros,
    viewMode: nuqsState.view,
    setViewMode,
  };
}
