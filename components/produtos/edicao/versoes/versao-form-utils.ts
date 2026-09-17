import { parseOptionalId } from "@/components/produtos/cadastro/utils";
import {
  fromDateInput,
  toDateInput,
} from "@/components/produtos/edicao/versoes/utils";
import type { VersaoFormData } from "@/components/produtos/edicao/versoes/versao-form-schema";
import type {
  ProdutoVersaoData,
  ProdutoVersaoPayload,
} from "@/services/produtos/types";

export function versaoToFormValues(versao: ProdutoVersaoData): VersaoFormData {
  const status =
    versao.Status?.trim().toUpperCase() === "FECHADO" ? "FECHADO" : "ABERTO";
  const testadorId = versao.testador_id;
  return {
    versao: versao.Versao ?? "",
    status,
    abertura: toDateInput(versao.DataAberturaProjeto),
    fechamento: toDateInput(versao.DataFechamentoProjeto),
    testadorId: testadorId != null && testadorId > 0 ? String(testadorId) : "",
    notas: versao.NotasdaVersao ?? "",
    helptools: Boolean(versao.Helptools),
    estacionamentoIdeias: Boolean(versao.estacionamento_ideias),
  };
}

export function buildCreateVersaoPayload(
  data: VersaoFormData,
): ProdutoVersaoPayload {
  return {
    Versao: data.versao.trim(),
    DataAberturaProjeto: fromDateInput(data.abertura) ?? `${data.abertura.trim()} 00:00:00`,
    DataFechamentoProjeto: fromDateInput(data.fechamento),
    Status: data.status,
    Helptools: data.helptools,
    estacionamento_ideias: data.estacionamentoIdeias,
    testador_id: parseOptionalId(data.testadorId),
    NotasdaVersao: data.notas?.trim() || null,
    HomemDiaHora: null,
    VersaoBanco: null,
    VersaoBancoMesas: null,
  };
}

export function buildUpdateVersaoPayload(
  data: VersaoFormData,
  existing: ProdutoVersaoData,
): ProdutoVersaoPayload & {
  Registro: number;
  DataVersao: string;
} {
  return {
    Registro: existing.Registro,
    DataVersao: existing.DataVersao,
    Versao: data.versao.trim(),
    DataAberturaProjeto: fromDateInput(data.abertura) ?? existing.DataAberturaProjeto,
    DataFechamentoProjeto: fromDateInput(data.fechamento),
    MostrarPlanejamento: existing.MostrarPlanejamento,
    Status: data.status,
    Release: existing.Release,
    HomemDiaHora: existing.HomemDiaHora,
    NotasdaVersao: data.notas?.trim() || null,
    VersaoBanco: existing.VersaoBanco,
    Helptools: data.helptools,
    VersaoBancoMesas: existing.VersaoBancoMesas,
    testador_id: parseOptionalId(data.testadorId),
    estacionamento_ideias: data.estacionamentoIdeias,
  };
}

export function versaoToPayload(
  versao: ProdutoVersaoData,
): ProdutoVersaoPayload & { Registro: number; DataVersao: string } {
  const { Sequencia: _sequencia, ...rest } = versao;
  return rest;
}

export function buildToggleVersaoStatusPayload(
  existing: ProdutoVersaoData,
  next: { status: "ABERTO" | "FECHADO"; fechamento?: string },
): ProdutoVersaoPayload & { Registro: number; DataVersao: string } {
  return {
    ...versaoToPayload(existing),
    Status: next.status,
    DataFechamentoProjeto:
      next.fechamento !== undefined
        ? fromDateInput(next.fechamento)
        : existing.DataFechamentoProjeto,
  };
}
