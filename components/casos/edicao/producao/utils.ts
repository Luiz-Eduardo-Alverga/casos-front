import type { ProducaoDetalheItem } from "@/interfaces/projeto-memoria";

export function formatMinutos(minutos: number): string {
  if (minutos === 0) return "0 minutos";
  return `${minutos} minutos`;
}

/** Exibe tempo realizado/teste: abaixo de 1h em minutos; a partir de 1h como "1 hora e 30 minutos". */
export function formatMinutosHoraEMinutos(minutos: number): string {
  if (minutos === 0) return "0 minutos";
  if (minutos < 60) {
    return minutos === 1 ? "1 minuto" : `${minutos} minutos`;
  }
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  const parteHoras = h === 1 ? "1 hora" : `${h} horas`;
  if (m === 0) return parteHoras;
  const parteMin = m === 1 ? "1 minuto" : `${m} minutos`;
  return `${parteHoras} e ${parteMin}`;
}

export function formatTempoExcedido(estimado: number, realizado: number): string {
  const diff = realizado - estimado;
  const sign = diff >= 0 ? "" : "-";
  const absMin = Math.abs(diff);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  return `${sign}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Formata data/hora da API (YYYY-MM-DD HH:mm:ss) para exibição (DD/MM/YYYY HH:mm) */
export function formatDataHoraProducao(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const s = value.trim();
  const match = s.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return s;
  const [, y, m, d, h, min] = match;
  return `${d}/${m}/${y} ${h}:${min}`;
}

/** Classifica tipo de produção para somar tempo em aberto nas métricas de dev vs. teste. */
export function isProducaoTipoTeste(tipo: string | null | undefined): boolean {
  const t = (tipo ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  return (
    t.includes("teste") ||
    t.includes("test") ||
    t.includes("qa") ||
    t.includes("qualidade")
  );
}

/**
 * Parse data/hora da API com segundos (YYYY-MM-DD HH:mm:ss).
 * O `apiStringToDate` do date-picker zera os segundos e distorce os minutos de duração.
 */
export function parseDataHoraProducaoApi(
  value: string | null | undefined
): Date | undefined {
  if (!value?.trim()) return undefined;
  const s = value.trim();
  const m = s.match(
    /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/,
  );
  if (!m) return undefined;
  const [, y, mo, d, h, min, sec = "0"] = m;
  return new Date(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(min),
    Number(sec),
  );
}

export function normalizeDateToMinute(d: Date): Date {
  return new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    0,
    0,
  );
}

/** Minutos decorridos (precisão de minuto) entre abertura e fechamento; sem fechamento, usa `agora`. */
export function minutosDuracaoProducaoApi(
  abertura: string | null | undefined,
  fechamento: string | null | undefined,
  agora: Date,
): number | null {
  const dAb = parseDataHoraProducaoApi(abertura);
  if (!dAb) return null;
  const dFe = fechamento?.trim()
    ? parseDataHoraProducaoApi(fechamento)
    : undefined;
  const inicio = normalizeDateToMinute(dAb);
  const fim = normalizeDateToMinute(dFe ?? agora);
  return Math.max(0, Math.round((fim.getTime() - inicio.getTime()) / 60000));
}

export function minutosDuracaoEdicao(
  abertura: Date | undefined,
  fechamento: Date | undefined,
  agora: Date,
): number | null {
  if (!abertura) return null;
  const inicio = normalizeDateToMinute(abertura);
  const fim = normalizeDateToMinute(fechamento ?? agora);
  return Math.max(0, Math.round((fim.getTime() - inicio.getTime()) / 60000));
}

export function formatDuracaoMinutos(minutos: number | null): string {
  if (minutos == null) return "—";
  return formatMinutosHoraEMinutos(minutos);
}

/** Aplica máscara HH:MM (00:00) no valor do input de tempo estimado */
export function maskHHMM(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 2) return digits;
  if (digits.length === 3) return `${digits.slice(0, 2)}:${digits.slice(2, 3)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

/**
 * Converte o tempo informado no input (HH:MM) para o formato de data esperado pela API:
 * YYYY-MM-DD HH:mm:ss (usa a data atual para a parte da data).
 */
export function buildTempoEstimadoParaApi(
  hhmm: string | null | undefined
): string | null {
  if (!hhmm?.trim()) return null;
  const trimmed = hhmm.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const [, h, m] = match;
  const now = new Date();
  const y = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = h.padStart(2, "0");
  return `${y}-${month}-${day} ${hour}:${m}:00`;
}

export function hasProducaoAberta(producaoList: ProducaoDetalheItem[]) {
  return producaoList.some(
    (row) =>
      Boolean(row.datas?.abertura?.trim()) && !row.datas?.fechamento?.trim(),
  );
}

