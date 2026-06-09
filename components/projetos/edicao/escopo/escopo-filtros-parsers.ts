import { parseAsArrayOf, parseAsString, parseAsStringLiteral } from "nuqs";
import type { EscopoNaoPlanejadoFiltro } from "@/components/projetos/edicao/escopo/utils";

export const ESCOPO_NAO_PLANEJADO_VALUES = [
  "todos",
  "planejado",
  "nao_planejado",
] as const satisfies readonly EscopoNaoPlanejadoFiltro[];

export const escopoFiltrosParsers = {
  escopo_usuario_dev_id: parseAsString.withDefault(""),
  escopo_status_id: parseAsArrayOf(parseAsString).withDefault([]),
  escopo_nao_planejado: parseAsStringLiteral(ESCOPO_NAO_PLANEJADO_VALUES).withDefault(
    "todos",
  ),
};

export type EscopoFiltrosNuqsState = {
  escopo_usuario_dev_id: string;
  escopo_status_id: string[];
  escopo_nao_planejado: EscopoNaoPlanejadoFiltro;
};

export type EscopoFiltrosNuqsUpdate = {
  [K in keyof EscopoFiltrosNuqsState]: EscopoFiltrosNuqsState[K] | null;
};

export interface EscopoFiltrosAplicados {
  statusIds: string[];
  usuarioDevId: string;
  naoPlanejadoFiltro: EscopoNaoPlanejadoFiltro;
}
