import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatDateTimePt(
  value: Date | string | null | undefined,
): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

/** Data para colunas tipo “Data de cadastro” (somente dia/mês/ano). */
export function formatDatePt(
  value: Date | string | null | undefined,
): string {
  if (value == null) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}
