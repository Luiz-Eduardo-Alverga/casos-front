"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSgpStake } from "@/services/sgp-stakes/create-sgp-stake";
import { updateSgpStake } from "@/services/sgp-stakes/update-sgp-stake";
import { invalidateSgpStakesQueries } from "@/hooks/projetos/sgp-projeto-query-keys";
import type {
  CreateSgpStakeRequest,
  SgpStakeItem,
  UpdateSgpStakeRequest,
} from "@/interfaces/sgp-stake";

/** Uma linha do lote: `sequencia` presente = PUT, ausente = POST. */
export type ItemLoteStake =
  | { key: string; sequencia: null; payload: CreateSgpStakeRequest }
  | { key: string; sequencia: number; payload: UpdateSgpStakeRequest };

export interface ResultadoItemLoteStake {
  key: string;
  tipo: "novo" | "alterado";
  ok: boolean;
  /** Registro gravado devolvido pela API (quando `ok`). */
  data?: SgpStakeItem;
  /** Mensagem da API (quando falhou). */
  erro?: string;
}

export interface ResultadoLoteStakes {
  itens: ResultadoItemLoteStake[];
  novos: number;
  alterados: number;
  falhas: number;
}

/**
 * Salva stakeholders em lote (decisões #18 e #19): a API não tem endpoint em lote, então faz um
 * POST/PUT por linha, em sequência, sem parar na primeira falha. Invalida as listagens uma vez no
 * fim, mesmo com falha parcial (o que deu certo já está gravado).
 */
export function useSalvarStakesEmLote(projetoId: number | string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itens: ItemLoteStake[]): Promise<ResultadoLoteStakes> => {
      const resultados: ResultadoItemLoteStake[] = [];

      try {
        for (const item of itens) {
          const tipo = item.sequencia == null ? "novo" : "alterado";
          try {
            const response =
              item.sequencia == null
                ? await createSgpStake(item.payload)
                : await updateSgpStake(item.sequencia, item.payload);
            resultados.push({ key: item.key, tipo, ok: true, data: response.data });
          } catch (error) {
            resultados.push({
              key: item.key,
              tipo,
              ok: false,
              erro:
                error instanceof Error && error.message
                  ? error.message
                  : "Erro ao salvar stakeholder",
            });
          }
        }
      } finally {
        if (itens.length > 0) {
          await invalidateSgpStakesQueries(queryClient, projetoId);
        }
      }

      return {
        itens: resultados,
        novos: resultados.filter((r) => r.ok && r.tipo === "novo").length,
        alterados: resultados.filter((r) => r.ok && r.tipo === "alterado").length,
        falhas: resultados.filter((r) => !r.ok).length,
      };
    },
  });
}
