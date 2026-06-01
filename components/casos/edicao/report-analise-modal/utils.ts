import type { StatusItem } from "@/services/auxiliar/status";

export function formatReportDate(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const raw = value.trim();
  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (!match) return raw;

  const [, year, month, day, hour, minute] = match;
  if (hour && minute) {
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }
  return `${day}/${month}/${year}`;
}

function getNowSaoPauloParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const valueOf = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: valueOf("year"),
    month: valueOf("month"),
    day: valueOf("day"),
    hour: valueOf("hour"),
    minute: valueOf("minute"),
    second: valueOf("second"),
  };
}

export function nowSaoPauloToApiDateTime(): string {
  const { year, month, day, hour, minute, second } = getNowSaoPauloParts();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * Normaliza o status de análise vindo da API para uso no formulário.
 * Para REPORT, o status "Aberto" (id 1) deve ser tratado como "não selecionado"
 * para exibir placeholder na combobox.
 */
export function normalizeAnaliseStatusForForm(
  value: string | null | undefined,
): string {
  const v = String(value ?? "").trim();
  if (!v) return "";
  if (v === "1") return "";
  return v;
}

/**
 * Lê o campo `report_status_equivalente` na lista da API para um determinado
 * Registro. Retorna `undefined` quando não há equivalente (`"0"` ou ausente).
 */
export function getReportStatusEquivalente(
  statusList: readonly StatusItem[] | undefined,
  statusId: number | string | null | undefined,
): string | undefined {
  if (!statusList?.length) return undefined;
  const id = Number(statusId);
  if (!Number.isFinite(id) || id === 0) return undefined;

  const item = statusList.find((s) => Number(s.Registro) === id);
  if (!item) return undefined;

  const equivalente = String(item.report_status_equivalente ?? "").trim();
  if (!equivalente || equivalente === "0") return undefined;
  return equivalente;
}

const VERSAO_FALLBACK_TERMS = ["BUG", "MELHORIA", "BACKLOG"] as const;

/**
 * Indica se o nome/label da versão selecionada corresponde a um dos
 * tipos especiais (BUG, MELHORIA, BACKLOG) que disparam fallback para
 * report 22 quando o status do caso não tem equivalente direto.
 */
export function isVersaoBugMelhoriaBacklog(
  versaoLabel: string | undefined | null,
): boolean {
  const raw = String(versaoLabel ?? "").toUpperCase();
  if (!raw) return false;
  return VERSAO_FALLBACK_TERMS.some((term) => raw.includes(term));
}

/**
 * Quando o status do caso não tem report equivalente direto, decide entre
 * o report `"22"` (Aprovado | Pendente versão) e `"20"` (Aprovado | Versão definida)
 * a partir do label da versão selecionada.
 */
export function getReportStatusFallbackPorVersao(
  versaoLabel: string | undefined | null,
): "20" | "22" {
  return isVersaoBugMelhoriaBacklog(versaoLabel) ? "22" : "20";
}

/**
 * Resolve o status REPORT equivalente a um status CASO selecionado.
 * - Usa `report_status_equivalente` da API quando disponível.
 * - Quando não houver equivalente direto, aplica o fallback de versão.
 */
export function resolveReportStatusFromCaso(
  statusList: readonly StatusItem[] | undefined,
  casoStatus: number | string | null | undefined,
  versaoLabel: string | undefined | null,
): string | undefined {
  const equivalente = getReportStatusEquivalente(statusList, casoStatus);
  if (equivalente) return equivalente;
  return getReportStatusFallbackPorVersao(versaoLabel);
}

/**
 * Resolve o status CASO equivalente a um status REPORT selecionado,
 * buscando o registro CASO cujo `report_status_equivalente` aponta para o report.
 */
export function resolveCasoStatusFromReport(
  statusList: readonly StatusItem[] | undefined,
  reportStatus: number | string | null | undefined,
): number | undefined {
  if (!statusList?.length) return undefined;

  const target = String(reportStatus ?? "").trim();
  if (!target || target === "0") return undefined;

  const item = statusList.find(
    (s) =>
      s.tipo_status === "CASO" &&
      String(s.report_status_equivalente ?? "").trim() === target,
  );

  if (!item) return undefined;
  return item.Registro;
}

/**
 * Regras de persistência da conclusão da análise conforme status selecionado.
 * - 20, 22, 23 => conclui agora
 * - 21 => limpa data de conclusão
 * - demais => mantém sem alteração
 */
export function buildAnaliseConclusaoByStatus(
  analiseStatus: string | undefined,
): string | null | undefined {
  if (!analiseStatus) return undefined;
  if (analiseStatus === "21") return null;
  if (
    analiseStatus === "20" ||
    analiseStatus === "22" ||
    analiseStatus === "23"
  ) {
    return nowSaoPauloToApiDateTime();
  }
  return undefined;
}
