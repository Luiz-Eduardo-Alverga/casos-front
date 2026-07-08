"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { useSetores } from "@/hooks/catalogos/use-setores";
import { resolveSetorNome } from "@/components/reports/filtros/reports-filtros-mappers";
import { AUTO_REFETCH_INTERVAL_MS } from "@/lib/query-refetch-intervals";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import {
  DEFAULT_REPORTS_STATUS_IDS,
  type ReportsFiltrosAplicados,
} from "@/components/reports/types";

export function useReportsData(filtros: ReportsFiltrosAplicados) {
  const { data: setores } = useSetores();
  const setorNome = resolveSetorNome(filtros.setor, setores);
  const hasSetor = Boolean(setorNome);

  const params = useMemo(() => {
    const produtoId = filtros.produto?.trim();
    const statusIds =
      filtros.status_ids?.length > 0
        ? filtros.status_ids
        : [...DEFAULT_REPORTS_STATUS_IDS];
    const tipoCategoria = filtros.tipo_categoria?.trim();
    return {
      analise_aprovado: false,
      tipo_abertura: "REPORT" as const,
      status_id: statusIds,
      ...(setorNome ? { setor: setorNome } : {}),
      ...(produtoId ? { produto_id: produtoId } : {}),
      ...(tipoCategoria ? { tipo_categoria: tipoCategoria } : {}),
      sort_by: "prioridade",
      sort_order: "DESC" as const,
    };
  }, [setorNome, filtros.produto, filtros.tipo_categoria, filtros.status_ids]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProjetoMemoria(params, {
      enabled: hasSetor,
      refetchInterval: hasSetor ? AUTO_REFETCH_INTERVAL_MS : false,
    });

  const itens = useMemo<ProjetoMemoriaItem[]>(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const totalCasos = data?.pages[0]?.totalizadores?.total_casos ?? 0;

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRootState] = useState<HTMLElement | null>(null);

  const setScrollRoot = useCallback((el: HTMLElement | null) => {
    setScrollRootState(el);
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: scrollRoot,
        rootMargin: "100px",
        threshold: 0,
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, scrollRoot]);

  return {
    itens,
    totalCasos,
    isLoading,
    hasSetor,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    loadMoreRef,
    setScrollRoot,
  };
}
