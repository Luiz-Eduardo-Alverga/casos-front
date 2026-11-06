"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { /* ArrowLeftRight, */ FilterX } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { ListagemPageLayout } from "@/components/layout/listagem-page-layout";
import { CasosTransferenciaModal } from "@/components/casos/transferencia/casos-transferencia-modal";
import { buildBulkTransferPayload } from "@/components/casos/transferencia/utils";
import type { CasosTransferenciaFormValues } from "@/components/casos/transferencia/types";
import { getVersoesQueryKey } from "@/components/casos/shared/versao-combobox";
import { useBulkUpdateCasos } from "@/hooks/casos/use-bulk-update-casos";
import type { Versao } from "@/services/auxiliar/versoes";
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
  const queryClient = useQueryClient();
  const bulkUpdateCasos = useBulkUpdateCasos();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [transferenciaAberta, setTransferenciaAberta] = useState(false);

  const idsVisiveis = useMemo(
    () =>
      locais.grupos.flatMap((grupo) =>
        grupo.itens.map((item) => String(item.caso.id)),
      ),
    [locais.grupos],
  );

  useEffect(() => {
    const atuais = new Set(idsVisiveis);
    setSelectedIds((prev) => prev.filter((id) => atuais.has(id)));
  }, [idsVisiveis]);

  const produtoIdPadrao = useMemo(() => {
    const filtro = filtrosAplicados.produto?.trim();
    if (filtro) return filtro;

    const selecionados = new Set(selectedIds);
    const produtos = new Set<string>();
    for (const grupo of locais.grupos) {
      for (const item of grupo.itens) {
        if (!selecionados.has(String(item.caso.id))) continue;
        if (item.produto?.id != null) produtos.add(String(item.produto.id));
      }
    }
    return produtos.size === 1 ? [...produtos][0] : undefined;
  }, [filtrosAplicados.produto, locais.grupos, selectedIds]);

  const handleToggleItem = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((selectedId) => selectedId !== id);
    });
  };

  const handleTransferirCasos = async (values: CasosTransferenciaFormValues) => {
    if (selectedIds.length === 0) {
      toast.error("Selecione ao menos um caso para transferir.");
      return;
    }

    const produtoId = String(produtoIdPadrao ?? "").trim();
    const versoes = produtoId
      ? queryClient.getQueryData<Versao[]>(getVersoesQueryKey(produtoId, "", false))
      : undefined;
    const payload = buildBulkTransferPayload(selectedIds, values, versoes);
    if (!payload) {
      toast.error("Preencha ao menos um campo para transferir.");
      return;
    }

    await bulkUpdateCasos.mutateAsync(payload);
    toast.success("Casos transferidos com sucesso.");
    setSelectedIds([]);
    setTransferenciaAberta(false);
  };

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
        {/* <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          disabled={selectedIds.length === 0}
          onClick={() => setTransferenciaAberta(true)}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {selectedIds.length > 0
            ? `Transferir casos (${selectedIds.length})`
            : "Transferir casos"}
        </Button> */}
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
          selectedIds={selectedIds}
          onToggleItem={handleToggleItem}
          onAprovar={handleAbrirAprovar}
          onMarcarIncompleto={handleMarcarIncompleto}
          onSuspender={handleSuspender}
        />
      </div>

      <CasosTransferenciaModal
        open={transferenciaAberta}
        onOpenChange={setTransferenciaAberta}
        totalSelecionados={selectedIds.length}
        produtoIdPadrao={produtoIdPadrao}
        isSubmitting={bulkUpdateCasos.isPending}
        onSubmit={handleTransferirCasos}
      />

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
