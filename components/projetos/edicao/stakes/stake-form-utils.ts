import type {
  CreateSgpStakeRequest,
  SgpStakeItem,
  UpdateSgpStakeRequest,
} from "@/interfaces/sgp-stake";
import { maskHHMM } from "@/components/casos/edicao/producao/utils";
import { parseSgpHorasToMinutes } from "@/components/projetos/edicao/stakes/utils";
import type { StakeLinha } from "@/components/projetos/edicao/stakes/stakes-lista.types";

const SGP_HORAS_BASE_DATE = "1899-12-30";

/** Converte minutos SGP para input `HH:mm`. */
export function formatMinutesToHorasInput(minutes: number): string {
  const h = Math.floor(Math.max(0, minutes) / 60);
  const m = Math.max(0, minutes) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Converte `HH:mm` para datetime ISO aceito pelo POST (base 1899-12-30, como retornos GET). */
export function formatHorasInputToSgpIso(hhmm: string): string {
  const match = hhmm.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return `${SGP_HORAS_BASE_DATE}T00:00:00.000Z`;
  const hour = match[1].padStart(2, "0");
  const min = match[2].padStart(2, "0");
  return `${SGP_HORAS_BASE_DATE}T${hour}:${min}:00.000Z`;
}

/** Máscara `HH:MM` (também usada no Cronograma). */
export function maskStakeHorasInput(value: string): string {
  return maskHHMM(value);
}

/** Preserva horas de risco e metadados do registro existente na edição. */
function sgpHorasExistenteToIso(value: string | null | undefined): string {
  const min = parseSgpHorasToMinutes(value);
  return formatHorasInputToSgpIso(formatMinutesToHorasInput(min));
}

/** Linha validada → POST `/sgp-stakes`. `ProjetoAprovado` vai 0 (decisão #17). */
export function linhaToCreatePayload(
  linha: StakeLinha,
  projetoId: number | string,
): CreateSgpStakeRequest {
  const observacao = linha.observacao.trim();
  return {
    Registro: Number(projetoId),
    Caracteristica: "STAKEHOLDERS",
    Id_Tipo: Number(linha.idTipo),
    Nomes: linha.colaboradorLabel.trim(),
    HorasDisponiveis: formatHorasInputToSgpIso(linha.planejada),
    Suporte_id: Number(linha.colaboradorId),
    DiasUteis: Number(linha.dias),
    HorasRisco: formatHorasInputToSgpIso("00:00"),
    HorasNaoPlanejadas: formatHorasInputToSgpIso(linha.naoPlanejada),
    ProjetoAprovado: 0,
    Observacoes: observacao || null,
    OcorrenciaGerada: 0,
  };
}

/**
 * Linha validada → PUT `/sgp-stakes/{sequencia}`. Preserva horas de risco, `ProjetoAprovado` e
 * ocorrência gerada do registro gravado; a observação vem da linha (decisão #17).
 */
export function linhaToUpdatePayload(
  linha: StakeLinha,
  projetoId: number | string,
  original: SgpStakeItem,
): UpdateSgpStakeRequest {
  return {
    ...linhaToCreatePayload(linha, projetoId),
    HorasRisco: sgpHorasExistenteToIso(original.horas_risco),
    ProjetoAprovado: original.projeto_aprovado ?? 0,
    OcorrenciaGerada: original.ocorrencia_gerada ?? 0,
  };
}
