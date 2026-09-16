"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CopyPlus, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { useEscopoFiltros } from "@/hooks/projetos/use-escopo-filtros";
import { useTransferirProximoProjeto } from "@/hooks/casos/use-transferir-proximo-projeto";
import { ProjetosTabelaTable } from "@/components/projetos/tabela/projetos-tabela-table";
import type { ProjetoMemoriaSortState } from "@/components/projetos/tabela/projeto-memoria-sort";
import { EscopoSummaryCards } from "@/components/projetos/edicao/escopo/escopo-summary-cards";
import { EscopoFiltrosBar } from "@/components/projetos/edicao/escopo/escopo-filtros-bar";
import { AbaEscopoSkeleton } from "@/components/projetos/edicao/escopo/aba-escopo-skeleton";
import { EscopoContentSkeleton } from "@/components/projetos/edicao/escopo/escopo-content-skeleton";
import { EscopoDuplicarCasosModal } from "@/components/projetos/edicao/escopo/escopo-duplicar-casos-modal";
import { hasEscopoFiltersApplied } from "@/components/projetos/edicao/escopo/escopo-filtros-mappers";
import {
  buildEscopoMemoriaParams,
  mapProjetoMemoriaToTabelaRow,
} from "@/components/projetos/edicao/escopo/utils";
import { hasAnyPermission, permissionsLoaded } from "@/lib/rbac-client";

export interface AbaEscopoProps {
  projetoId: number | string;
  setorProjeto?: string;
  enabled?: boolean;
}

export function AbaEscopo({
  projetoId,
  setorProjeto,
  enabled = true,
}: AbaEscopoProps) {
  const transferirProximoProjeto = useTransferirProximoProjeto();
  const rbacReady = permissionsLoaded();
  const canDuplicar =
    !rbacReady || hasAnyPermission(["edit-case", "edit-report"]);

  const {
    filtrosAplicados,
    setStatusIds,
    setUsuarioDevId,
    setNaoPlanejadoFiltro,
  } = useEscopoFiltros();

  const { statusIds, usuarioDevId, naoPlanejadoFiltro } = filtrosAplicados;

  const [sort, setSort] = useState<ProjetoMemoriaSortState>({});
  const [isDuplicarModalOpen, setIsDuplicarModalOpen] = useState(false);

  const memoriaParams = useMemo(
    () => ({
      ...buildEscopoMemoriaParams(
        projetoId,
        statusIds,
        usuarioDevId,
        naoPlanejadoFiltro,
        "TODOS",
      ),
      ...sort,
    }),
    [projetoId, statusIds, usuarioDevId, naoPlanejadoFiltro, sort],
  );

  const escopoQuery = useProjetoMemoria(memoriaParams, { enabled });
  const {
    refetch: refetchEscopo,
    isFetching,
    isFetchingNextPage,
  } = escopoQuery;

  const itens = useMemo(
    () =>
      escopoQuery.data?.pages.flatMap((p) =>
        p.data.map(mapProjetoMemoriaToTabelaRow),
      ) ?? [],
    [escopoQuery.data?.pages],
  );

  const totalizadores = escopoQuery.data?.pages[0]?.totalizadores;

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleDevChange = useCallback(
    (devId: string) => {
      setUsuarioDevId(devId);
    },
    [setUsuarioDevId],
  );

  const handleDuplicarCasos = useCallback(
    async (cronogramaDestino: number) => {
      try {
        const result = await transferirProximoProjeto.mutateAsync({
          cronograma_origem: Number(projetoId),
          cronograma_destino: cronogramaDestino,
        });
        const falhas = Array.isArray(result.falhas) ? result.falhas.length : 0;
        if (falhas > 0) {
          toast.error(
            `${falhas} caso(s) não puderam ser processados.`,
          );
        } else {
          toast.success("Casos duplicados com sucesso.");
        }
        setIsDuplicarModalOpen(false);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Erro ao duplicar casos para o próximo projeto.",
        );
      }
    },
    [projetoId, transferirProximoProjeto],
  );

  const isAtualizandoEscopo = isFetching && !isFetchingNextPage;

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

  const hasFiltrosAplicados = hasEscopoFiltersApplied(filtrosAplicados);

  /** Skeleton só na carga inicial (sem filtros). Evita desmontar filtros ao refetch. */
  const isInitialLoading =
    enabled &&
    escopoQuery.isLoading &&
    !escopoQuery.data &&
    !hasFiltrosAplicados;

  const isContentLoading =
    enabled && escopoQuery.isLoading && !escopoQuery.data;

  if (isInitialLoading) {
    return <AbaEscopoSkeleton />;
  }

  return (
    <Card className="rounded-lg bg-card shadow-card">
      <CardHeader className="border-b border-border-divider p-5 pb-2">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-4 w-4 text-text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold text-text-primary">
                Escopo do Projeto
              </CardTitle>
            </div>

            <EscopoFiltrosBar
              projetoId={projetoId}
              statusIds={statusIds}
              onStatusIdsChange={setStatusIds}
              usuarioDevId={usuarioDevId}
              onDevChange={handleDevChange}
              naoPlanejadoFiltro={naoPlanejadoFiltro}
              onNaoPlanejadoFiltroChange={setNaoPlanejadoFiltro}
              onAtualizar={() => void refetchEscopo()}
              isAtualizando={isAtualizandoEscopo}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-3 space-y-4 ">
        {escopoQuery.isError ? (
          <p className="text-sm text-destructive">
            {escopoQuery.error instanceof Error
              ? escopoQuery.error.message
              : "Erro ao carregar escopo do projeto."}
          </p>
        ) : isContentLoading ? (
          <EscopoContentSkeleton />
        ) : (
          <>
            <EscopoSummaryCards
              totalCasos={totalizadores?.total_casos}
              casosPlanejados={totalizadores?.casos_planejados}
              casosNaoPlanejados={totalizadores?.casos_nao_planejados}
              tempoTotalEstimadoMinutos={
                totalizadores?.tempo_total_estimado_minutos
              }
              tempoTotalRealizadoMinutos={
                totalizadores?.tempo_total_realizado_minutos
              }
            />

            {canDuplicar ? (
              <div className="flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDuplicarModalOpen(true)}
                >
                  <CopyPlus className="size-4 text-text-primary" />
                  Duplicar casos
                </Button>
              </div>
            ) : null}

            {itens.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="Nenhum caso no escopo"
                description="Este projeto não possui casos vinculados ou nenhum resultado corresponde aos filtros aplicados."
                className="min-h-[160px]"
              />
            ) : (
              <div className="flex flex-col">
                <ProjetosTabelaTable
                  variant="escopo"
                  itens={itens}
                  isFetchingNextPage={escopoQuery.isFetchingNextPage}
                  sort={sort}
                  onSortChange={setSort}
                />
                {escopoQuery.hasNextPage && (
                  <div ref={loadMoreRef} className="min-h-[24px]" aria-hidden />
                )}
              </div>
            )}
          </>
        )}
      </CardContent>

      <EscopoDuplicarCasosModal
        open={isDuplicarModalOpen}
        onOpenChange={setIsDuplicarModalOpen}
        cronogramaOrigem={projetoId}
        setorProjeto={setorProjeto}
        isSubmitting={transferirProximoProjeto.isPending}
        onConfirm={handleDuplicarCasos}
      />
    </Card>
  );
}
