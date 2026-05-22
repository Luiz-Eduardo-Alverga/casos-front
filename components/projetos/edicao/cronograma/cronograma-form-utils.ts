import type {
  CreateSgpCronogramaRequest,
  SgpCronogramaItem,
  UpdateSgpCronogramaRequest,
} from "@/interfaces/sgp-cronograma";
import type { SgpTipo } from "@/services/auxiliar/sgp-tipos";
import type { Usuario } from "@/services/auxiliar/usuarios";
import { parseSgpDateToDate } from "@/components/projetos/cadastro/utils";
import {
  formatHorasInputToSgpIso,
  formatMinutesToHorasInput,
} from "@/components/projetos/edicao/stakes/stake-form-utils";
import { parseSgpHorasToMinutes } from "@/components/projetos/edicao/stakes/utils";
import { CRONOGRAMA_PAPEL_BADGE_CONFIG } from "@/components/projetos/edicao/cronograma/cronograma-papel-badge-config";
import type { CronogramaFormValues } from "@/components/projetos/edicao/cronograma/cronograma-form-schema";

const PAPEL_KEYS = CRONOGRAMA_PAPEL_BADGE_CONFIG.flatMap((c) => c.keys).filter(
  Boolean,
);

/** Monta ISO para a API usando a data civil selecionada (sem deslocar via UTC). */
function formatSgpDateTimeForApi(date: Date, mode: "start" | "end"): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return mode === "start"
    ? `${y}-${m}-${d}T00:00:00.000Z`
    : `${y}-${m}-${d}T23:59:59.999Z`;
}

function sgpDateTimeExistenteToIso(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) return null;
  const parsed = parseSgpDateToDate(value);
  if (!parsed) return null;
  return formatSgpDateTimeForApi(parsed, "start");
}

/** Resolve id do colaborador pelo nome retornado em `objetivo_quem` (edição). */
export function resolveColaboradorFromObjetivoQuem(
  objetivoQuem: string,
  usuarios: Usuario[],
): { colaboradorId: string; colaboradorLabel: string } | null {
  const nome = objetivoQuem.trim();
  if (!nome || !usuarios.length) return null;

  const norm = nome.toLowerCase();
  const match = usuarios.find(
    (u) => u.nome_suporte?.trim().toLowerCase() === norm,
  );
  if (!match) return null;

  return {
    colaboradorId: String(match.id),
    colaboradorLabel: match.nome_suporte.trim(),
  };
}

function matchesPapelLabel(nomes: string): boolean {
  const key = nomes.trim().toUpperCase();
  if (!key) return false;
  return PAPEL_KEYS.some((p) => key === p || key.includes(p));
}

export function buildTarefaTipoOptions(tipos: SgpTipo[]) {
  const items = tipos
    .map((t) => {
      const id = Number(t.Registro);
      const ordem = Number(t.CronogramaOrdem?.trim());
      const nomes = t.Nomes?.trim() || "";
      if (!Number.isFinite(id) || !nomes) return null;
      const ordemLabel = t.CronogramaOrdem?.trim();
      const label =
        ordemLabel && !/^\d+\s*-\s*/.test(nomes)
          ? `${ordemLabel} - ${nomes}`
          : nomes;
      return {
        value: String(id),
        label,
        ordem: Number.isFinite(ordem) ? ordem : Number.POSITIVE_INFINITY,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  return items
    .sort((a, b) => a.ordem - b.ordem || a.label.localeCompare(b.label))
    .map(({ value, label }) => ({ value, label }));
}

export function buildPapelOptions(tipos: SgpTipo[]) {
  const items = tipos
    .map((t) => {
      const id = Number(t.Registro);
      const label = t.Nomes?.trim() || "";
      if (!Number.isFinite(id) || !label) return null;
      if (!matchesPapelLabel(label)) return null;
      return { value: String(id), label };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);

  return items.sort((a, b) => a.label.localeCompare(b.label));
}

export function cronogramaToFormValues(
  item: SgpCronogramaItem,
): CronogramaFormValues {
  return {
    idPapel: String(item.id_papel),
    idTipo: String(item.id_tipo),
    colaboradorId: "",
    colaboradorLabel: item.objetivo_quem?.trim() ?? "",
    horaPrevista: formatMinutesToHorasInput(
      parseSgpHorasToMinutes(item.hora_prevista),
    ),
    dataInicio: parseSgpDateToDate(item.data_inicio),
    dataTermino: parseSgpDateToDate(item.data_termino),
    dataRealizacao: parseSgpDateToDate(item.hora_realizada),
    observacao: item.observacao?.trim() ?? "",
  };
}

function buildCronogramaPayloadBase(
  values: CronogramaFormValues,
  projetoId: number | string,
  existente?: SgpCronogramaItem,
): CreateSgpCronogramaRequest {
  const dataInicio = values.dataInicio!;
  const dataTermino = values.dataTermino!;

  const horaRealizada = values.dataRealizacao
    ? formatSgpDateTimeForApi(values.dataRealizacao, "start")
    : existente
      ? sgpDateTimeExistenteToIso(existente.hora_realizada)
      : null;

  return {
    Registro: Number(projetoId),
    Dias: existente?.dias ?? 0,
    Id_Tipo: Number(values.idTipo),
    Observacao: values.observacao?.trim() || null,
    Horas: existente?.horas ?? 0,
    Concluido: existente?.concluido ?? false,
    ObjetivoQuem: values.colaboradorLabel?.trim() || values.colaboradorId.trim(),
    HoraPrevista: formatHorasInputToSgpIso(values.horaPrevista),
    DataInicio: formatSgpDateTimeForApi(dataInicio, "start"),
    DataTermino: formatSgpDateTimeForApi(dataTermino, "end"),
    HoraRealizada: horaRealizada,
    Id_Papel: Number(values.idPapel),
    NaoGerarOcorrencia: existente?.nao_gerar_ocorrencia ?? 0,
  };
}

export function buildCreateSgpCronogramaPayload(
  values: CronogramaFormValues,
  projetoId: number | string,
): CreateSgpCronogramaRequest {
  return buildCronogramaPayloadBase(values, projetoId);
}

export function buildUpdateSgpCronogramaPayload(
  values: CronogramaFormValues,
  projetoId: number | string,
  existente: SgpCronogramaItem,
): UpdateSgpCronogramaRequest {
  return buildCronogramaPayloadBase(values, projetoId, existente);
}

/** Payload PUT para conclusão da tarefa (Concluido = true + data/observação informadas). */
export function buildConcluirSgpCronogramaPayload(
  item: SgpCronogramaItem,
  dataRealizacao: Date,
  observacao: string,
): UpdateSgpCronogramaRequest {
  const dataInicio = parseSgpDateToDate(item.data_inicio);
  const dataTermino = parseSgpDateToDate(item.data_termino);

  return {
    Registro: item.registro,
    Dias: item.dias,
    Id_Tipo: item.id_tipo,
    Observacao: observacao.trim() || item.observacao || null,
    Horas: item.horas,
    Concluido: true,
    ObjetivoQuem: item.objetivo_quem?.trim() ?? "",
    HoraPrevista: formatHorasInputToSgpIso(
      formatMinutesToHorasInput(parseSgpHorasToMinutes(item.hora_prevista)),
    ),
    DataInicio: dataInicio
      ? formatSgpDateTimeForApi(dataInicio, "start")
      : formatSgpDateTimeForApi(dataRealizacao, "start"),
    DataTermino: dataTermino
      ? formatSgpDateTimeForApi(dataTermino, "end")
      : formatSgpDateTimeForApi(dataRealizacao, "end"),
    HoraRealizada: formatSgpDateTimeForApi(dataRealizacao, "start"),
    Id_Papel: item.id_papel,
    NaoGerarOcorrencia: item.nao_gerar_ocorrencia,
  };
}
