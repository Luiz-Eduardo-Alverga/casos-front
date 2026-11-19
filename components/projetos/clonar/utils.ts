import type { SgpCadastroData } from "@/interfaces/sgp-cadastro";
import { parseSgpDateToDate } from "@/components/projetos/cadastro/utils";
import {
  NOME_PROJETO_MAX,
  type ProjetoClonarFormInput,
} from "@/components/projetos/clonar/schema";

const MS_POR_DIA = 24 * 60 * 60 * 1000;

function diaUtc(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function somarDias(date: Date, dias: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dias);
}

/** Duração em dias com contagem inclusiva; `null` quando as datas não fecham. */
export function duracaoEmDias(
  inicio: Date | undefined,
  fim: Date | undefined,
): number | null {
  if (!inicio || !fim) return null;
  const diff = Math.round((diaUtc(fim) - diaUtc(inicio)) / MS_POR_DIA);
  return diff < 0 ? null : diff + 1;
}

export function nomeClonePadrao(nome: string | null | undefined): string {
  return `${(nome ?? "").trim()} - Clone`.slice(0, NOME_PROJETO_MAX);
}

export function inicioOrigem(origem: SgpCadastroData): Date | undefined {
  return (
    parseSgpDateToDate(origem.data_inicio) ?? parseSgpDateToDate(origem.datas)
  );
}

export function fimOrigem(origem: SgpCadastroData): Date | undefined {
  return (
    parseSgpDateToDate(origem.data_fim) ??
    parseSgpDateToDate(origem.data_desativado)
  );
}

/**
 * Padrões do clone (decisão #3): nome "… - Clone", início no dia seguinte ao fim da origem e
 * fim mantendo a mesma duração. Sem fim na origem, as datas ficam vazias.
 */
export function valoresPadraoClone(
  origem: SgpCadastroData,
): ProjetoClonarFormInput {
  const nomeProjeto = nomeClonePadrao(origem.nome_projeto);
  const fim = fimOrigem(origem);
  if (!fim) return { nomeProjeto };

  const dataInicio = somarDias(fim, 1);
  const duracao = duracaoEmDias(inicioOrigem(origem), fim);
  const dataFim = duracao ? somarDias(dataInicio, duracao - 1) : undefined;
  return { nomeProjeto, dataInicio, dataFim };
}

export function textoDuracao(dias: number | null): string {
  if (dias == null) return "—";
  return dias === 1 ? "1 dia" : `${dias} dias`;
}
