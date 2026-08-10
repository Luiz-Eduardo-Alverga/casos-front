"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useQueryStates } from "nuqs";
import { getUser } from "@/lib/auth";
import { melhoriasFiltrosParsers } from "@/components/melhorias/filtros/melhorias-filtros-parsers";
import {
  filtrosToNuqsState,
  getPrimeiroDiaMesAtual,
  getUltimoDiaMesAtual,
} from "@/components/melhorias/filtros/melhorias-filtros-mappers";
import {
  EMPTY_MELHORIAS_FILTROS,
  type MelhoriasFiltrosState,
} from "@/components/melhorias/filtros/melhorias-filtros.types";

function buildDefaultMelhoriasFiltros(): MelhoriasFiltrosState {
  return {
    ...EMPTY_MELHORIAS_FILTROS,
    setor: getUser()?.setor?.trim() ?? "",
    dataInicial: getPrimeiroDiaMesAtual(),
    dataFinal: getUltimoDiaMesAtual(),
  };
}

function mergeFiltrosEfetivos(
  url: MelhoriasFiltrosState,
  defaults: MelhoriasFiltrosState,
): MelhoriasFiltrosState {
  return {
    ...url,
    setor: url.setor.trim() || defaults.setor,
    dataInicial: url.dataInicial.trim() || defaults.dataInicial,
    dataFinal: url.dataFinal.trim() || defaults.dataFinal,
  };
}

export function useMelhoriasFiltros() {
  const [filtrosUrl, setFiltros] = useQueryStates(melhoriasFiltrosParsers, {
    history: "replace",
    shallow: false,
  });

  const defaults = useMemo(() => buildDefaultMelhoriasFiltros(), []);

  const filtrosEfetivos = useMemo(
    () => mergeFiltrosEfetivos(filtrosUrl, defaults),
    [filtrosUrl, defaults],
  );

  // Best-effort: espelha defaults efetivos na URL sem bloquear UI/API.
  useEffect(() => {
    const urlJaSincronizada =
      filtrosUrl.setor.trim() === filtrosEfetivos.setor.trim() &&
      filtrosUrl.dataInicial.trim() === filtrosEfetivos.dataInicial.trim() &&
      filtrosUrl.dataFinal.trim() === filtrosEfetivos.dataFinal.trim();

    if (urlJaSincronizada) return;

    void setFiltros(filtrosToNuqsState(filtrosEfetivos));
  }, [filtrosUrl, filtrosEfetivos, setFiltros]);

  const aplicarFiltros = useCallback(
    (next: MelhoriasFiltrosState) => {
      void setFiltros(filtrosToNuqsState(next));
    },
    [setFiltros],
  );

  const limparFiltros = useCallback(() => {
    void setFiltros(filtrosToNuqsState(buildDefaultMelhoriasFiltros()));
  }, [setFiltros]);

  return {
    filtros: filtrosEfetivos,
    aplicarFiltros,
    limparFiltros,
  };
}
