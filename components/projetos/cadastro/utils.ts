import type {
  CreateSgpCadastroRequest,
  SgpCadastroData,
  UpdateSgpCadastroRequest,
} from "@/interfaces/sgp-cadastro";
import type { Setor } from "@/services/auxiliar/setores";
import type { SgpObjetivo } from "@/services/auxiliar/sgp-objetivos";
import { SGP_PROJETO_HIDDEN_DEFAULTS } from "@/components/projetos/cadastro/constants";
import type { ProjetoFormData } from "@/components/projetos/cadastro/schema";

/** Converte data da API SGP (`YYYY-MM-DD HH:mm:ss`) para Date (parte civil, sem deslocamento de fuso). */
export function parseSgpDateToDate(
  value: string | null | undefined,
): Date | undefined {
  if (!value?.trim()) return undefined;
  const datePart = value.trim().split(/\s+/)[0] ?? "";
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

/** Localiza objetivo no catálogo pela descrição (campo `Objetivo` da API auxiliar). */
export function findSgpObjetivoByDescricao(
  descricao: string,
  objetivos: SgpObjetivo[],
): SgpObjetivo | undefined {
  const norm = descricao.trim().toLowerCase();
  if (!norm || !objetivos.length) return undefined;
  return objetivos.find((o) => o.Objetivo?.trim().toLowerCase() === norm);
}

/** Valor do combobox: ID (`Registro`) quando conhecido; senão resolve pela descrição retornada em `objetivo`. */
export function resolveObjetivoFormValue(
  data: SgpCadastroData,
  objetivos?: SgpObjetivo[],
): string {
  if (data.objetivo_id != null && data.objetivo_id > 0) {
    return String(data.objetivo_id);
  }

  const descricao = data.objetivo?.trim();
  if (!descricao) return "";

  const found = objetivos?.length
    ? findSgpObjetivoByDescricao(descricao, objetivos)
    : undefined;
  if (found) return String(found.Registro);

  // API GET por id pode devolver só a descrição — exibe no combobox até o catálogo carregar
  return descricao;
}

export function sgpCadastroToFormValues(
  data: SgpCadastroData,
  setores?: Setor[],
  objetivos?: SgpObjetivo[],
): ProjetoFormData {
  const setorId = resolveSetorIdByNome(data.setor, setores);
  const dataInicio =
    parseSgpDateToDate(data.datas) ??
    parseSgpDateToDate(data.data_inicio);
  const dataEncerramento =
    parseSgpDateToDate(data.data_fim) ??
    parseSgpDateToDate(data.data_desativado);

  return {
    nomeProjeto: data.nome_projeto ?? "",
    dataInicio: dataInicio as Date,
    dataEncerramento,
    setor: setorId,
    tipo: data.tipo ?? "",
    usuario: data.usuario != null ? String(data.usuario) : "",
    status: data.status ?? "",
    objetivo: resolveObjetivoFormValue(data, objetivos),
    necessidades: data.necessidades ?? "",
    expectativas: data.expectativas ?? "",
  };
}

/** Formata data para PUT SGP: `YYYY-MM-DD` (fuso America/Sao_Paulo). */
export function formatDateSgp(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Formata data para API SGP: `YYYY-MM-DD 00:00:00` (fuso America/Sao_Paulo). */
export function formatDateTimeSgp(date: Date): string {
  const ymd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return `${ymd} 00:00:00`;
}

export function resolveSetorIdByNome(
  setorNome: string | undefined,
  setores: Setor[] | undefined,
): string {
  if (!setorNome?.trim() || !setores?.length) return "";
  const found = setores.find(
    (s) => s.nome.trim().toLowerCase() === setorNome.trim().toLowerCase(),
  );
  return found ? String(found.id) : "";
}

export function buildUpdateSgpAberturaPayload(
  data: ProjetoFormData,
  existing: SgpCadastroData,
): UpdateSgpCadastroRequest {
  const objetivoRaw = data.objetivo?.trim();
  let objetivoId = 0;
  if (objetivoRaw) {
    const parsed = Number(objetivoRaw);
    if (Number.isFinite(parsed) && parsed > 0) {
      objetivoId = parsed;
    }
  }

  return {
    Datas: formatDateSgp(data.dataInicio),
    DataDesativado: data.dataEncerramento
      ? formatDateSgp(data.dataEncerramento)
      : formatDateSgp(data.dataInicio),
    NomeProjeto: data.nomeProjeto.trim(),
    Necessidades: data.necessidades?.trim() ?? "",
    Expectativas: data.expectativas?.trim() ?? "",
    Tipo: data.tipo,
    Status: data.status,
    ClasseProjeto:
      existing.classe_projeto?.trim() ||
      SGP_PROJETO_HIDDEN_DEFAULTS.ClasseProjeto,
    ObjetivoID: objetivoId,
  };
}

export function buildCreateSgpProjetoPayload(
  data: ProjetoFormData,
): CreateSgpCadastroRequest {
  const objetivoId = data.objetivo?.trim()
    ? Number(data.objetivo)
    : 0;

  return {
    NomeProjeto: data.nomeProjeto.trim(),
    Datas: formatDateTimeSgp(data.dataInicio),
    DataDesativado: data.dataEncerramento
      ? formatDateTimeSgp(data.dataEncerramento)
      : formatDateTimeSgp(data.dataInicio),
    Tipo: data.tipo,
    Status: data.status,
    Usuario: Number(data.usuario),
    ObjetivoID: Number.isFinite(objetivoId) ? objetivoId : 0,
    Necessidades: data.necessidades?.trim() || undefined,
    Expectativas: data.expectativas?.trim() || undefined,
    Cliente: SGP_PROJETO_HIDDEN_DEFAULTS.Cliente,
    PDV: SGP_PROJETO_HIDDEN_DEFAULTS.PDV,
    ClasseProjeto: SGP_PROJETO_HIDDEN_DEFAULTS.ClasseProjeto,
  };
}
