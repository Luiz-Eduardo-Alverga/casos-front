import type { ProjetoMemoriaItem } from "@/interfaces/projeto-memoria";
import type { ReportCardData, ReportPrioridadeStyle } from "./types";

const DEFAULT_PRIORIDADE_STYLE: ReportPrioridadeStyle = {
  border: "bg-gray-400",
  badgeContainer: "bg-gray-50 border-gray-200",
  badgeDot: "bg-gray-500",
  badgeText: "text-gray-700",
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
      badgeContainer: "bg-red-50 border-red-100",
      badgeDot: "bg-red-500",
      badgeText: "text-red-600",
    },
  },
  {
    values: ["ALTO", "ALTA"],
    style: {
      border: "bg-orange-500",
      badgeContainer: "bg-orange-50 border-orange-100",
      badgeDot: "bg-orange-500",
      badgeText: "text-orange-600",
    },
  },
  {
    values: ["MEDIO", "MÉDIO", "MEDIA", "MÉDIA"],
    style: {
      border: "bg-yellow-500",
      badgeContainer: "bg-yellow-50 border-yellow-100",
      badgeDot: "bg-yellow-500",
      badgeText: "text-yellow-700",
    },
  },
  {
    values: ["BAIXO", "BAIXA"],
    style: {
      border: "bg-blue-500",
      badgeContainer: "bg-blue-50 border-blue-100",
      badgeDot: "bg-blue-500",
      badgeText: "text-blue-600",
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

export interface ReportSlaInfo {
  /** Texto exibido no indicador (ex.: "Vencido há 2h", "Vence em 3h"). */
  label: string;
  /** Se o prazo já foi ultrapassado. */
  overdue: boolean;
  /** Se há prazo definido. */
  hasLimite: boolean;
}

/** Calcula o status de vencimento (SLA) a partir da data limite do report. */
export function getReportSlaInfo(
  dataLimite: string | null | undefined,
): ReportSlaInfo {
  const limite = parseApiDateTime(dataLimite);
  if (!limite) {
    return { label: "Sem prazo", overdue: false, hasLimite: false };
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

  return {
    label: overdue ? `Vencido há ${duracao}` : `Vence em ${duracao}`,
    overdue,
    hasLimite: true,
  };
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
