import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";

export type PrioridadeBadgeVariant = "low" | "high" | "medium" | "neutral";

export interface PrioridadeBadgeConfig {
  label: string;
  variant: PrioridadeBadgeVariant;
}

function normalizePrioridadeKey(valor: string): string {
  return valor.trim().toUpperCase().replace(/A$/, "O");
}

export function resolvePrioridadeBadge(prioridade: string): PrioridadeBadgeConfig {
  const key = normalizePrioridadeKey(prioridade);

  if (key === "BAIXO" || key === "BAIXA") {
    return { label: "BAIXA", variant: "low" };
  }
  if (key === "ALTO" || key === "ALTA") {
    return { label: "ALTA", variant: "high" };
  }
  if (key === "MEDIO" || key === "MEDIA") {
    return { label: "MÉDIA", variant: "medium" };
  }

  const trimmed = prioridade.trim();
  return {
    label: trimmed ? trimmed.toUpperCase() : "—",
    variant: "neutral",
  };
}

export function formatRiscoNivel(valor: string): string {
  const trimmed = valor.trim();
  if (!trimmed) return "—";
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function formatRiscoHistoricoData(dataHistorico: string): string {
  const trimmed = dataHistorico.trim();
  if (!trimmed) return "—";

  const datePart = trimmed.split(/[\sT]/)[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    return trimmed;
  }

  const parsed = parse(datePart, "yyyy-MM-dd", new Date());
  return format(parsed, "dd/MM/yyyy", { locale: ptBR });
}

export function truncateRiscoTexto(
  texto: string | null | undefined,
  maxLength = 80,
): string {
  if (texto == null || !texto.trim()) return "—";
  const normalized = texto.trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}
