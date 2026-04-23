export function formatReportDate(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const raw = value.trim();
  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (!match) return raw;

  const [, year, month, day, hour, minute] = match;
  if (hour && minute) {
    return `${day}/${month}/${year} ${hour}:${minute}`;
  }
  return `${day}/${month}/${year}`;
}

function getNowSaoPauloParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const valueOf = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: valueOf("year"),
    month: valueOf("month"),
    day: valueOf("day"),
    hour: valueOf("hour"),
    minute: valueOf("minute"),
    second: valueOf("second"),
  };
}

export function nowSaoPauloToApiDateTime(): string {
  const { year, month, day, hour, minute, second } = getNowSaoPauloParts();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

/**
 * Normaliza o status de análise vindo da API para uso no formulário.
 * Para REPORT, o status "Aberto" (id 1) deve ser tratado como "não selecionado"
 * para exibir placeholder na combobox.
 */
export function normalizeAnaliseStatusForForm(
  value: string | null | undefined,
): string {
  const v = String(value ?? "").trim();
  if (!v) return "";
  if (v === "1") return "";
  return v;
}

/**
 * Regras de persistência da conclusão da análise conforme status selecionado.
 * - 20, 22, 23 => conclui agora
 * - 21 => limpa data de conclusão
 * - demais => mantém sem alteração
 */
export function buildAnaliseConclusaoByStatus(
  analiseStatus: string | undefined,
): string | null | undefined {
  if (!analiseStatus) return undefined;
  if (analiseStatus === "21") return null;
  if (analiseStatus === "20" || analiseStatus === "22" || analiseStatus === "23") {
    return nowSaoPauloToApiDateTime();
  }
  return undefined;
}

