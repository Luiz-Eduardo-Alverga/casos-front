import { formatMinutesToHHMM } from "@/lib/utils";
import type {
  HorasAnaliticasApiItem,
  HorasAnaliticasCaseItem,
  HorasAnaliticasParsedData,
} from "./types";

function parseMinutes(value: string | number | null | undefined): number {
  const parsed = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatProdutoVersao(produto: string, versao: string): string {
  const nomeProduto = produto.trim();
  const versaoProduto = versao.trim();
  if (!versaoProduto) return nomeProduto;
  return `${nomeProduto} v${versaoProduto}`;
}

export function formatDateYmdToBr(dateYmd: string): string {
  const [year, month, day] = dateYmd.split("-");
  if (!year || !month || !day) return dateYmd;
  return `${day}/${month}/${year}`;
}

export function getTodayYmd(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function dateToYmdString(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMinutesLabel(minutes: number): string {
  const unit = minutes === 1 ? "minuto" : "minutos";
  return `${minutes} ${unit}`;
}

export function formatMinutesCompact(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (rest === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${rest}min`;
}

function isTipoTecnico(tipo: string): boolean {
  return tipo.trim().toUpperCase() === "CASOS";
}

function mapCaso(item: HorasAnaliticasApiItem): HorasAnaliticasCaseItem {
  const registro = String(item.registro ?? "").trim();
  const minutosRealizados = parseMinutes(item.realizado_minutos);

  return {
    id: `${item.sequencia}-${registro}`,
    registro,
    descricaoResumo: item.descricao_resumo?.trim() || "Sem descrição",
    tipo: item.tipo?.trim() || "N/A",
    horaAbertura: item.hora_abertura?.slice(0, 5) || "--:--",
    horaFechamento: item.hora_fechamento?.slice(0, 5) || "--:--",
    minutosRealizados,
    produtoVersao: formatProdutoVersao(
      item.produto ?? "",
      item.versao_produto ?? "",
    ),
    tarefa_tecnica: item.tarefa_tecnica,
  };
}

export function parseHorasAnaliticasData(
  items: HorasAnaliticasApiItem[],
): HorasAnaliticasParsedData {
  const casos = items.map(mapCaso);

  const resumo = casos.reduce(
    (acc, item) => {
      if (item.tarefa_tecnica) {
        acc.minutosTecnicos += item.minutosRealizados;
      } else {
        acc.minutosNaoTecnicos += item.minutosRealizados;
      }
      acc.minutosTotais += item.minutosRealizados;
      return acc;
    },
    {
      minutosTecnicos: 0,
      minutosNaoTecnicos: 0,
      minutosTotais: 0,
      totalCasos: casos.length,
    },
  );

  return { resumo, casos };
}

export function toSummaryCardValue(minutes: number): string {
  return formatMinutesToHHMM(minutes);
}
