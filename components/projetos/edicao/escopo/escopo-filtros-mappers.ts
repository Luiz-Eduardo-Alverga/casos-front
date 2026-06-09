import type {
  EscopoFiltrosAplicados,
  EscopoFiltrosNuqsState,
  EscopoFiltrosNuqsUpdate,
} from "@/components/projetos/edicao/escopo/escopo-filtros-parsers";

export function filtrosQueryKey(filtros: EscopoFiltrosAplicados): string {
  return `${filtros.statusIds.join(",")}|${filtros.usuarioDevId}|${filtros.naoPlanejadoFiltro}`;
}

export function hasEscopoFiltersApplied(
  filtros: EscopoFiltrosAplicados,
): boolean {
  return (
    filtros.statusIds.length > 0 ||
    Boolean(filtros.usuarioDevId.trim()) ||
    filtros.naoPlanejadoFiltro !== "todos"
  );
}

export function nuqsStateToFiltrosAplicados(
  state: EscopoFiltrosNuqsState,
): EscopoFiltrosAplicados {
  return {
    statusIds: (state.escopo_status_id ?? [])
      .map((s) => s.trim())
      .filter(Boolean),
    usuarioDevId: state.escopo_usuario_dev_id?.trim() ?? "",
    naoPlanejadoFiltro: state.escopo_nao_planejado ?? "todos",
  };
}

export function filtrosAplicadosToNuqsState(
  filtros: EscopoFiltrosAplicados,
): EscopoFiltrosNuqsUpdate {
  const statusIds = filtros.statusIds.map((s) => s.trim()).filter(Boolean);

  return {
    escopo_usuario_dev_id: filtros.usuarioDevId.trim() || null,
    escopo_status_id: statusIds.length > 0 ? statusIds : null,
    escopo_nao_planejado:
      filtros.naoPlanejadoFiltro === "todos" ? null : filtros.naoPlanejadoFiltro,
  };
}
