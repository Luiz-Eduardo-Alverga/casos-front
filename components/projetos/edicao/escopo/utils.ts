import type { ProjetoMemoriaQueryParams } from "@/hooks/casos/use-projeto-memoria";
import {
  naoPlanejadoFiltroToApiParam,
  type NaoPlanejadoFiltro,
  NAO_PLANEJADO_FILTRO_OPTIONS,
} from "@/components/filtros/nao-planejado-filtro";

export {
  isDuplicado,
  isNaoPlanejado,
  isViavel,
  mapProjetoMemoriaToTabelaRow,
} from "@/components/projetos/tabela/map-projeto-memoria-to-escopo-row";

export type EscopoNaoPlanejadoFiltro = NaoPlanejadoFiltro;

export const ESCOPO_NAO_PLANEJADO_OPTIONS = NAO_PLANEJADO_FILTRO_OPTIONS;

export { naoPlanejadoFiltroToApiParam };

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
