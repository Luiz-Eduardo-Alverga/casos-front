import type { ReportCreateFormData } from "./schema";

export interface BuildReportPayloadArgs {
  data: ReportCreateFormData;
  userId?: string | number | null;
}

export function buildReportCreatePayload({
  data,
  userId,
}: BuildReportPayloadArgs) {
  const categoriaTipo = (data.categoriaTipoLabel || "").trim().toUpperCase();

  return {
    Projeto: Number(data.produto),
    VersaoProduto: categoriaTipo,
    Prioridade: Number(data.importancia),
    Cronograma_id: 2970,
    Modulo: "",
    Id_Origem: "16",
    Categoria: Number(data.categoria),
    Relator: Number(userId ?? 0),
    AtribuidoPara: Number(data.reportAnaliseUsuarioId),
    atribuido_qa: 0,
    DescricaoResumo: data.DescricaoResumo || "",
    DescricaoCompleta: (data.DescricaoCompleta || "").replace(/\r?\n/g, "\r\n"),
    InformacoesAdicionais: "",
    status: "1",
    Id_Usuario_AberturaCaso: String(userId ?? ""),
    NaoPlanejado: 1,
    report_analise_aprovado: 0,
    report_analise_status: 0,
    report_data_escalonamento: new Date().toISOString(),
    tipo_abertura: "REPORT",
    report_responsavel_suporte_id: Number(data.reportResponsavelSuporteId),
    report_prioridade: Number(data.importancia),
    report_ocorrencia_id: data.reportOcorrenciaInicial?.trim()
      ? Number.isNaN(Number(data.reportOcorrenciaInicial))
        ? null
        : Number(data.reportOcorrenciaInicial)
      : null,
  };
}
