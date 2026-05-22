import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import {
  buildSgpTiposMap,
  resolveTipoLabel,
} from "@/components/projetos/edicao/shared/sgp-tipos-utils";

export { buildSgpTiposMap };

export function resolveStakeTipoLabel(
  idTipo: number,
  tiposMap: Map<number, string>,
): string {
  return resolveTipoLabel(idTipo, tiposMap);
}

/** Extrai horas e minutos da data/hora SGP (`1899-12-30 HH:mm:ss`). */
export function parseSgpHorasToMinutes(
  value: string | null | undefined,
): number {
  if (!value?.trim()) return 0;
  const match = value.trim().match(/\d{4}-\d{2}-\d{2}\s+(\d{1,2}):(\d{2})/);
  if (!match) return 0;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

/** Horas diárias do stake (planejadas + não planejadas), em minutos. */
export function computeStakeHorasDiariasMin(stake: SgpStakeItem): number {
  return (
    parseSgpHorasToMinutes(stake.horas_disponiveis) +
    parseSgpHorasToMinutes(stake.horas_nao_planejadas)
  );
}

/**
 * Total do card: (planejadas + não planejadas) × dias úteis, em minutos.
 * Ex.: 6h + 2h por dia × 10 dias = 80h.
 */
export function computeStakeCardTotalMin(stake: SgpStakeItem): number {
  const dias = stake.dias_uteis ?? 0;
  if (dias <= 0) return 0;
  return computeStakeHorasDiariasMin(stake) * dias;
}

/** Formata minutos no padrão curto do card (`5h`, `3 h 30 min`). */
export function formatMinutosComoHorasCurto(totalMin: number): string {
  if (totalMin <= 0) return "0h";
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  if (minutes === 0) return `${hours}h`;
  if (hours === 0) return `${minutes}m`;
  return `${hours} h ${minutes} min`;
}

/**
 * Valor do bloco "Total" no card: (planejadas + não planejadas) × dias úteis.
 * Exibe número inteiro de horas quando não há minutos residuais.
 */
export function formatStakeCardTotal(stake: SgpStakeItem): string {
  const totalMin = computeStakeCardTotalMin(stake);
  if (totalMin <= 0) return "0";
  if (totalMin % 60 === 0) return String(Math.floor(totalMin / 60));
  return formatMinutosComoHorasCurto(totalMin);
}

/** Exibição curta no card (ex.: `5h`, `3 h 30 min`). */
export function formatSgpHorasCurto(value: string | null | undefined): string {
  if (!value?.trim()) return "—";
  const match = value.trim().match(/\d{4}-\d{2}-\d{2}\s+(\d{1,2}):(\d{2})/);
  if (!match) return "—";
  return formatMinutosComoHorasCurto(parseSgpHorasToMinutes(value));
}

/** Total em minutos → label do rodapé (ex.: `150h`). */
export function formatHorasResumoTotais(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0h";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours} h ${minutes} min`;
}

export interface StakesHorasTotais {
  planejadasMin: number;
  naoPlanejadasMin: number;
  totalGeralMin: number;
}

export function computeStakesHorasTotais(
  stakes: SgpStakeItem[],
): StakesHorasTotais {
  let planejadasMin = 0;
  let naoPlanejadasMin = 0;

  for (const stake of stakes) {
    planejadasMin +=
      parseSgpHorasToMinutes(stake.horas_disponiveis) * stake.dias_uteis;
    naoPlanejadasMin +=
      parseSgpHorasToMinutes(stake.horas_nao_planejadas) * stake.dias_uteis;
  }

  return {
    planejadasMin,
    naoPlanejadasMin,
    totalGeralMin: planejadasMin + naoPlanejadasMin,
  };
}

export function getUsuarioIniciais(
  nome: string | null | undefined,
  usuarioId: number,
): string {
  const trimmed = nome?.trim();
  if (!trimmed) return String(usuarioId).slice(0, 2);
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export function getUsuarioNomeExibicao(
  nome: string | null | undefined,
  usuarioId: number,
): string {
  return nome?.trim() || `Usuário #${usuarioId}`;
}
