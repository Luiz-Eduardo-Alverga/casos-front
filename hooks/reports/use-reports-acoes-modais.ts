"use client";

import { useCallback, useState } from "react";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import {
  type ReportAcaoAnotacaoTipo,
} from "@/components/reports/report-acao-anotacao-modal";
import { useReportAcoes } from "@/components/reports/use-report-acoes";

type ReportAcaoModalState = {
  tipo: ReportAcaoAnotacaoTipo;
  item: ProjetoMemoriaItem;
} | null;

export function useReportsAcoesModais() {
  const { aprovar, marcarIncompletoComAnotacao, suspenderComAnotacao, isPending } =
    useReportAcoes();

  const [itemParaAprovar, setItemParaAprovar] =
    useState<ProjetoMemoriaItem | null>(null);
  const [aprovarModalOpen, setAprovarModalOpen] = useState(false);
  const [acaoModal, setAcaoModal] = useState<ReportAcaoModalState>(null);

  const handleAbrirAprovar = useCallback((item: ProjetoMemoriaItem) => {
    setItemParaAprovar(item);
    setAprovarModalOpen(true);
  }, []);

  const handleMarcarIncompleto = useCallback((item: ProjetoMemoriaItem) => {
    setAcaoModal({ tipo: "incompleto", item });
  }, []);

  const handleSuspender = useCallback((item: ProjetoMemoriaItem) => {
    setAcaoModal({ tipo: "suspender", item });
  }, []);

  const handleConfirmarAcaoComAnotacao = useCallback(
    async (anotacao: string) => {
      if (!acaoModal) return false;

      const casoId = acaoModal.item.caso.id;
      if (acaoModal.tipo === "incompleto") {
        return marcarIncompletoComAnotacao(casoId, anotacao);
      }
      return suspenderComAnotacao(casoId, anotacao);
    },
    [acaoModal, marcarIncompletoComAnotacao, suspenderComAnotacao],
  );

  const fecharAcaoModal = useCallback((open: boolean) => {
    if (!open) setAcaoModal(null);
  }, []);

  return {
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
  };
}
