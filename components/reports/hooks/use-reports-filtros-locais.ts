"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import {
  agregarProdutos,
  agruparItens,
  contarCriticidades,
  contarPrazos,
  filtrarItens,
  type ReportCriticidade,
  type ReportPrazoFiltro,
  type ReportsSort,
} from "../filtros/reports-filtros-locais";

export function useReportsFiltrosLocais(itens: ProjetoMemoriaItem[]) {
  const [criticidades, setCriticidades] = useState<ReportCriticidade[]>([]);
  const [prazo, setPrazo] = useState<ReportPrazoFiltro | "">("");
  const [produtoIds, setProdutoIds] = useState<number[]>([]);
  const [sort, setSort] = useState<ReportsSort>("prazo");
  const [nomes, setNomes] = useState<Record<number, string>>({});

  useEffect(() => {
    setNomes((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const item of itens) {
        const id = item.produto?.id;
        const nome = item.produto?.nome?.trim();
        if (id == null || !nome || next[id] === nome) continue;
        next[id] = nome;
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [itens]);

  const state = useMemo(
    () => ({ criticidades, prazo, produtoIds }),
    [criticidades, prazo, produtoIds],
  );

  const filtrados = useMemo(() => filtrarItens(itens, state), [itens, state]);
  const grupos = useMemo(() => agruparItens(filtrados, sort), [filtrados, sort]);
  const contagemCriticidade = useMemo(
    () => contarCriticidades(itens, state),
    [itens, state],
  );
  const contagemPrazo = useMemo(() => contarPrazos(itens, state), [itens, state]);
  const produtos = useMemo(
    () => agregarProdutos(itens, state, nomes),
    [itens, state, nomes],
  );

  const toggleCriticidade = useCallback((value: ReportCriticidade) => {
    setCriticidades((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  }, []);

  const togglePrazo = useCallback((value: ReportPrazoFiltro) => {
    setPrazo((prev) => (prev === value ? "" : value));
  }, []);

  const toggleProduto = useCallback((id: number) => {
    setProdutoIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }, []);

  const limpar = useCallback(() => {
    setCriticidades([]);
    setPrazo("");
    setProdutoIds([]);
    setSort("prazo");
  }, []);

  return {
    criticidades,
    prazo,
    produtoIds,
    sort,
    setSort,
    toggleCriticidade,
    togglePrazo,
    toggleProduto,
    limpar,
    filtrados,
    grupos,
    contagemCriticidade,
    contagemPrazo,
    produtos,
  };
}

export type ReportsFiltrosLocais = ReturnType<typeof useReportsFiltrosLocais>;
