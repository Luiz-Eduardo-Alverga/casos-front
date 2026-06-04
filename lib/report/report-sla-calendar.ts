export type SaoPauloDateParts = {
  year: number;
  month: number;
  day: number;
};

export type ReportSlaCalendar = {
  /** Datas não úteis em SP: "YYYY-MM-DD". Futuro: endpoint de feriados. */
  nonBusinessDates?: ReadonlySet<string>;
};

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function toSaoPauloDateKey(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Sábado ou domingo no calendário local derivado das partes SP (year/month/day). */
export function isWeekendInSaoPaulo(
  year: number,
  month: number,
  day: number,
): boolean {
  const dow = new Date(year, month - 1, day).getDay();
  return dow === 0 || dow === 6;
}

export function isBusinessDayInSaoPaulo(
  parts: SaoPauloDateParts,
  calendar?: ReportSlaCalendar,
): boolean {
  const { year, month, day } = parts;
  if (isWeekendInSaoPaulo(year, month, day)) return false;

  const key = toSaoPauloDateKey(year, month, day);
  if (calendar?.nonBusinessDates?.has(key)) return false;

  return true;
}
