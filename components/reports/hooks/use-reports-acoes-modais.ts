"use client";

import { useCallback, useState } from "react";
import type {
  ClienteCasoItem,
  ProjetoMemoriaItem,
} from "@/interfaces/projeto-memoria";
import { getProjetoMemoriaById } from "@/services/projeto-memoria/get-projeto-memoria";
import {
  type ReportAcaoAnotacaoTipo,
} from "../modais/report-acao-anotacao-modal";
import { useReportAcoes } from "./use-report-acoes";

type ReportAcaoModalState = {
  tipo: ReportAcaoAnotacaoTipo;
  item: ProjetoMemoriaItem;
} | null;

export type OcorrenciaAposIncompletoState = {
  casoId: number;
  clientes: ClienteCasoItem[];
  descricaoResumo: string | null;
  ultimaAnotacaoTexto: string;
  responsavelFeedbackNome: string | null;
} | null;

async function resolveClientesDoCaso(
  item: ProjetoMemoriaItem,
): Promise<ClienteCasoItem[]> {
  const lista = item.caso.clientes;
  if (Array.isArray(lista) && lista.length > 0) {
    return lista;
  }

  const qtd = item.caso.qtd_clientes_vinculados ?? 0;
  if (Array.isArray(lista) && lista.length === 0 && qtd === 0) {
    return [];
  }

  try {
    const res = await getProjetoMemoriaById(item.caso.id);
    return res.data?.caso?.clientes ?? [];
  } catch {
    return Array.isArray(lista) ? lista : [];
  }
}

export function useReportsAcoesModais() {
  const { aprovar, marcarIncompletoComAnotacao, suspenderComAnotacao, isPending } =
    useReportAcoes();

  const [itemParaAprovar, setItemParaAprovar] =
    useState<ProjetoMemoriaItem | null>(null);
  const [aprovarModalOpen, setAprovarModalOpen] = useState(false);
  const [acaoModal, setAcaoModal] = useState<ReportAcaoModalState>(null);
  const [ocorrenciaAposIncompleto, setOcorrenciaAposIncompleto] =
    useState<OcorrenciaAposIncompletoState>(null);
  const [resolvendoOcorrencia, setResolvendoOcorrencia] = useState(false);

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
        setResolvendoOcorrencia(true);
        try {
          const ok = await marcarIncompletoComAnotacao(casoId, anotacao);
          if (!ok) return false;

          const clientes = await resolveClientesDoCaso(acaoModal.item);
          setOcorrenciaAposIncompleto({
            casoId,
            clientes,
            descricaoResumo:
              acaoModal.item.caso.textos?.descricao_resumo ?? null,
            ultimaAnotacaoTexto: anotacao,
            responsavelFeedbackNome:
              acaoModal.item.report?.responsavel_feedback_nome ?? null,
          });
          return true;
        } finally {
          setResolvendoOcorrencia(false);
        }
      }
      return suspenderComAnotacao(casoId, anotacao);
    },
    [acaoModal, marcarIncompletoComAnotacao, suspenderComAnotacao],
  );

  const fecharAcaoModal = useCallback((open: boolean) => {
    if (!open) setAcaoModal(null);
  }, []);

  const fecharOcorrenciaAposIncompleto = useCallback((open: boolean) => {
    if (!open) setOcorrenciaAposIncompleto(null);
  }, []);

  return {
    aprovar,
    isPending: isPending || resolvendoOcorrencia,
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
  };
}
