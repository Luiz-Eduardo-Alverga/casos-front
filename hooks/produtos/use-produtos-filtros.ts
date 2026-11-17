"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryStates } from "nuqs";
import { useSearchParams } from "next/navigation";
import { getUser } from "@/lib/auth";
import {
  EMPTY_PRODUTOS_FILTROS,
  produtosFiltrosParsers,
  type ProdutosFiltroTexto,
  type ProdutosFiltrosAplicados,
} from "@/components/produtos/filtros/produtos-filtros.types";

/** Há termo de busca (nome ou setor)? A listagem só consulta a API com um deles. */
export function hasProdutosFiltros(filtros: ProdutosFiltrosAplicados): boolean {
  return Boolean(filtros.nome.trim() || filtros.setor.trim());
}

/** Algo diferente do padrão (para mostrar "Limpar filtros"). Desativados é true por padrão. */
function hasProdutosFiltrosAlterados(filtros: ProdutosFiltrosAplicados): boolean {
  return hasProdutosFiltros(filtros) || !filtros.incluirDesativados;
}

export function useProdutosFiltros() {
  const [nuqsState, setNuqsState] = useQueryStates(produtosFiltrosParsers, {
    history: "replace",
    shallow: false,
  });

  // Setor padrão = setor do usuário logado, aplicado ao entrar na tela sem filtro na
  // URL. Fica só em memória (não é gravado na URL): gravar logo na entrada disputava
  // com o Next, que grava /produtos sem query ao terminar a navegação interna, e o
  // setor sumia. Vale até o usuário mexer no setor ou limpar os filtros.
  // Decidido no efeito (getUser lê localStorage, que não existe no servidor).
  const searchParams = useSearchParams();
  const urlTemFiltroNaEntradaRef = useRef(
    ["nome", "setor", "desativados"].some((key) => searchParams.has(key)),
  );
  const [setorPadrao, setSetorPadrao] = useState("");

  useEffect(() => {
    if (urlTemFiltroNaEntradaRef.current) return;
    const setorUsuario = getUser()?.setor?.trim() ?? "";
    if (setorUsuario) setSetorPadrao(setorUsuario);
  }, []);

  const filtros = useMemo<ProdutosFiltrosAplicados>(
    () => ({
      nome: nuqsState.nome?.trim() ?? "",
      setor: nuqsState.setor?.trim() || setorPadrao,
      incluirDesativados: nuqsState.desativados,
    }),
    [nuqsState.nome, nuqsState.setor, nuqsState.desativados, setorPadrao],
  );

  const setFiltro = useCallback(
    (key: ProdutosFiltroTexto, value: string | undefined) => {
      if (key === "setor") setSetorPadrao("");
      void setNuqsState({ [key]: value?.trim() ? value.trim() : null });
    },
    [setNuqsState],
  );

  const setIncluirDesativados = useCallback(
    (value: boolean) => {
      // true é o padrão: sai da URL; false fica explícito (?desativados=false).
      void setNuqsState({ desativados: value ? null : false });
    },
    [setNuqsState],
  );

  const limparFiltros = useCallback(() => {
    setSetorPadrao("");
    void setNuqsState({
      nome: null,
      setor: null,
      desativados: null,
    });
  }, [setNuqsState]);

  return {
    filtros,
    setFiltro,
    setIncluirDesativados,
    limparFiltros,
    hasFilters: hasProdutosFiltrosAlterados(filtros),
    emptyFiltros: EMPTY_PRODUTOS_FILTROS,
  };
}
