"use client";

import { FilterX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { ReportsFiltros } from "./filtros/reports-filtros";
import { ReportsLista } from "./lista/reports-lista";
import { ReportAprovarModal } from "./modais/report-aprovar-modal";
import { ReportAcaoAnotacaoModal } from "./modais/report-acao-anotacao-modal";
import { AbrirOcorrenciaModal } from "@/components/casos/edicao/abrir-ocorrencia-modal";
import { ReportsSortToggle } from "./layout/reports-sort-toggle";
import { ReportsTotalizador } from "./layout/reports-totalizador";
import { useReportsFiltros } from "./hooks/use-reports-filtros";
import { useReportsFiltrosLocais } from "./hooks/use-reports-filtros-locais";
import { useReportsData } from "./hooks/use-reports-data";
import { useReportsAcoesModais } from "./hooks/use-reports-acoes-modais";
import { mapProjetoMemoriaToReportCard } from "./utils";

export function Reports() {
  const { filtrosAplicados, aplicarFiltros, limparFiltros } = useReportsFiltros();

  const {
    itens,
    totalCasos,
    isLoading,
    hasSetor,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
  } = useReportsData(filtrosAplicados);

  const locais = useReportsFiltrosLocais(itens);

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
    ocorrenciaAposIncompleto,
    fecharOcorrenciaAposIncompleto,
  } = useReportsAcoesModais();

  return (
    <ListagemPageLayout
      title="Reports"
      subtitle="Visualize e analise os reports abertos"
      actions={
        <Button
          variant="outline"
          type="button"
          className="w-full sm:w-auto px-4 flex-1 sm:flex-initial"
          onClick={() => {
            locais.limpar();
            limparFiltros();
          }}
        >
          <FilterX className="h-3.5 w-3.5" />
          Limpar filtros
        </Button>
      }
    >
      <ReportsFiltros
        filtrosAplicados={filtrosAplicados}
        onAplicar={aplicarFiltros}
        locais={locais}
        carregado={hasSetor && !isLoading}
      />

      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-4">
        <ReportsSortToggle sort={locais.sort} onChange={locais.setSort} />
        <ReportsTotalizador
          className="ml-auto min-w-0"
          exibindo={itens.length}
          total={totalCasos}
          hasSetor={hasSetor}
          isLoading={isLoading}
        />
      </div>

      <div className="flex flex-col">
        <ReportsLista
          grupos={locais.grupos}
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

      {ocorrenciaAposIncompleto ? (
        <AbrirOcorrenciaModal
          open
          onOpenChange={fecharOcorrenciaAposIncompleto}
          casoId={ocorrenciaAposIncompleto.casoId}
          clientes={ocorrenciaAposIncompleto.clientes}
          descricaoResumo={ocorrenciaAposIncompleto.descricaoResumo}
          ultimaAnotacaoTexto={ocorrenciaAposIncompleto.ultimaAnotacaoTexto}
          responsavelFeedbackNome={
            ocorrenciaAposIncompleto.responsavelFeedbackNome
          }
        />
      ) : null}
    </ListagemPageLayout>
  );
}
