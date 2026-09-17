export function todayIsoDate(): string {
  return localDateToIso(new Date());
}

export function toDateInput(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return value.trim().split(/\s+/)[0] ?? "";
}

export function isoToLocalDate(value: string | undefined): Date | undefined {
  const date = toDateInput(value);
  if (!date) return undefined;
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return undefined;
  }
  return parsed;
}

export function localDateToIso(date: Date | undefined): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateInput(value: string | undefined): string | null {
  const date = toDateInput(value);
  if (!date) return null;
  return `${date} 00:00:00`;
}

export function isVersaoAberta(status: string | null | undefined): boolean {
  return status?.trim().toUpperCase() === "ABERTO";
}

export function formatVersaoFechamento(
  status: string,
  fechamento: string | null | undefined,
  formatDate: (value: string | null | undefined) => string,
): { label: string; isPrevisao: boolean; empty: boolean } {
  const formatted = formatDate(fechamento);
  const hasDate = Boolean(fechamento?.trim()) && formatted !== "—";
  if (!hasDate) {
    return { label: "—", isPrevisao: false, empty: true };
  }
  if (isVersaoAberta(status)) {
    return {
      label: `Previsão ${formatted}`,
      isPrevisao: true,
      empty: false,
    };
  }
  return { label: formatted, isPrevisao: false, empty: false };
}

export function formatVersaoFechamentoMobile(
  status: string,
  fechamento: string | null | undefined,
  formatDate: (value: string | null | undefined) => string,
): string {
  const formatted = formatDate(fechamento);
  const hasDate = Boolean(fechamento?.trim()) && formatted !== "—";
  if (!hasDate) return "Sem previsão";
  if (isVersaoAberta(status)) return `Previsão ${formatted}`;
  return `Fechada em ${formatted}`;
}
