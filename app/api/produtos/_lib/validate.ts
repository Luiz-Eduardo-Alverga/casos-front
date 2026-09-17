import type {
  CreateProdutoChecklistRequest,
  CreateProdutoModuloRequest,
  CreateProdutoRequest,
  CreateProdutoScriptRequest,
  CreateProdutoVersaoRequest,
  UpdateProdutoModuloRequest,
} from "@/services/produtos/types";
import { jsonError } from "./proxy";

export function validateProdutoWriteBody(
  body: CreateProdutoRequest,
): Response | null {
  const requiredStrings: Array<keyof CreateProdutoRequest> = [
    "DataProjeto",
    "NomeProjeto",
    "PO",
    "ScrumMaster",
    "Setor",
    "Responsavel_Suporte",
    "Responsavel_Parametrizacao",
  ];

  for (const field of requiredStrings) {
    const value = body?.[field];
    if (typeof value !== "string" || !value.trim()) {
      return jsonError(`${String(field)} é obrigatório`, 400);
    }
  }

  const requiredBooleans: Array<keyof CreateProdutoRequest> = [
    "Desativado",
    "MostrarConsulta",
    "MostrarTeste",
    "FAQExibir",
    "CalcularBurnDown",
  ];

  for (const field of requiredBooleans) {
    if (typeof body?.[field] !== "boolean") {
      return jsonError(`${String(field)} é obrigatório`, 400);
    }
  }

  if (typeof body?.vacaLeiteira !== "number") {
    return jsonError("vacaLeiteira é obrigatório", 400);
  }

  return null;
}

export function validateProdutoVersaoWriteBody(
  body: CreateProdutoVersaoRequest,
): Response | null {
  if (body?.Registro == null || Number.isNaN(Number(body.Registro))) {
    return jsonError("Registro é obrigatório", 400);
  }
  if (typeof body?.DataVersao !== "string" || !body.DataVersao.trim()) {
    return jsonError("DataVersao é obrigatório", 400);
  }
  if (typeof body?.Versao !== "string" || !body.Versao.trim()) {
    return jsonError("Versao é obrigatório", 400);
  }
  if (
    typeof body?.DataAberturaProjeto !== "string" ||
    !body.DataAberturaProjeto.trim()
  ) {
    return jsonError("DataAberturaProjeto é obrigatório", 400);
  }
  if (typeof body?.Status !== "string" || !body.Status.trim()) {
    return jsonError("Status é obrigatório", 400);
  }
  if (typeof body?.Release !== "number") {
    return jsonError("Release é obrigatório", 400);
  }
  if (typeof body?.MostrarPlanejamento !== "boolean") {
    return jsonError("MostrarPlanejamento é obrigatório", 400);
  }
  if (typeof body?.Helptools !== "boolean") {
    return jsonError("Helptools é obrigatório", 400);
  }
  if (typeof body?.estacionamento_ideias !== "boolean") {
    return jsonError("estacionamento_ideias é obrigatório", 400);
  }
  return null;
}

export function validateProdutoModuloWriteBody(
  body: UpdateProdutoModuloRequest,
): Response | null {
  if (body?.Registro == null || Number.isNaN(Number(body.Registro))) {
    return jsonError("Registro é obrigatório", 400);
  }
  if (typeof body?.NomeModulo !== "string" || !body.NomeModulo.trim()) {
    return jsonError("NomeModulo é obrigatório", 400);
  }
  return null;
}

export function validateCreateProdutoModuloBody(
  body: CreateProdutoModuloRequest,
): Response | null {
  const baseError = validateProdutoModuloWriteBody(body);
  if (baseError) return baseError;

  if (typeof body?.Versionado !== "boolean") {
    return jsonError("Versionado é obrigatório", 400);
  }
  if (typeof body?.Atualizador !== "boolean") {
    return jsonError("Atualizador é obrigatório", 400);
  }
  return null;
}

export function validateProdutoChecklistWriteBody(
  body: CreateProdutoChecklistRequest,
): Response | null {
  if (
    body?.Projeto_Versoes_ID == null ||
    Number.isNaN(Number(body.Projeto_Versoes_ID))
  ) {
    return jsonError("Projeto_Versoes_ID é obrigatório", 400);
  }
  if (typeof body?.DescricaoItem !== "string" || !body.DescricaoItem.trim()) {
    return jsonError("DescricaoItem é obrigatório", 400);
  }
  if (typeof body?.Ordenacao !== "number") {
    return jsonError("Ordenacao é obrigatório", 400);
  }
  return null;
}

export function validateProdutoScriptWriteBody(
  body: CreateProdutoScriptRequest,
): Response | null {
  if (
    body?.projetoVersoes_id == null ||
    Number.isNaN(Number(body.projetoVersoes_id))
  ) {
    return jsonError("projetoVersoes_id é obrigatório", 400);
  }
  if (typeof body?.descricao !== "string" || !body.descricao.trim()) {
    return jsonError("descricao é obrigatório", 400);
  }
  if (typeof body?.procedimento !== "string" || !body.procedimento.trim()) {
    return jsonError("procedimento é obrigatório", 400);
  }
  return null;
}
