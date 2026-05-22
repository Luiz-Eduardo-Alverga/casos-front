import type {
  CreateSgpStakeRequest,
  UpdateSgpStakeRequest,
} from "@/interfaces/sgp-stake";
import type { SgpStakeItem } from "@/interfaces/sgp-stake";
import { maskHHMM } from "@/components/caso-edit/producao/utils";
import type { StakeFormValues } from "@/components/projetos/edicao/stakes/stake-form-schema";
import { parseSgpHorasToMinutes } from "@/components/projetos/edicao/stakes/utils";

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

export function maskStakeHorasInput(value: string): string {
  return maskHHMM(value);
}

export function stakeToFormValues(stake: SgpStakeItem): StakeFormValues {
  return {
    colaboradorId: String(stake.suporte_id),
    colaboradorLabel: stake.nomes?.trim() ?? "",
    idTipo: String(stake.id_tipo),
    diasUteis: stake.dias_uteis ?? 1,
    horasPlanejadas: formatMinutesToHorasInput(
      parseSgpHorasToMinutes(stake.horas_disponiveis),
    ),
    horasNaoPlanejadas: formatMinutesToHorasInput(
      parseSgpHorasToMinutes(stake.horas_nao_planejadas),
    ),
  };
}

/** Preserva horas de risco e metadados do registro existente na edição. */
function sgpHorasExistenteToIso(value: string | null | undefined): string {
  const min = parseSgpHorasToMinutes(value);
  return formatHorasInputToSgpIso(formatMinutesToHorasInput(min));
}

export function buildCreateSgpStakePayload(
  values: StakeFormValues,
  projetoId: number | string,
  colaboradorNome: string,
): CreateSgpStakeRequest {
  const registro = Number(projetoId);
  const suporteId = Number(values.colaboradorId);
  const idTipo = Number(values.idTipo);

  return {
    Registro: registro,
    Caracteristica: "STAKEHOLDERS",
    Id_Tipo: idTipo,
    Nomes: colaboradorNome.trim(),
    HorasDisponiveis: formatHorasInputToSgpIso(values.horasPlanejadas),
    Suporte_id: suporteId,
    DiasUteis: values.diasUteis,
    HorasRisco: formatHorasInputToSgpIso("00:00"),
    HorasNaoPlanejadas: formatHorasInputToSgpIso(values.horasNaoPlanejadas),
    ProjetoAprovado: 0,
    Observacoes: null,
    OcorrenciaGerada: 0,
  };
}

export function buildUpdateSgpStakePayload(
  values: StakeFormValues,
  projetoId: number | string,
  colaboradorNome: string,
  stakeExistente: SgpStakeItem,
): UpdateSgpStakeRequest {
  const base = buildCreateSgpStakePayload(values, projetoId, colaboradorNome);
  return {
    ...base,
    HorasRisco: sgpHorasExistenteToIso(stakeExistente.horas_risco),
    ProjetoAprovado: stakeExistente.projeto_aprovado ?? 0,
    Observacoes: stakeExistente.observacoes ?? null,
    OcorrenciaGerada: stakeExistente.ocorrencia_gerada ?? 0,
  };
}
