import { MAX_STATUS_IDS_FILTRO_CASOS } from "@/components/casos/filtros/constants";
import type { Setor } from "@/services/auxiliar/setores";
import {
  DEFAULT_REPORTS_STATUS_IDS,
  type ReportsFiltersForm,
  type ReportsFiltrosAplicados,
} from "@/components/reports/types";
import type {
  ReportsFiltrosNuqsState,
  ReportsFiltrosNuqsUpdate,
} from "@/components/reports/filtros/reports-filtros-parsers";

function normalizeStatusIds(statusIds: string[] | undefined): string[] {
  const normalized = (statusIds ?? [])
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_STATUS_IDS_FILTRO_CASOS);

  return normalized.length > 0 ? normalized : [...DEFAULT_REPORTS_STATUS_IDS];
}

function isDefaultStatusIds(statusIds: string[]): boolean {
  return (
    statusIds.length === DEFAULT_REPORTS_STATUS_IDS.length &&
    statusIds.every(
      (id, index) => id === DEFAULT_REPORTS_STATUS_IDS[index],
    )
  );
}

export function filtrosQueryKey(filtros: ReportsFiltrosAplicados): string {
  return `${filtros.setor}|${filtros.produto}|${filtros.status_ids.join(",")}`;
}

export function hasFiltersApplied(filtros: ReportsFiltrosAplicados): boolean {
  return Boolean(
    filtros.setor?.trim() ||
      filtros.produto?.trim() ||
      !isDefaultStatusIds(filtros.status_ids),
  );
}

export function nuqsStateToFiltrosAplicados(
  state: ReportsFiltrosNuqsState,
): ReportsFiltrosAplicados {
  return {
    setor: state.setor?.trim() ?? "",
    produto: state.produto?.trim() ?? "",
    status_ids: normalizeStatusIds(state.status_id),
  };
}

export function filtrosAplicadosToNuqsState(
  filtros: ReportsFiltrosAplicados,
): ReportsFiltrosNuqsUpdate {
  const statusIds = normalizeStatusIds(filtros.status_ids);

  return {
    setor: filtros.setor?.trim() || null,
    produto: filtros.produto?.trim() || null,
    status_id: isDefaultStatusIds(statusIds) ? null : statusIds,
  };
}

export function filtrosToFormDefaults(
  filtros: ReportsFiltrosAplicados,
): ReportsFiltersForm {
  return {
    setor: filtros.setor ?? "",
    produto: filtros.produto ?? "",
    status_ids: [...normalizeStatusIds(filtros.status_ids)],
  };
}

export function formToFiltrosAplicados(
  form: ReportsFiltersForm,
): ReportsFiltrosAplicados {
  return {
    setor: form.setor?.trim() ?? "",
    produto: form.produto?.trim() ?? "",
    status_ids: normalizeStatusIds(form.status_ids),
  };
}

export function resolveSetorNome(
  setorId: string,
  setores: Setor[] | undefined,
): string | undefined {
  if (!setorId?.trim()) return undefined;
  const found = setores?.find((s) => String(s.id) === setorId.trim());
  return found?.nome?.trim();
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
