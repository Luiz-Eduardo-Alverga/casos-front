"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { ReportsFiltros } from "./reports-filtros";
import { ReportsLista } from "./reports-lista";
import { ReportsTabela } from "./reports-tabela";
import { ReportDetalhe } from "./report-detalhe";
import { ReportDetalheSkeleton } from "./report-detalhe-skeleton";
import { ReportAprovarModal } from "./report-aprovar-modal";
import { ReportAcaoAnotacaoModal } from "./report-acao-anotacao-modal";
import { ReportsViewToggle } from "./reports-view-toggle";
import { ReportsTotalizador } from "./reports-totalizador";
import { useReportsFiltros } from "@/hooks/reports/use-reports-filtros";
import { useReportsData } from "@/hooks/reports/use-reports-data";
import { useReportsAcoesModais } from "@/hooks/reports/use-reports-acoes-modais";
import { mapProjetoMemoriaToReportCard } from "./utils";
import type { ReportsViewMode } from "./types";
import {
  readReportsViewMode,
  writeReportsViewMode,
} from "@/lib/reports-view-mode-storage";
import { buildCasoEditHref } from "@/lib/caso-edit-layout";
import { useRouter } from "next/navigation";

export function Reports() {
  const router = useRouter();
  const { filtrosAplicados, aplicarFiltros, limparFiltros } =
    useReportsFiltros();

  const [viewMode, setViewMode] = useState<ReportsViewMode>("cards");
  const [viewModeReady, setViewModeReady] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const stored = readReportsViewMode();
    if (stored) setViewMode(stored);
    setViewModeReady(true);
  }, []);

  const handleViewModeChange = useCallback((mode: ReportsViewMode) => {
    setViewMode(mode);
    writeReportsViewMode(mode);
  }, []);

  const {
    itens,
    totalCasos,
    isLoading,
    hasSetor,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
    setScrollRoot,
  } = useReportsData(filtrosAplicados);

  const {
    aprovar,
    isPending,
    itemParaAprovar,
    aprovarModalOpen,
    setAprovarModalOpen,
    acaoModal,
    handleAbrirAprovar,
    handleMarcarIncompleto,
    handleSuspender,
    handleConfirmarAcaoComAnotacao,
    fecharAcaoModal,
  } = useReportsAcoesModais();

  const selectedItem = useMemo(() => {
    if (selectedId == null) return null;
    const item = itens.find((i) => i.caso.id === selectedId);
    return item ? mapProjetoMemoriaToReportCard(item) : null;
  }, [itens, selectedId]);

  const selectedRawItem = useMemo(() => {
    if (selectedId == null) return null;
    return itens.find((i) => i.caso.id === selectedId) ?? null;
  }, [itens, selectedId]);

  useEffect(() => {
    if (!viewModeReady || viewMode !== "split") return;
    if (itens.length === 0) {
      setSelectedId(null);
      return;
    }
    const stillExists =
      selectedId != null && itens.some((i) => i.caso.id === selectedId);
    if (!stillExists) {
      setSelectedId(itens[0].caso.id);
    }
  }, [itens, selectedId, viewMode, viewModeReady]);

  const cardsScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      setScrollRoot(node);
    },
    [setScrollRoot],
  );

  const isSplit = viewMode === "split";

  return (
    <ListagemPageLayout
      title="Reports"
      subtitle="Visualize e analise os reports abertos"
      className="lg:min-h-0 lg:overflow-hidden lg:flex-1"
      actions={
        <Button
          variant="outline"
          type="button"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
          onClick={limparFiltros}
        >
          <FilterX className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      }
    >
      <ReportsFiltros
        filtrosAplicados={filtrosAplicados}
        onAplicar={aplicarFiltros}
      />

      <div className="mb-3 flex items-center justify-between gap-4 shrink-0">
        <ReportsViewToggle
          viewMode={viewMode}
          onChange={handleViewModeChange}
        />
        <ReportsTotalizador
          className="min-w-0"
          exibindo={itens.length}
          total={totalCasos}
          hasSetor={hasSetor}
          isLoading={isLoading}
        />
      </div>

      {isSplit ? (
        <div className="flex flex-col lg:flex-row gap-6 lg:flex-1 lg:min-h-0 lg:overflow-hidden">
          <div className="flex flex-col lg:w-1/2 lg:min-h-0 lg:overflow-hidden">
            <ReportsTabela
              itens={itens}
              isLoading={isLoading}
              hasSetor={hasSetor}
              hasNextPage={hasNextPage ?? false}
              isFetchingNextPage={isFetchingNextPage}
              selectedId={selectedId}
              onSelect={setSelectedId}
              loadMoreRef={loadMoreRef}
              setScrollRoot={setScrollRoot}
            />
          </div>
          <div className="flex flex-col lg:w-1/2 lg:min-h-0 lg:overflow-hidden">
            {isLoading && selectedId == null ? (
              <ReportDetalheSkeleton />
            ) : (
              <ReportDetalhe
                data={selectedItem}
                disabled={isPending}
                onAprovar={() => {
                  if (selectedRawItem) handleAbrirAprovar(selectedRawItem);
                }}
                onMarcarIncompleto={() => {
                  if (selectedRawItem) handleMarcarIncompleto(selectedRawItem);
                }}
                onSuspender={() => {
                  if (selectedRawItem) handleSuspender(selectedRawItem);
                }}
                onVerCaso={() => {
                  if (selectedItem) {
                    router.push(buildCasoEditHref(selectedItem.id, "case"));
                  }
                }}
              />
            )}
          </div>
        </div>
      ) : (
        <div
          ref={cardsScrollRef}
          className="flex flex-col lg:flex-1 lg:min-h-0 lg:overflow-y-auto"
        >
          <ReportsLista
            itens={itens}
            isLoading={isLoading}
            hasSetor={hasSetor}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            isPending={isPending}
            loadMoreRef={loadMoreRef}
            onAprovar={handleAbrirAprovar}
            onMarcarIncompleto={handleMarcarIncompleto}
            onSuspender={handleSuspender}
          />
        </div>
      )}

      <ReportAprovarModal
        open={aprovarModalOpen}
        onOpenChange={setAprovarModalOpen}
        item={itemParaAprovar}
        onAprovar={aprovar}
        isLoading={isPending}
      />

      <ReportAcaoAnotacaoModal
        open={acaoModal != null}
        onOpenChange={fecharAcaoModal}
        tipo={acaoModal?.tipo ?? "incompleto"}
        reportData={
          acaoModal ? mapProjetoMemoriaToReportCard(acaoModal.item) : null
        }
        onConfirm={handleConfirmarAcaoComAnotacao}
        isLoading={isPending}
      />
    </ListagemPageLayout>
  );
}
