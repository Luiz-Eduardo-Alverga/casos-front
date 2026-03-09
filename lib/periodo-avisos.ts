/**
 * Retorna data no formato YYYY-MM-DD para uso na API de mensagens (data_msg_inicio / data_msg_fim).
 */
function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type PeriodoAvisosValue = "este_mes" | "mes_passado" | "ultimos_3_meses" | "todos";

export interface PeriodoAvisosRange {
  data_msg_inicio: string | undefined;
  data_msg_fim: string | undefined;
}

/**
 * Calcula o intervalo de datas para o período selecionado.
 * "este_mes" = primeiro e último dia do mês atual (padrão no dropdown).
 * "todos" = sem filtro de data.
 */
export function getPeriodoRange(value: PeriodoAvisosValue): PeriodoAvisosRange {
  const now = new Date();

  switch (value) {
    case "este_mes": {
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
      const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        data_msg_inicio: toYYYYMMDD(inicioMes),
        data_msg_fim: toYYYYMMDD(fimMes),
      };
    }
    case "mes_passado": {
      const inicioPassado = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const fimPassado = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        data_msg_inicio: toYYYYMMDD(inicioPassado),
        data_msg_fim: toYYYYMMDD(fimPassado),
      };
    }
    case "ultimos_3_meses": {
      const fim = new Date(now);
      const inicio = new Date(now);
      inicio.setMonth(inicio.getMonth() - 2);
      inicio.setDate(1);
      return {
        data_msg_inicio: toYYYYMMDD(inicio),
        data_msg_fim: toYYYYMMDD(fim),
      };
    }
    case "todos":
    default:
      return { data_msg_inicio: undefined, data_msg_fim: undefined };
  }
}

/** Opções para o Select de período (label exibido). */
export const PERIODO_AVISOS_OPCOES: { value: PeriodoAvisosValue; label: string }[] = [
  { value: "este_mes", label: "Este mês" },
  { value: "mes_passado", label: "Mês passado" },
  { value: "ultimos_3_meses", label: "Últimos 3 meses" },
  { value: "todos", label: "Todos" },
];
