const EMPTY = "—";

function extractCalendarDateParts(
  value: string,
): { day: string; month: string; year: string } | null {
  const trimmed = value.trim();
  let datePart = trimmed;

  if (trimmed.includes("T")) {
    datePart = trimmed.split("T")[0] ?? trimmed;
  } else if (trimmed.includes(" ")) {
    datePart = trimmed.split(" ")[0] ?? trimmed;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return null;

  return { year: match[1], month: match[2], day: match[3] };
}

function isValidTicketDate(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  const parts = extractCalendarDateParts(value);
  if (!parts) return false;
  return Number(parts.year) > 1500;
}

/** Data no calendário (DD/MM/AAAA), sem deslocamento de fuso em meia-noite UTC. */
export function formatTicketDate(value: string | null | undefined): string {
  if (!value?.trim()) return EMPTY;
  const parts = extractCalendarDateParts(value);
  if (!parts || Number(parts.year) <= 1900) return EMPTY;
  return `${parts.day}/${parts.month}/${parts.year}`;
}

export function formatTicketTime(value: string | null | undefined): string {
  if (!isValidTicketDate(value)) return EMPTY;

  const date = new Date(
    value!.includes(" ") ? value!.replace(" ", "T") : value!,
  );
  if (Number.isNaN(date.getTime())) return EMPTY;

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export function formatTicketDateTime(value: string | null | undefined): string {
  const date = formatTicketDate(value);
  const time = formatTicketTime(value);
  if (date === EMPTY && time === EMPTY) return EMPTY;
  if (time === EMPTY) return date;
  if (date === EMPTY) return time;
  return `${date} ${time}`;
}

export function formatTicketUrgencia(
  urgente: boolean,
  isAtendimentoImediato: boolean,
): string {
  if (urgente) return "Urgente";
  if (isAtendimentoImediato) return "Atendimento Imediato";
  return "Normal";
}

export function formatTicketRetorno(value: string | null | undefined): string {
  if (!value?.trim()) return EMPTY;
  return formatTicketDate(value);
}

export function formatTicketMotivo(value: string | null | undefined): string {
  if (!value?.trim()) return EMPTY;
  return value.replace(/\r\n/g, " ").replace(/\s+/g, " ").trim();
}

export function formatTicketAssuntoFaq(
  assunto: string | null | undefined,
  faqGrupo: string | null | undefined,
): string {
  const assuntoTrim = assunto?.trim();
  if (assuntoTrim) return assuntoTrim;
  const faqTrim = faqGrupo?.trim();
  return faqTrim || EMPTY;
}

export function formatTicketAtendenteSuporte(
  atendente: string | null | undefined,
  suporteNome: string | null | undefined,
): string {
  const parts = [atendente?.trim(), suporteNome?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : EMPTY;
}

export function formatTicketServicoRealizado(
  value: string | null | undefined,
): string {
  const trimmed = value?.replace(/\r\n/g, " ").replace(/\s+/g, " ").trim();
  return trimmed || "Ainda não registrado";
}

export function getOcorrenciaTitulo(ticket: {
  faqGrupo: string;
  assunto: string | null;
  motivo: string;
}): string {
  if (ticket.faqGrupo?.trim()) return ticket.faqGrupo.trim();
  if (ticket.assunto?.trim()) return ticket.assunto.trim();

  const motivo = formatTicketMotivo(ticket.motivo);
  if (motivo === EMPTY) return "Ocorrência sem motivo informado";
  if (motivo.length <= 120) return motivo;
  return `${motivo.slice(0, 120).trim()}…`;
}
