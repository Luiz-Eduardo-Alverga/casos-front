import type { Setor } from "@/services/auxiliar/setores";
import type { GetSgpCadastrosParams } from "@/services/sgp-cadastros/get-sgp-cadastros";
import type {
  ProjetoStatusFiltro,
  ProjetosFiltersForm,
  ProjetosFiltrosAplicados,
} from "@/components/projetos/filtros/projetos-filtros.types";
import type {
  ProjetosFiltrosNuqsState,
  ProjetosFiltrosNuqsUpdate,
} from "@/components/projetos/filtros/projetos-filtros-parsers";

const MES_REGEX = /^(\d{4})-(0[1-9]|1[0-2])$/;

function normalizarStatus(valor: string | null | undefined): ProjetoStatusFiltro {
  const v = (valor ?? "").trim().toUpperCase();
  return v === "ABERTO" || v === "FECHADO" ? v : "";
}

function normalizarMes(valor: string | null | undefined): string {
  const v = (valor ?? "").trim();
  return MES_REGEX.test(v) ? v : "";
}

function normalizar(filtros: Partial<ProjetosFiltrosNuqsState>): ProjetosFiltrosAplicados {
  return {
    registro: filtros.registro?.trim() ?? "",
    nome: filtros.nome?.trim() ?? "",
    setor: filtros.setor?.trim() ?? "",
    status: normalizarStatus(filtros.status),
    mes: normalizarMes(filtros.mes),
    objetivo: filtros.objetivo?.trim() ?? "",
  };
}

/** Mês `AAAA-MM` de uma data (mês atual do navegador por padrão, decisão #37). */
export function mesDaData(data: Date = new Date()): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

/** `AAAA-MM` → 1º e último dia do mês em `AAAA-MM-DD` (decisão #32); `null` se inválido. */
export function mesParaIntervalo(
  mes: string,
): { data_inicio: string; data_fim: string } | null {
  const match = mes.trim().match(MES_REGEX);
  if (!match) return null;
  const ano = Number(match[1]);
  const mesNumero = Number(match[2]);
  const ultimoDia = new Date(ano, mesNumero, 0).getDate();
  return {
    data_inicio: `${match[1]}-${match[2]}-01`,
    data_fim: `${match[1]}-${match[2]}-${String(ultimoDia).padStart(2, "0")}`,
  };
}

export function filtrosQueryKey(filtros: ProjetosFiltrosAplicados): string {
  return [
    filtros.registro,
    filtros.nome,
    filtros.setor,
    filtros.status,
    filtros.mes,
    filtros.objetivo,
  ].join("|");
}

/** Quantos filtros estão preenchidos (selo "N filtros aplicados"). */
export function contarFiltrosAplicados(filtros: ProjetosFiltrosAplicados): number {
  const f = normalizar(filtros);
  return [f.registro, f.nome, f.setor, f.status, f.mes, f.objetivo].filter(Boolean).length;
}

export function hasFiltersApplied(filtros: ProjetosFiltrosAplicados): boolean {
  return contarFiltrosAplicados(filtros) > 0;
}

export function nuqsStateToFiltrosAplicados(
  state: ProjetosFiltrosNuqsState,
): ProjetosFiltrosAplicados {
  return normalizar(state);
}

export function filtrosAplicadosToNuqsState(
  filtros: ProjetosFiltrosAplicados,
): ProjetosFiltrosNuqsUpdate {
  const f = normalizar(filtros);
  return {
    registro: f.registro || null,
    nome: f.nome || null,
    setor: f.setor || null,
    status: f.status || null,
    mes: f.mes || null,
    objetivo: f.objetivo || null,
  };
}

export function filtrosToFormDefaults(
  filtros: ProjetosFiltrosAplicados,
): ProjetosFiltersForm {
  return normalizar(filtros);
}

export function formToFiltrosAplicados(
  form: ProjetosFiltersForm,
): ProjetosFiltrosAplicados {
  return normalizar(form);
}

export function resolveSetorNome(
  setorId: string,
  setores: Setor[] | undefined,
): string | undefined {
  if (!setorId?.trim()) return undefined;
  const found = setores?.find((s) => String(s.id) === setorId.trim());
  return found?.nome;
}

export function filtrosToSgpCadastrosParams(
  filtros: ProjetosFiltrosAplicados,
  setores: Setor[] | undefined,
): GetSgpCadastrosParams | null {
  const f = normalizar(filtros);
  if (!hasFiltersApplied(f)) return null;

  const setorNome = resolveSetorNome(f.setor, setores);
  if (f.setor && !setorNome) return null;

  const params: GetSgpCadastrosParams = { per_page: 15 };
  if (setorNome) params.setor = setorNome;
  if (f.registro) params.registro = f.registro;
  if (f.nome) params.nome_projeto = f.nome;
  if (f.status) params.status = f.status;
  const intervalo = f.mes ? mesParaIntervalo(f.mes) : null;
  if (intervalo) {
    params.data_inicio = intervalo.data_inicio;
    params.data_fim = intervalo.data_fim;
  }
  if (f.objetivo) params.objetivo_id = f.objetivo;

  return params;
}

export function canFetchSgpCadastros(
  filtros: ProjetosFiltrosAplicados,
  setores: Setor[] | undefined,
): boolean {
  return filtrosToSgpCadastrosParams(filtros, setores) != null;
}
