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

const VERSAO_TERMS_BUGFIX = ["BUG", "MELHORIA"] as const;
const VERSAO_TERMS_BACKLOG = ["BACKLOG"] as const;

function versaoContainsTerm(label: string | undefined | null, terms: readonly string[]): boolean {
  const raw = String(label ?? "").toUpperCase();
  if (!raw) return false;
  return terms.some((term) => raw.includes(term));
}

/**
 * Indica se o label da versão é do tipo BUG ou MELHORIA.
 */
export function isVersaoBugOuMelhoria(versaoLabel: string | undefined | null): boolean {
  return versaoContainsTerm(versaoLabel, VERSAO_TERMS_BUGFIX);
}

/**
 * Indica se o label da versão é BACKLOG.
 */
export function isVersaoBacklog(versaoLabel: string | undefined | null): boolean {
  return versaoContainsTerm(versaoLabel, VERSAO_TERMS_BACKLOG);
}

/**
 * @deprecated Use isVersaoBugOuMelhoria / isVersaoBacklog separados.
 * Mantido para compatibilidade com getReportStatusFallbackPorVersao.
 */
export function isVersaoBugMelhoriaBacklog(
  versaoLabel: string | undefined | null,
): boolean {
  return isVersaoBugOuMelhoria(versaoLabel) || isVersaoBacklog(versaoLabel);
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
 * Resolve status report + caso quando a versão é alterada.
 * - BUG ou MELHORIA → sem mudança automática (retorna null).
 * - BACKLOG         → report 22, caso 1.
 * - Versão normal   → report 20, caso 1.
 */
export function resolveStatusFromVersaoChange(
  versaoLabel: string | undefined | null,
): { reportStatus: "20" | "22"; casoStatus: 1 } | null {
  if (!String(versaoLabel ?? "").trim()) return null;
  if (isVersaoBugOuMelhoria(versaoLabel)) return null;
  const reportStatus = isVersaoBacklog(versaoLabel) ? "22" : "20";
  return { reportStatus, casoStatus: 1 };
}

/** Status CASO "Aberto" (id 1): report deve ficar não selecionado (API `"0"`). */
export const CASO_STATUS_ABERTO_ID = 1;

/** Status CASO "Incompleto" — equivale ao report 21. */
export const CASO_STATUS_INCOMPLETO_ID = 8;

/** Status CASO "Suspenso" — equivale ao report 23. */
export const CASO_STATUS_SUSPENSO_ID = 10;

/** Status REPORT "Incompleto" — equivale ao caso 8. */
export const REPORT_STATUS_INCOMPLETO_ID = "21";

/** Status REPORT "Suspenso" — equivale ao caso 10. */
export const REPORT_STATUS_SUSPENSO_ID = "23";

/** Status REPORT não selecionado (caso aberto). */
export const REPORT_STATUS_NAO_SELECIONADO_ID = "0";

export function getReportEditRodapeVisibility(
  analiseStatus: string | null | undefined,
) {
  const status = String(analiseStatus ?? "").trim();
  const exibirConcluir = status === REPORT_STATUS_INCOMPLETO_ID;
  const exibirSuspender =
    status === REPORT_STATUS_INCOMPLETO_ID ||
    status === REPORT_STATUS_NAO_SELECIONADO_ID;

  return {
    exibirConcluir,
    exibirSuspender,
    exibirRodape: exibirConcluir || exibirSuspender,
  };
}

export function shouldClearReportAnaliseForCasoStatus(
  casoStatus: number | string | null | undefined,
): boolean {
  return Number(casoStatus) === CASO_STATUS_ABERTO_ID;
}

/**
 * Resolve o status REPORT a sincronizar quando o usuário altera o status CASO.
 * Equivalências fixas: 8→21, 10→23. Caso 1 limpa o report (undefined).
 * Status 20/22 não são definidos aqui (apenas via mudança de versão).
 */
export function resolveReportStatusFromCaso(
  casoStatus: number | string | null | undefined,
): string | undefined {
  if (shouldClearReportAnaliseForCasoStatus(casoStatus)) {
    return undefined;
  }

  const id = Number(casoStatus);
  if (id === CASO_STATUS_INCOMPLETO_ID) return REPORT_STATUS_INCOMPLETO_ID;
  if (id === CASO_STATUS_SUSPENSO_ID) return REPORT_STATUS_SUSPENSO_ID;
  return undefined;
}

/**
 * Resolve o status CASO a sincronizar quando o usuário altera o status REPORT.
 * Equivalências fixas: 21→8, 23→10.
 * Report 20 ou 22 com caso 8 ou 10 → caso 1 (report permanece 20/22).
 */
export function resolveCasoStatusFromReport(
  reportStatus: number | string | null | undefined,
  casoStatusAtual: number | string | null | undefined,
): number | undefined {
  const target = String(reportStatus ?? "").trim();
  if (!target || target === "0") return undefined;

  if (target === REPORT_STATUS_INCOMPLETO_ID) {
    return CASO_STATUS_INCOMPLETO_ID;
  }
  if (target === REPORT_STATUS_SUSPENSO_ID) {
    return CASO_STATUS_SUSPENSO_ID;
  }

  if (target === "20" || target === "22") {
    const caso = Number(casoStatusAtual);
    if (
      caso === CASO_STATUS_INCOMPLETO_ID ||
      caso === CASO_STATUS_SUSPENSO_ID
    ) {
      return CASO_STATUS_ABERTO_ID;
    }
  }

  return undefined;
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
