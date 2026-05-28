"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/painel/empty-state";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { ProjetosTabelaTable } from "@/components/projetos/tabela/projetos-tabela-table";
import { EscopoSummaryCards } from "@/components/projetos/edicao/escopo/escopo-summary-cards";
import { EscopoFiltrosBar } from "@/components/projetos/edicao/escopo/escopo-filtros-bar";
import { AbaEscopoSkeleton } from "@/components/projetos/edicao/escopo/aba-escopo-skeleton";
import { EscopoContentSkeleton } from "@/components/projetos/edicao/escopo/escopo-content-skeleton";
import {
  buildEscopoMemoriaParams,
  mapProjetoMemoriaToTabelaRow,
  type EscopoNaoPlanejadoFiltro,
} from "@/components/projetos/edicao/escopo/utils";

export interface AbaEscopoProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaEscopo({ projetoId, enabled = true }: AbaEscopoProps) {
  const [statusIds, setStatusIds] = useState<string[]>([]);
  const [usuarioDevId, setUsuarioDevId] = useState("");
  const [naoPlanejadoFiltro, setNaoPlanejadoFiltro] =
    useState<EscopoNaoPlanejadoFiltro>("todos");

  const memoriaParams = useMemo(
    () =>
      buildEscopoMemoriaParams(
        projetoId,
        statusIds,
        usuarioDevId,
        naoPlanejadoFiltro,
      ),
    [projetoId, statusIds, usuarioDevId, naoPlanejadoFiltro],
  );

  const escopoQuery = useProjetoMemoria(memoriaParams, { enabled });

  const itens = useMemo(
    () =>
      escopoQuery.data?.pages.flatMap((p) =>
        p.data.map(mapProjetoMemoriaToTabelaRow),
      ) ?? [],
    [escopoQuery.data?.pages],
  );

  const totalizadores = escopoQuery.data?.pages[0]?.totalizadores;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleDevChange = useCallback((devId: string) => {
    setUsuarioDevId(devId);
  }, []);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !escopoQuery.hasNextPage || escopoQuery.isFetchingNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          escopoQuery.fetchNextPage();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    escopoQuery.hasNextPage,
    escopoQuery.isFetchingNextPage,
    escopoQuery.fetchNextPage,
    escopoQuery,
  ]);

  const hasFiltrosAplicados =
    statusIds.length > 0 ||
    Boolean(usuarioDevId.trim()) ||
    naoPlanejadoFiltro !== "todos";

  /** Skeleton só na carga inicial (sem filtros). Evita desmontar filtros ao refetch. */
  const isInitialLoading =
    enabled &&
    escopoQuery.isLoading &&
    !escopoQuery.data &&
    !hasFiltrosAplicados;

  const isRefetchingComFiltros =
    hasFiltrosAplicados &&
    (escopoQuery.isFetching || escopoQuery.isLoading) &&
    !escopoQuery.isFetchingNextPage;

  if (isInitialLoading) {
    return <AbaEscopoSkeleton />;
  }

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-5 pb-2">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
              <FileText className="h-4 w-4 text-text-primary" />
            </div>
            <CardTitle className="text-sm font-semibold text-text-primary">
              Escopo do Projeto
            </CardTitle>
          </div>
          <EscopoFiltrosBar
            statusIds={statusIds}
            onStatusIdsChange={setStatusIds}
            onDevChange={handleDevChange}
            naoPlanejadoFiltro={naoPlanejadoFiltro}
            onNaoPlanejadoFiltroChange={setNaoPlanejadoFiltro}
          />
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3 space-y-4">
        {escopoQuery.isError ? (
          <p className="text-sm text-destructive">
            {escopoQuery.error instanceof Error
              ? escopoQuery.error.message
              : "Erro ao carregar escopo do projeto."}
          </p>
        ) : isRefetchingComFiltros ? (
          <EscopoContentSkeleton />
        ) : (
          <>
            <EscopoSummaryCards
              tempoTotalEstimadoMinutos={
                totalizadores?.tempo_total_estimado_minutos
              }
              tempoTotalRealizadoMinutos={
                totalizadores?.tempo_total_realizado_minutos
              }
            />
            {itens.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Nenhum caso no escopo"
                description="Este projeto não possui casos vinculados ou nenhum resultado corresponde aos filtros aplicados."
                className="min-h-[160px]"
              />
            ) : (
              <>
                <ProjetosTabelaTable
                  variant="escopo"
                  itens={itens}
                  isFetchingNextPage={escopoQuery.isFetchingNextPage}
                />
                {escopoQuery.hasNextPage && (
                  <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />
                )}
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
