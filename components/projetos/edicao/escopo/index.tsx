"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeftRight, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/painel/empty-state";
import { useProjetoMemoria } from "@/hooks/casos/use-projeto-memoria";
import { useEscopoFiltros } from "@/hooks/projetos/use-escopo-filtros";
import { useBulkUpdateCasos } from "@/hooks/casos/use-bulk-update-casos";
import { ProjetosTabelaTable } from "@/components/projetos/tabela/projetos-tabela-table";
import type { ProjetoMemoriaSortState } from "@/components/projetos/tabela/projeto-memoria-sort";
import { EscopoSummaryCards } from "@/components/projetos/edicao/escopo/escopo-summary-cards";
import { EscopoFiltrosBar } from "@/components/projetos/edicao/escopo/escopo-filtros-bar";
import { AbaEscopoSkeleton } from "@/components/projetos/edicao/escopo/aba-escopo-skeleton";
import { EscopoContentSkeleton } from "@/components/projetos/edicao/escopo/escopo-content-skeleton";
import { CasosTransferenciaModal } from "@/components/casos/transferencia/casos-transferencia-modal";
import { buildBulkTransferPayload } from "@/components/casos/transferencia/utils";
import type { CasosTransferenciaFormValues } from "@/components/casos/transferencia/types";
import { getVersoesQueryKey } from "@/components/casos/shared/versao-combobox";
import type { Versao } from "@/services/auxiliar/versoes";
import { hasEscopoFiltersApplied } from "@/components/projetos/edicao/escopo/escopo-filtros-mappers";
import {
  buildEscopoMemoriaParams,
  mapProjetoMemoriaToTabelaRow,
} from "@/components/projetos/edicao/escopo/utils";

export interface AbaEscopoProps {
  projetoId: number | string;
  enabled?: boolean;
}

export function AbaEscopo({ projetoId, enabled = true }: AbaEscopoProps) {
  const queryClient = useQueryClient();
  const bulkUpdateCasos = useBulkUpdateCasos();

  const {
    filtrosAplicados,
    setStatusIds,
    setUsuarioDevId,
    setNaoPlanejadoFiltro,
  } = useEscopoFiltros();

  const { statusIds, usuarioDevId, naoPlanejadoFiltro } = filtrosAplicados;

  const [sort, setSort] = useState<ProjetoMemoriaSortState>({});

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

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] =
    useState(false);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleDevChange = useCallback(
    (devId: string) => {
      setUsuarioDevId(devId);
    },
    [setUsuarioDevId],
  );

  const handleToggleItem = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((selectedId) => selectedId !== id);
    });
  }, []);

  const handleToggleAll = useCallback(
    (checked: boolean) => {
      if (!checked) {
        setSelectedIds([]);
        return;
      }
      setSelectedIds(itens.map((item) => item.id));
    },
    [itens],
  );

  const produtoIdPadrao = useMemo(() => {
    const firstSelected = itens.find((item) => selectedIds.includes(item.id));
    return firstSelected?.produtoId;
  }, [itens, selectedIds]);

  const handleTransferirCasos = useCallback(
    async (values: CasosTransferenciaFormValues) => {
      const idsSelecionados = selectedIds;
      if (idsSelecionados.length === 0) {
        toast.error("Selecione ao menos um caso para transferir.");
        return;
      }

      const produtoId = String(produtoIdPadrao ?? "").trim();
      const versoes = produtoId
        ? queryClient.getQueryData<Versao[]>(
            getVersoesQueryKey(produtoId, "", false),
          )
        : undefined;
      const payload = buildBulkTransferPayload(
        idsSelecionados,
        values,
        versoes,
      );
      if (!payload) {
        toast.error("Preencha ao menos um campo para transferir.");
        return;
      }

      await bulkUpdateCasos.mutateAsync(payload);
      toast.success("Casos transferidos com sucesso.");
      setSelectedIds([]);
      setIsTransferenciaModalOpen(false);
    },
    [selectedIds, produtoIdPadrao, queryClient, bulkUpdateCasos],
  );

  const isAtualizandoEscopo = isFetching && !isFetchingNextPage;

  useEffect(() => {
    if (itens.length === 0) {
      setSelectedIds([]);
      return;
    }
    const idsAtuais = new Set(itens.map((item) => item.id));
    setSelectedIds((prev) => prev.filter((id) => idsAtuais.has(id)));
  }, [itens]);

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
              <div className="flex flex-col  items-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsTransferenciaModalOpen(true)}
                  disabled={selectedIds.length === 0}
                  className=""
                >
                  <ArrowLeftRight className="h-3.5 w-3.5 text-text-primary" />
                  {selectedIds.length > 0
                    ? `Transferir casos (${selectedIds.length})`
                    : "Transferir casos"}
                </Button>
                <ProjetosTabelaTable
                  variant="escopo"
                  itens={itens}
                  isFetchingNextPage={escopoQuery.isFetchingNextPage}
                  showCheckbox
                  selectedIds={selectedIds}
                  onToggleItem={handleToggleItem}
                  onToggleAll={handleToggleAll}
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

      <CasosTransferenciaModal
        open={isTransferenciaModalOpen}
        onOpenChange={setIsTransferenciaModalOpen}
        totalSelecionados={selectedIds.length}
        produtoIdPadrao={produtoIdPadrao}
        isSubmitting={bulkUpdateCasos.isPending}
        onSubmit={handleTransferirCasos}
      />
    </Card>
  );
}
