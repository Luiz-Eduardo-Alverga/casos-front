import type { ColaboradorIndicador } from "@/services/rh/get-colaboradores-indicadores";
import type { IndicadoresPremiacao } from "./types";

const UNIDADE_LABEL: Record<string, string> = {
  "%": "Percentual (%)",
  QT: "Quantidade (QT)",
  "HS/M": "Horas por mês (HS/M)",
};

function normalizeKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
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

export function ymdToDisplay(ymd: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  return `${ymd.slice(8, 10)}/${ymd.slice(5, 7)}/${ymd.slice(0, 4)}`;
}

export function getMonthRange(reference: Date): { start: Date; end: Date } {
  const start = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const end = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  return { start, end };
}

export function getPreviousMonthRange(reference = getTodayDate()): {
  start: Date;
  end: Date;
} {
  return getMonthRange(
    new Date(reference.getFullYear(), reference.getMonth() - 1, 1),
  );
}

export function getCurrentMonthRange(reference = getTodayDate()) {
  return getMonthRange(reference);
}

export function formatPeriodoLabel(dataInicial: string, dataFinal: string) {
  return `${ymdToDisplay(dataInicial)} a ${ymdToDisplay(dataFinal)}`;
}

export function formatDecimal(value: number, digits = 2): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatUnidade(value: number, unidade: string): string {
  const formatted = formatDecimal(value);
  if (unidade.trim() === "%") return `${formatted}%`;
  return `${formatted} ${unidade}`.trim();
}

export function isMaiorMelhor(item: ColaboradorIndicador): boolean {
  const acumulado = normalizeKey(String(item.acumulado ?? ""));
  if (acumulado === "MAIOR") return true;
  if (acumulado === "MENOR") return false;
  return String(item.id_led).toLowerCase() !== "down";
}

export function formatMeta(item: ColaboradorIndicador): string {
  const prefix = isMaiorMelhor(item) ? "a partir de " : "até ";
  return `${prefix}${formatUnidade(item.meta_indicador, item.unidade)}`;
}

export function premioValor(item: ColaboradorIndicador): number {
  return item.alcancado ? item.peso : 0;
}

export function toTitleCase(value: string | null | undefined): string {
  const text = value?.trim();
  if (!text) return "";
  const lower = text.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function unidadeLabel(unidade: string): string {
  return UNIDADE_LABEL[unidade] ?? unidade;
}

export function culturaDotClass(elementosDaCultura: string): string {
  const key = normalizeKey(elementosDaCultura);
  if (key.includes("SENSO DE DONO")) return "bg-status-info";
  if (key.includes("SUCESSO DO CLIENTE")) return "bg-muted-foreground";
  if (key.includes("INOVACAO")) return "bg-status-warning";
  if (key.includes("APRENDIZADO")) return "bg-muted-foreground";
  return "bg-muted-foreground";
}

export function splitIndicadores(items: ColaboradorIndicador[]) {
  const alcancou = items.filter((item) => item.alcancado);
  const resta = items.filter((item) => !item.alcancado);
  return { alcancou, resta };
}

export function computePremiacao(
  items: ColaboradorIndicador[],
): IndicadoresPremiacao {
  const potencial = items.reduce((sum, item) => sum + item.peso, 0);
  const alcancado = items.reduce((sum, item) => sum + premioValor(item), 0);
  const emAberto = potencial - alcancado;
  const percentual = potencial
    ? Math.round((alcancado / potencial) * 100)
    : 0;
  const pendentes = items.filter((item) => !item.alcancado).length;

  return { potencial, alcancado, emAberto, percentual, pendentes };
}

export function itemTooltip(item: ColaboradorIndicador): string {
  const tipo = toTitleCase(item.tipo_indicador || item.indicador_tipo);
  const cultura = toTitleCase(item.elementos_da_cultura);
  const tendencia = isMaiorMelhor(item)
    ? "Maior é melhor"
    : "Menor é melhor";
  return [tipo, cultura, tendencia].filter(Boolean).join(" · ");
}

export function displayOrFallback(value: string | null | undefined): {
  text: string;
  empty: boolean;
} {
  const text = value?.trim() ?? "";
  if (!text) return { text: "Não informado", empty: true };
  return { text, empty: false };
}
