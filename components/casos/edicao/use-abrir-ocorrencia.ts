"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useCreateTicket } from "@/hooks/tickets/use-create-ticket";
import { getUser } from "@/lib/auth";
import { getUsuarios } from "@/services/auxiliar/usuarios";
import type {
  AnotacaoCasoItem,
  ClienteCasoItem,
} from "@/interfaces/projeto-memoria";
import {
  buildCreateTicketPayload,
  findUsuarioIdByNome,
  getClienteIdsVinculados,
  getUltimaAnotacao,
} from "./abrir-ocorrencia-utils";

export interface UseAbrirOcorrenciaParams {
  casoId: number;
  clientes?: ClienteCasoItem[] | null;
  descricaoResumo?: string | null;
  anotacoes?: AnotacaoCasoItem[] | null;
  /** Texto da anotação a usar no motivo (ex.: recém-criada na listagem de reports). */
  ultimaAnotacaoTexto?: string | null;
  responsavelFeedbackNome?: string | null;
}

export function useAbrirOcorrencia({
  casoId,
  clientes,
  descricaoResumo,
  anotacoes,
  ultimaAnotacaoTexto,
  responsavelFeedbackNome,
}: UseAbrirOcorrenciaParams) {
  const createTicket = useCreateTicket();
  const [isPending, setIsPending] = useState(false);
  const [semClienteModal, setSemClienteModal] = useState(false);

  const abrir = useCallback(
    async (clienteIds?: number[]): Promise<boolean> => {
      const ids = clienteIds ?? getClienteIdsVinculados(clientes);
      if (ids.length === 0) {
        setSemClienteModal(true);
        return false;
      }

      const user = getUser();
      const atendente = user?.nome?.trim();
      if (!atendente) {
        toast.error("Usuário não autenticado.");
        return false;
      }

      const nomeFeedback = responsavelFeedbackNome?.trim();
      if (!nomeFeedback) {
        toast.error("Responsável de feedback não informado no caso.");
        return false;
      }

      const anotacaoTexto =
        ultimaAnotacaoTexto?.trim() ||
        getUltimaAnotacao(anotacoes)?.anotacoes ||
        null;

      setIsPending(true);
      let sucesso = 0;
      let falhas = 0;

      try {
        const usuarios = await getUsuarios({
          search: nomeFeedback,
          somente_projetos: false,
        });
        const suporte = findUsuarioIdByNome(usuarios, nomeFeedback);
        if (suporte == null) {
          toast.error(
            `Usuário "${nomeFeedback}" não encontrado para preencher o suporte.`,
          );
          return false;
        }

        for (const clienteId of ids) {
          try {
            await createTicket.mutateAsync(
              buildCreateTicketPayload({
                clienteId,
                casoId,
                descricaoResumo,
                ultimaAnotacaoTexto: anotacaoTexto,
                atendente,
                suporteId: suporte,
              }),
            );
            sucesso += 1;
          } catch {
            falhas += 1;
          }
        }

        if (falhas === 0) {
          toast.success(
            sucesso === 1
              ? "Ocorrência aberta com sucesso."
              : `${sucesso} ocorrências abertas com sucesso.`,
          );
        } else if (sucesso === 0) {
          toast.error("Não foi possível abrir a ocorrência.");
        } else {
          toast.error(
            `${sucesso} ocorrência(s) aberta(s), ${falhas} falha(s).`,
          );
        }

        return sucesso > 0;
      } catch (e) {
        toast.error(
          e instanceof Error
            ? e.message
            : "Erro ao buscar usuário do responsável de feedback.",
        );
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [
      anotacoes,
      casoId,
      clientes,
      createTicket,
      descricaoResumo,
      responsavelFeedbackNome,
      ultimaAnotacaoTexto,
    ],
  );

  return {
    abrir,
    isPending: isPending || createTicket.isPending,
    semClienteModal,
    setSemClienteModal,
  };
}
