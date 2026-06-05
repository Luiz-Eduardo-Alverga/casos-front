import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { Versao } from "@/services/auxiliar/versoes";
import { extractVersaoProduto } from "@/components/casos/shared/payload";
import { normalizeAnaliseStatusForForm } from "@/components/casos/edicao/report-analise-modal/utils";
import type { ReportEditFormData } from "./schema";

export function getReportEditDefaultValues(
  item: ProjetoMemoriaItem,
): ReportEditFormData {
  const { caso, produto, projeto } = item;
  const qaId = caso?.usuarios?.qa?.id;
  const qaAtribuido =
    qaId === 0 || qaId === "0" || qaId == null ? "" : String(qaId);

  return {
    produto: String(produto?.id ?? ""),
    categoria: String(caso?.caracteristicas?.categoria ?? ""),
    categoriaTipoLabel: caso?.caracteristicas?.tipo_categoria ?? "",
    importancia: String(caso?.caracteristicas?.prioridade ?? "3"),
    reportOcorrenciaInicial: "",
    DescricaoResumo: caso?.textos?.descricao_resumo ?? "",
    DescricaoCompleta: caso?.textos?.descricao_completa ?? "",
    reportAnaliseUsuarioId: String(caso?.usuarios?.desenvolvimento?.id ?? ""),
    reportResponsavelSuporteId: String(caso?.usuarios?.relator?.id ?? ""),
    modulo: caso?.caracteristicas?.modulo ?? "",
    versao: produto?.versao != null ? String(produto.versao) : "",
    projeto: String(projeto?.id ?? ""),
    origem: String(caso?.caracteristicas?.id_origem ?? "4"),
    qaAtribuido,
    InformacoesAdicionais: caso?.textos?.informacoes_adicionais ?? "",
    status: String(caso?.status?.status_id ?? "1"),
    analiseStatus: normalizeAnaliseStatusForForm(item.report?.analise_status),
    reportPrioridade: String(item.report?.prioridade ?? ""),
  };
}

export const reportEditFallbackDefaults: ReportEditFormData = {
  produto: "",
  categoria: "",
  categoriaTipoLabel: "",
  importancia: "3",
  reportOcorrenciaInicial: "",
  DescricaoResumo: "",
  DescricaoCompleta: "",
  reportAnaliseUsuarioId: "",
  reportResponsavelSuporteId: "",
  modulo: "",
  versao: "",
  projeto: "",
  origem: "4",
  qaAtribuido: "",
  InformacoesAdicionais: "",
  status: "1",
  analiseStatus: "",
  reportPrioridade: "",
};

function parseDateTime(value: string | null | undefined): Date | null {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return null;

  const soData = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (soData) {
    const y = Number(soData[1]);
    const m = Number(soData[2]);
    const d = Number(soData[3]);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatReportDateParsed(parsed: Date | null): string {
  if (!parsed) return "Não informado";
  return format(parsed, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

export function formatReportDateTimeDisplay(
  value: string | null | undefined,
): string {
  return formatReportDateParsed(parseDateTime(value));
}

export function formatReportDateDisplay(
  value: string | null | undefined,
): string {
  return formatReportDateParsed(parseDateTime(value));
}

export function getPrimeiroClienteNome(item: ProjetoMemoriaItem): string {
  const clientes = item.caso?.clientes;
  if (!Array.isArray(clientes) || clientes.length === 0) {
    return "Não informado";
  }
  const nome = clientes[0]?.cliente_nome?.trim();
  return nome || "Não informado";
}

export function findVersaoDoItem(
  versoes: Versao[] | undefined,
  versaoProduto: string | null | undefined,
): Versao | undefined {
  const alvo = String(versaoProduto ?? "").trim();
  if (!alvo || !versoes?.length) return undefined;

  const bySequencia = versoes.find(
    (v) => String(v.sequencia ?? "").trim() === alvo,
  );
  if (bySequencia) return bySequencia;

  const normAlvo = extractVersaoProduto(alvo);
  return versoes.find((v) => {
    const ver = String(v.versao ?? "").trim();
    if (!ver) return false;
    if (ver === alvo) return true;
    return extractVersaoProduto(ver) === normAlvo;
  });
}

/** Prazo exibido a partir do campo `fechamento` da versão do produto (auxiliar/versoes). */
export function getReportPrazoFromVersaoFechamento(
  versoes: Versao[] | undefined,
  versaoProduto: string | null | undefined,
): string {
  const versao = findVersaoDoItem(versoes, versaoProduto);
  const fechamento = versao?.fechamento?.trim();
  if (!fechamento) return "Não informado";
  return formatReportDateDisplay(fechamento);
}
