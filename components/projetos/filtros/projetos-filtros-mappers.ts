import type { Setor } from "@/services/auxiliar/setores";
import type { GetSgpCadastrosParams } from "@/services/sgp-cadastros/get-sgp-cadastros";
import type {
  ProjetosFiltersForm,
  ProjetosFiltrosAplicados,
} from "@/components/projetos/filtros/projetos-filtros.types";
import type {
  ProjetosFiltrosNuqsState,
  ProjetosFiltrosNuqsUpdate,
} from "@/components/projetos/filtros/projetos-filtros-parsers";

export function filtrosQueryKey(filtros: ProjetosFiltrosAplicados): string {
  return `${filtros.registro}|${filtros.setor}|${filtros.objetivo}`;
}

export function hasFiltersApplied(filtros: ProjetosFiltrosAplicados): boolean {
  return Boolean(
    filtros.registro?.trim() ||
      filtros.setor?.trim() ||
      filtros.objetivo?.trim(),
  );
}

export function nuqsStateToFiltrosAplicados(
  state: ProjetosFiltrosNuqsState,
): ProjetosFiltrosAplicados {
  return {
    registro: state.registro?.trim() ?? "",
    setor: state.setor?.trim() ?? "",
    objetivo: state.objetivo?.trim() ?? "",
  };
}

export function filtrosAplicadosToNuqsState(
  filtros: ProjetosFiltrosAplicados,
): ProjetosFiltrosNuqsUpdate {
  return {
    registro: filtros.registro || null,
    setor: filtros.setor || null,
    objetivo: filtros.objetivo || null,
  };
}

export function filtrosToFormDefaults(
  filtros: ProjetosFiltrosAplicados,
): ProjetosFiltersForm {
  return {
    registro: filtros.registro ?? "",
    setor: filtros.setor ?? "",
    objetivo: filtros.objetivo ?? "",
  };
}

export function formToFiltrosAplicados(
  form: ProjetosFiltersForm,
): ProjetosFiltrosAplicados {
  return {
    registro: form.registro?.trim() ?? "",
    setor: form.setor?.trim() ?? "",
    objetivo: form.objetivo?.trim() ?? "",
  };
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
  if (!hasFiltersApplied(filtros)) return null;

  const setorNome = resolveSetorNome(filtros.setor, setores);
  if (filtros.setor?.trim() && !setorNome) return null;

  const params: GetSgpCadastrosParams = { per_page: 15 };
  if (setorNome) params.setor = setorNome;
  if (filtros.registro?.trim()) params.registro = filtros.registro.trim();
  if (filtros.objetivo?.trim()) {
    params.objetivo_id = filtros.objetivo.trim();
  }

  return params;
}

export function canFetchSgpCadastros(
  filtros: ProjetosFiltrosAplicados,
  setores: Setor[] | undefined,
): boolean {
  return filtrosToSgpCadastrosParams(filtros, setores) != null;
}
