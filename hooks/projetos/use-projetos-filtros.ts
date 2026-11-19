"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryStates } from "nuqs";
import { getUser } from "@/lib/auth";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { projetosFiltrosParsers } from "@/components/projetos/filtros/projetos-filtros-parsers";
import {
  filtrosAplicadosToNuqsState,
  filtrosQueryKey,
  hasFiltersApplied,
  mesDaData,
  nuqsStateToFiltrosAplicados,
} from "@/components/projetos/filtros/projetos-filtros-mappers";
import {
  EMPTY_PROJETOS_FILTROS_APLICADOS,
  type ProjetosFiltrosAplicados,
} from "@/components/projetos/filtros/projetos-filtros.types";
import { resolveSetorIdByNome } from "@/components/projetos/cadastro/utils";

/**
 * Filtros da listagem de Projetos na URL (decisão #36). O padrão é o setor do usuário + o mês
 * atual (decisão #37): aplicado ao abrir sem filtros na URL e ao "Limpar filtros".
 */
export function useProjetosFiltros() {
  const [nuqsState, setNuqsState] = useQueryStates(projetosFiltrosParsers, {
    history: "replace",
    shallow: false,
  });

  const setoresQuery = useSetores({ enabled: true });
  const setoresProntos = setoresQuery.isSuccess || setoresQuery.isError;

  const filtrosQueryKeyStable = useMemo(
    () => filtrosQueryKey(nuqsStateToFiltrosAplicados(nuqsState)),
    [nuqsState],
  );

  const filtrosAplicados = useMemo(
    () => nuqsStateToFiltrosAplicados(nuqsState),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key estável representa nuqsState
    [filtrosQueryKeyStable],
  );

  /** Setor do usuário (id) + mês atual. Sem o setor na lista, só o mês (fica "Todos"). */
  const padrao = useMemo<ProjetosFiltrosAplicados | null>(() => {
    if (!setoresProntos) return null;
    const setorUsuario = getUser()?.setor ?? "";
    return {
      ...EMPTY_PROJETOS_FILTROS_APLICADOS,
      setor: resolveSetorIdByNome(setorUsuario, setoresQuery.data),
      mes: mesDaData(),
    };
  }, [setoresProntos, setoresQuery.data]);

  // Ao abrir sem filtros na URL, grava o padrão (com filtros na URL, valem os da URL).
  const [aplicarPadraoAoAbrir, setAplicarPadraoAoAbrir] = useState(
    () => !hasFiltersApplied(filtrosAplicados),
  );
  useEffect(() => {
    if (!aplicarPadraoAoAbrir || !padrao) return;
    void setNuqsState(filtrosAplicadosToNuqsState(padrao));
    setAplicarPadraoAoAbrir(false);
  }, [aplicarPadraoAoAbrir, padrao, setNuqsState]);

  const aplicarFiltros = useCallback(
    (filtros: ProjetosFiltrosAplicados) => {
      void setNuqsState(filtrosAplicadosToNuqsState(filtros));
    },
    [setNuqsState],
  );

  const limparFiltros = useCallback(() => {
    void setNuqsState(
      filtrosAplicadosToNuqsState(
        padrao ?? { ...EMPTY_PROJETOS_FILTROS_APLICADOS, mes: mesDaData() },
      ),
    );
  }, [padrao, setNuqsState]);

  return {
    filtrosAplicados,
    aplicarFiltros,
    limparFiltros,
    /** Enquanto o padrão ainda não foi gravado na URL (esperando os setores). */
    aguardandoPadrao: aplicarPadraoAoAbrir,
  };
}
