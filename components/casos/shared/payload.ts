import type { UpdateCasoRequest } from "@/services/projeto-casos/update";
import type { Versao } from "@/services/auxiliar/versoes";
import { resolveVersaoProdutoForApi } from "@/components/casos/shared/versao-combobox";

/**
 * Campos comuns enviados em criação e atualização de caso/report.
 * Mantém apenas o que existe em ambos os formulários.
 */
export interface CasoBaseFormInput {
  produto: string;
  importancia: string;
  modulo?: string;
  categoria: string;
  devAtribuido: string;
  versao: string;
  projeto: string;
  origem: string;
  relator: string;
  qaAtribuido?: string;
  DescricaoResumo: string;
  DescricaoCompleta: string;
  InformacoesAdicionais?: string;
  Anexo?: string;
}

/**
 * Extrai a "versão crua" do valor selecionado no combobox de versão
 * (ex.: "12-1.2.3" -> "1.2.3", "1.2.3" -> "1.2.3").
 */
export function extractVersaoProduto(
  versao: string | undefined | null,
): string {
  const raw = String(versao ?? "");
  if (!raw) return "";
  const parts = raw.split("-");
  if (parts.length > 1) {
    const cauda = parts.slice(1).join("-").trim();
    return cauda || raw;
  }
  return raw;
}

export interface BuildCasoBasePayloadOptions {
  /** Catálogo de versões do produto — resolve sequencia → texto para a API. */
  versoes?: Versao[] | null;
}

/**
 * Monta os campos comuns CASO/REPORT (sem status, sem flags de criação
 * e sem campos de report). É a base reaproveitada por create e update.
 */
export function buildCasoBasePayload(
  data: CasoBaseFormInput,
  options?: BuildCasoBasePayloadOptions,
) {
  return {
    Prioridade: Number(data.importancia),
    Categoria: Number(data.categoria),
    Relator: Number(data.relator),
    AtribuidoPara: Number(data.devAtribuido),
    atribuido_qa: Number(data.qaAtribuido),
    Modulo: data.modulo || "",
    VersaoProduto: resolveVersaoProdutoForApi(data.versao, options?.versoes),
    Cronograma_id: Number(data.projeto),
    Id_Origem: Number(data.origem),
    DescricaoResumo: data.DescricaoResumo || "",
    DescricaoCompleta: (data.DescricaoCompleta || "").replace(/\r?\n/g, "\r\n"),
    InformacoesAdicionais: data.InformacoesAdicionais || "",
    Anexo: data.Anexo || "",
  };
}

export interface BuildCasoCreatePayloadArgs {
  data: CasoBaseFormInput;
  naoPlanejado: boolean;
  userId?: string | number | null;
  versoes?: Versao[] | null;
}

/**
 * Payload da API de criação de caso. Mantém compatibilidade com o
 * formato esperado pelo endpoint atual (Projeto, status string, etc.).
 */
export function buildCasoCreatePayload({
  data,
  naoPlanejado,
  userId,
  versoes,
}: BuildCasoCreatePayloadArgs) {
  const base = buildCasoBasePayload(data, { versoes });
  return {
    Projeto: Number(data.produto),
    VersaoProduto: base.VersaoProduto,
    Prioridade: base.Prioridade,
    Cronograma_id: base.Cronograma_id,
    Modulo: base.Modulo,
    Id_Origem: data.origem || "",
    Categoria: base.Categoria,
    Relator: base.Relator,
    AtribuidoPara: base.AtribuidoPara,
    atribuido_qa: base.atribuido_qa,
    DescricaoResumo: base.DescricaoResumo,
    DescricaoCompleta: base.DescricaoCompleta,
    InformacoesAdicionais: base.InformacoesAdicionais,
    status: "1",
    Id_Usuario_AberturaCaso: String(userId ?? ""),
    NaoPlanejado: naoPlanejado ? 1 : 0,
  };
}

export interface CasoUpdateReportFields {
  /** Equivale a report_analise_aprovado. Quando undefined, não é incluído no PATCH. */
  aprovado?: boolean;
  /** Novo status do report. Quando undefined, não é incluído no PATCH. */
  analiseStatus?: string;
  /** Data de conclusão da análise. Quando undefined, não é incluído. */
  analiseDataConclusao?: string | null;
  /** Nova data limite do report. Quando undefined, não é incluído. */
  dataLimite?: string | null;
  /** Usuário da análise. Quando undefined, não é incluído no PATCH. */
  reportAnaliseUsuarioId?: string;
}

export interface BuildCasoUpdatePayloadArgs {
  data: CasoBaseFormInput;
  isReport: boolean;
  statusCasoFinal: number;
  reportFields?: CasoUpdateReportFields;
  versoes?: Versao[] | null;
}

/**
 * Monta o payload PATCH para atualização de caso/report.
 *
 * Importante: quando `isReport === false`, nenhum campo `report_*`
 * é enviado, mesmo que `reportFields` tenha sido informado.
 */
export function buildCasoUpdatePayload({
  data,
  isReport,
  statusCasoFinal,
  reportFields,
  versoes,
}: BuildCasoUpdatePayloadArgs): UpdateCasoRequest {
  const base = buildCasoBasePayload(data, { versoes });

  const payload: UpdateCasoRequest = {
    Projeto: Number(data.produto),
    DescricaoResumo: base.DescricaoResumo,
    DescricaoCompleta: base.DescricaoCompleta,
    InformacoesAdicionais: base.InformacoesAdicionais || undefined,
    Anexo: base.Anexo || undefined,
    Prioridade: base.Prioridade,
    Categoria: base.Categoria,
    Relator: base.Relator,
    AtribuidoPara: base.AtribuidoPara,
    Modulo: base.Modulo,
    VersaoProduto: base.VersaoProduto,
    Cronograma_id: base.Cronograma_id,
    Id_Origem: base.Id_Origem,
    status: statusCasoFinal,
    atribuido_qa: base.atribuido_qa,
  };

  if (isReport && reportFields) {
    if (reportFields.aprovado !== undefined) {
      payload.report_analise_aprovado = reportFields.aprovado;
    }
    if (reportFields.reportAnaliseUsuarioId !== undefined) {
      payload.report_analise_usuario_id = reportFields.reportAnaliseUsuarioId;
    }
    if (reportFields.analiseStatus !== undefined) {
      payload.report_analise_status = reportFields.analiseStatus;
    }
    if (reportFields.analiseDataConclusao !== undefined) {
      payload.report_analise_data_conclusao = reportFields.analiseDataConclusao;
    }
    if (reportFields.dataLimite !== undefined) {
      payload.report_data_limite = reportFields.dataLimite;
    }
  }

  return payload;
}
