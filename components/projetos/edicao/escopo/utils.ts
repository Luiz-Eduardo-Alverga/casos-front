import type { ProjetoMemoriaQueryParams } from "@/hooks/casos/use-projeto-memoria";

export {
  isDuplicado,
  isNaoPlanejado,
  isViavel,
  mapProjetoMemoriaToTabelaRow,
} from "@/components/projetos/tabela/map-projeto-memoria-to-escopo-row";

export type EscopoNaoPlanejadoFiltro = "todos" | "planejado" | "nao_planejado";

export const ESCOPO_NAO_PLANEJADO_OPTIONS = [
  { value: "todos" as const, label: "Todos" },
  { value: "planejado" as const, label: "Planejado" },
  { value: "nao_planejado" as const, label: "Não planejados" },
] as const;

export function naoPlanejadoFiltroToApiParam(
  filtro: EscopoNaoPlanejadoFiltro,
): boolean | undefined {
  if (filtro === "todos") return undefined;
  if (filtro === "planejado") return false;
  return true;
}

export function buildEscopoMemoriaParams(
  projetoId: number | string,
  statusIds: string[],
  usuarioDevId: string,
  naoPlanejadoFiltro: EscopoNaoPlanejadoFiltro = "todos",
  duplicado: "TRUE" | "FALSE" | "TODOS" = "TODOS",
): ProjetoMemoriaQueryParams {
  const naoPlanejado = naoPlanejadoFiltroToApiParam(naoPlanejadoFiltro);

  return {
    per_page: 15,
    projeto_id: String(projetoId),
    duplicado,
    ...(statusIds.length > 0 ? { status_id: statusIds } : {}),
    ...(usuarioDevId.trim() ? { usuario_dev_id: usuarioDevId.trim() } : {}),
    ...(naoPlanejado !== undefined ? { nao_planejado: naoPlanejado } : {}),
  };
}
