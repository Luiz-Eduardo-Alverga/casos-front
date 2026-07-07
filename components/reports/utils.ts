import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { ReportCardData, ReportPrioridadeStyle } from "./types";

const DEFAULT_PRIORIDADE_STYLE: ReportPrioridadeStyle = {
  border: "bg-gray-400 dark:bg-gray-500",
  badgeContainer: "bg-gray-50 border-gray-200 dark:bg-gray-800/40 dark:border-gray-700",
  badgeDot: "bg-gray-500 dark:bg-gray-400",
  badgeText: "text-gray-700 dark:text-gray-300",
};

/**
 * Estilo por prioridade do report. A comparação é case-insensitive e usa o
 * primeiro termo encontrado no texto da prioridade.
 */
const PRIORIDADE_STYLES: Array<{
  values: string[];
  style: ReportPrioridadeStyle;
}> = [
  {
    values: ["CRITIC", "CRÍTIC"],
    style: {
      border: "bg-red-500",
      badgeContainer: "bg-red-50 border-red-100 dark:bg-red-950/40 dark:border-red-800",
      badgeDot: "bg-red-500 dark:bg-red-400",
      badgeText: "text-red-600 dark:text-red-400",
    },
  },
  {
    values: ["ALTO", "ALTA"],
    style: {
      border: "bg-orange-500",
      badgeContainer: "bg-orange-50 border-orange-100 dark:bg-orange-950/40 dark:border-orange-800",
      badgeDot: "bg-orange-500 dark:bg-orange-400",
      badgeText: "text-orange-600 dark:text-orange-400",
    },
  },
  {
    values: ["MEDIO", "MÉDIO", "MEDIA", "MÉDIA"],
    style: {
      border: "bg-yellow-500",
      badgeContainer: "bg-yellow-50 border-yellow-100 dark:bg-yellow-950/40 dark:border-yellow-800",
      badgeDot: "bg-yellow-500 dark:bg-yellow-400",
      badgeText: "text-yellow-700 dark:text-yellow-400",
    },
  },
  {
    values: ["BAIXO", "BAIXA"],
    style: {
      border: "bg-blue-500",
      badgeContainer: "bg-blue-50 border-blue-100 dark:bg-blue-950/40 dark:border-blue-800",
      badgeDot: "bg-blue-500 dark:bg-blue-400",
      badgeText: "text-blue-600 dark:text-blue-400",
    },
  },
];

export function getPrioridadeStyle(
  prioridade: string | null | undefined,
): ReportPrioridadeStyle {
  const upper = String(prioridade ?? "")
    .trim()
    .toUpperCase();
  if (!upper) return DEFAULT_PRIORIDADE_STYLE;
  for (const item of PRIORIDADE_STYLES) {
    if (item.values.some((v) => upper.includes(v))) return item.style;
  }
  return DEFAULT_PRIORIDADE_STYLE;
}

/** Exibe o texto com a primeira letra maiúscula e o resto minúsculo. */
export function formatCapitalize(value: string | null | undefined): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";
  const lower = raw.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function parseApiDateTime(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const match = value
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  if (!year || !month || !day) return null;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hour ? Number(hour) : 0,
    minute ? Number(minute) : 0,
    second ? Number(second) : 0,
  );
}

/** Formata uma data da API (yyyy-mm-dd [hh:mm]) para dd/mm/yyyy hh:mm. */
export function formatDataAbertura(value: string | null | undefined): string {
  const date = parseApiDateTime(value);
  if (!date) return "—";
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()} ${pad2(
    date.getHours(),
  )}:${pad2(date.getMinutes())}`;
}

/**
 * Nível de severidade do prazo:
 * - `overdue`: já venceu
 * - `close`: falta <= 24h para vencer
 * - `medium`: falta <= 72h (3 dias)
 * - `far`: falta mais de 72h
 * - `none`: sem prazo definido
 */
export type ReportSlaSeverity = "overdue" | "close" | "medium" | "far" | "none";

/** Limiares (em horas) de proximidade do vencimento. */
const SLA_CLOSE_HOURS = 24;
const SLA_MEDIUM_HOURS = 72;

export interface ReportSlaInfo {
  /** Texto exibido no indicador (ex.: "Vencido há 2h", "Vence em 3h"). */
  label: string;
  /** Se o prazo já foi ultrapassado. */
  overdue: boolean;
  /** Se há prazo definido. */
  hasLimite: boolean;
  /** Nível de proximidade do vencimento. */
  severity: ReportSlaSeverity;
}

/** Calcula o status de vencimento (SLA) a partir da data limite do report. */
export function getReportSlaInfo(
  dataLimite: string | null | undefined,
): ReportSlaInfo {
  const limite = parseApiDateTime(dataLimite);
  if (!limite) {
    return {
      label: "Sem prazo",
      overdue: false,
      hasLimite: false,
      severity: "none",
    };
  }

  const diffMs = limite.getTime() - Date.now();
  const overdue = diffMs < 0;
  const absMs = Math.abs(diffMs);
  const totalMinutes = Math.floor(absMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let duracao: string;
  if (days > 0) duracao = `${days}d`;
  else if (hours > 0) duracao = `${hours}h`;
  else duracao = `${minutes}min`;

  const hoursRemaining = diffMs / 3600000;
  let severity: ReportSlaSeverity;
  if (overdue) severity = "overdue";
  else if (hoursRemaining <= SLA_CLOSE_HOURS) severity = "close";
  else if (hoursRemaining <= SLA_MEDIUM_HOURS) severity = "medium";
  else severity = "far";

  return {
    label: overdue ? `Vencido há ${duracao}` : `Vence em ${duracao}`,
    overdue,
    hasLimite: true,
    severity,
  };
}

/** Classes do badge de SLA conforme a severidade. */
export function getSlaSeverityStyle(severity: ReportSlaSeverity): string {
  switch (severity) {
    case "overdue":
    case "close":
      return "border-red-100 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400";
    case "medium":
      return "border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400";
    case "far":
      return "border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400";
    default:
      return "border-border-divider bg-muted/40 text-text-secondary";
  }
}

/** Normaliza um item de projeto-memória para os dados do card de report. */
export function mapProjetoMemoriaToReportCard(
  item: ProjetoMemoriaItem,
): ReportCardData {
  const { caso, produto } = item;
  return {
    id: caso.id,
    prioridade:
      item.report?.prioridade?.trim() ||
      caso.caracteristicas?.prioridade ||
      "",
    categoria: caso.caracteristicas?.tipo_categoria ?? "",
    status: caso.status?.status_tipo?.trim() || caso.status?.descricao || "",
    statusId: Number(caso.status?.status_id ?? 0),
    descricaoResumo: caso.textos?.descricao_resumo?.trim() || "Sem resumo",
    descricaoCompleta: caso.textos?.descricao_completa?.trim() || "",
    produtoNome: produto?.nome?.trim() || "—",
    relatorNome: caso.usuarios?.relator?.nome?.trim() || "—",
    responsavelNome: caso.usuarios?.desenvolvimento?.nome?.trim() || "—",
    dataAbertura: caso.datas?.abertura ?? null,
    dataLimite: item.report?.data_limite ?? null,
    item,
  };
}
