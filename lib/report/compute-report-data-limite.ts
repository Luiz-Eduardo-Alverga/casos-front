import {
  isBusinessDayInSaoPaulo,
  type ReportSlaCalendar,
  type SaoPauloDateParts,
} from "@/lib/report/report-sla-calendar";

const SAO_PAULO_TZ = "America/Sao_Paulo";
const EXPEDIENTE_ENCERRA_HORA = 18;

export type { ReportSlaCalendar };

function getSaoPauloParts(date: Date): SaoPauloDateParts & {
  hour: number;
  minute: number;
  second: number;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SAO_PAULO_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const valueOf = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: Number(valueOf("year")),
    month: Number(valueOf("month")),
    day: Number(valueOf("day")),
    hour: Number(valueOf("hour")),
    minute: Number(valueOf("minute")),
    second: Number(valueOf("second")),
  };
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatApiDateTimeFromSaoPauloParts(
  year: number,
  month: number,
  day: number,
  hour = 23,
  minute = 59,
  second = 59,
): string {
  return `${year}-${pad2(month)}-${pad2(day)} ${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
}

function dateFromSaoPauloParts(
  parts: SaoPauloDateParts,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    hour,
    minute,
    second,
  );
}

function advanceCalendarDay(parts: SaoPauloDateParts): SaoPauloDateParts {
  const d = dateFromSaoPauloParts(parts);
  d.setDate(d.getDate() + 1);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
  };
}

function advanceToNextBusinessDayStart(
  parts: SaoPauloDateParts,
  calendar?: ReportSlaCalendar,
): SaoPauloDateParts {
  let cursor = { ...parts };
  while (!isBusinessDayInSaoPaulo(cursor, calendar)) {
    cursor = advanceCalendarDay(cursor);
  }
  return cursor;
}

/**
 * Data base para SLA: agora em SP; após 18h considera o dia seguinte;
 * avança até o primeiro dia útil (fim de semana; feriados via calendar).
 */
export function normalizeReportAberturaBase(
  now: Date = new Date(),
  calendar?: ReportSlaCalendar,
): Date {
  let { year, month, day, hour, minute, second } = getSaoPauloParts(now);

  if (hour >= EXPEDIENTE_ENCERRA_HORA) {
    const next = advanceCalendarDay({ year, month, day });
    year = next.year;
    month = next.month;
    day = next.day;
    hour = 0;
    minute = 0;
    second = 0;
  }

  let dayParts: SaoPauloDateParts = { year, month, day };
  if (!isBusinessDayInSaoPaulo(dayParts, calendar)) {
    dayParts = advanceToNextBusinessDayStart(dayParts, calendar);
    hour = 0;
    minute = 0;
    second = 0;
  }

  return dateFromSaoPauloParts(dayParts, hour, minute, second);
}

/** @deprecated Use normalizeReportAberturaBase */
export function getReportAberturaBaseForSla(
  now: Date = new Date(),
  calendar?: ReportSlaCalendar,
): Date {
  return normalizeReportAberturaBase(now, calendar);
}

function getSaoPauloDatePartsFromDate(date: Date): SaoPauloDateParts {
  const { year, month, day } = getSaoPauloParts(date);
  return { year, month, day };
}

/**
 * Soma N dias úteis após a data da base (o dia da base não conta).
 */
export function addBusinessDaysFromBase(
  base: Date,
  businessDays: number,
  calendar?: ReportSlaCalendar,
): Date {
  if (businessDays <= 0) {
    return base;
  }

  let cursor = getSaoPauloDatePartsFromDate(base);
  let added = 0;

  while (added < businessDays) {
    cursor = advanceCalendarDay(cursor);
    if (isBusinessDayInSaoPaulo(cursor, calendar)) {
      added += 1;
    }
  }

  const { hour, minute, second } = getSaoPauloParts(base);
  return dateFromSaoPauloParts(cursor, hour, minute, second);
}

/**
 * Calcula report_data_limite: base normalizada + SLA (dias úteis ou horas).
 * Horário final sempre 23:59:59 no dia limite (SP).
 */
export function computeReportDataLimite(
  slaHours: number,
  now: Date = new Date(),
  calendar?: ReportSlaCalendar,
): string {
  const base = normalizeReportAberturaBase(now, calendar);

  const limite =
    slaHours < 24
      ? new Date(base.getTime() + slaHours * 60 * 60 * 1000)
      : addBusinessDaysFromBase(
          base,
          Math.round(slaHours / 24),
          calendar,
        );

  const { year, month, day } = getSaoPauloParts(limite);
  return formatApiDateTimeFromSaoPauloParts(year, month, day, 23, 59, 59);
}
