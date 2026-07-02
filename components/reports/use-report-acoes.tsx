"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getUser } from "@/lib/auth";
import { useUpdateCaso } from "@/hooks/casos/use-update-caso";
import type { UpdateCasoRequest } from "@/services/projeto-casos/update";
import {
  nowSaoPauloToApiDateTime,
  getReportStatusFallbackPorVersao,
  CASO_STATUS_INCOMPLETO_ID,
  CASO_STATUS_SUSPENSO_ID,
} from "@/components/casos/edicao/report-analise-modal/utils";
import { REPORT_DEV_631_ID } from "@/lib/report/apply-dev-631-form";

export interface AprovarReportParams {
  id: number | string;
  /** Label da versão selecionada (usado para decidir status 20 vs 22 e enviar VersaoProduto). */
  versaoLabel: string;
  projetoId: string;
  devId: string;
  modulo?: string;
  /** Status atual do caso (para reabrir quando estava Incompleto/Suspenso). */
  statusCasoAtual?: number;
}

function getUserIdOrToast(): string | null {
  const userId = getUser()?.id;
  if (userId == null || String(userId).trim() === "") {
    toast.error("Usuário não identificado. Faça login novamente.");
    return null;
  }
  return String(userId);
}

/**
 * Ações de análise de report para a listagem, reutilizando a mesma lógica e
 * rotinas do fluxo de edição (`report-analise-modal`): aprovar (20/22),
 * marcar incompleto (21) e suspender (23).
 */
export function useReportAcoes() {
  const queryClient = useQueryClient();
  const updateCaso = useUpdateCaso();

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["projeto-memoria"] });
  }, [queryClient]);

  const aprovar = useCallback(
    async ({
      id,
      versaoLabel,
      projetoId,
      devId,
      modulo,
      statusCasoAtual,
    }: AprovarReportParams) => {
      const userId = getUserIdOrToast();
      if (!userId) return;

      const reabrirCaso =
        statusCasoAtual === CASO_STATUS_INCOMPLETO_ID ||
        statusCasoAtual === CASO_STATUS_SUSPENSO_ID;

      const payload: UpdateCasoRequest = {
        report_analise_status: getReportStatusFallbackPorVersao(versaoLabel),
        report_analise_aprovado: true,
        report_analise_data_conclusao: nowSaoPauloToApiDateTime(),
        report_analise_usuario_id: userId,
        VersaoProduto: versaoLabel,
        Cronograma_id: Number(projetoId),
        AtribuidoPara: Number(devId),
        ...(modulo?.trim() ? { Modulo: modulo.trim() } : {}),
        ...(reabrirCaso ? { status: 1 } : {}),
      };

      try {
        await updateCaso.mutateAsync({ id, data: payload });
        toast.success("Report aprovado com sucesso.");
        invalidate();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao aprovar report.");
      }
    },
    [updateCaso, invalidate],
  );

  const marcarIncompleto = useCallback(
    async (id: number | string) => {
      const userId = getUserIdOrToast();
      if (!userId) return;

      const payload: UpdateCasoRequest = {
        status: CASO_STATUS_INCOMPLETO_ID,
        report_analise_status: "21",
        AtribuidoPara: Number(REPORT_DEV_631_ID),
        report_analise_aprovado: false,
        report_analise_data_conclusao: null,
        report_data_limite: null,
        report_analise_usuario_id: userId,
      };

      try {
        await updateCaso.mutateAsync({ id, data: payload });
        toast.success("Report marcado como incompleto.");
        invalidate();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Erro ao marcar report como incompleto.",
        );
      }
    },
    [updateCaso, invalidate],
  );

  const suspender = useCallback(
    async (id: number | string) => {
      const userId = getUserIdOrToast();
      if (!userId) return;

      const payload: UpdateCasoRequest = {
        status: CASO_STATUS_SUSPENSO_ID,
        report_analise_status: "23",
        report_analise_aprovado: true,
        report_analise_data_conclusao: nowSaoPauloToApiDateTime(),
        report_analise_usuario_id: userId,
      };

      try {
        await updateCaso.mutateAsync({ id, data: payload });
        toast.success("Report suspenso com sucesso.");
        invalidate();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao suspender report.");
      }
    },
    [updateCaso, invalidate],
  );

  return {
    aprovar,
    marcarIncompleto,
    suspender,
    isPending: updateCaso.isPending,
  };
}
