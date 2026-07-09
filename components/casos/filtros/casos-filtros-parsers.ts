import { parseAsArrayOf, parseAsString, parseAsStringLiteral } from "nuqs";
import { MAX_STATUS_IDS_FILTRO_CASOS } from "@/components/casos/filtros/constants";
import { NAO_PLANEJADO_FILTRO_OPTIONS } from "@/components/filtros/nao-planejado-filtro";

export const NAO_PLANEJADO_FILTRO_VALUES = NAO_PLANEJADO_FILTRO_OPTIONS.map(
  (opt) => opt.value,
) as [
  (typeof NAO_PLANEJADO_FILTRO_OPTIONS)[number]["value"],
  ...(typeof NAO_PLANEJADO_FILTRO_OPTIONS)[number]["value"][],
];

export const CASOS_SORT_BY_VALUES = [
  "numero_caso",
  "produto_nome",
  "prioridade",
  "data_conclusao_dev",
  "tempo_estimado",
] as const;

export const CASOS_SORT_ORDER_VALUES = ["ASC", "DESC"] as const;

export const casosFiltrosParsers = {
  produto: parseAsString.withDefault(""),
  versao: parseAsString.withDefault(""),
  modulo: parseAsString.withDefault(""),
  tipo_categoria: parseAsString.withDefault(""),
  tipo_abertura: parseAsString.withDefault(""),
  descricao_resumo: parseAsString.withDefault(""),
  projeto_id: parseAsString.withDefault(""),
  setor: parseAsString.withDefault(""),
  usuario_abertura_id: parseAsString.withDefault(""),
  usuario_dev_id: parseAsString.withDefault(""),
  usuario_qa_id: parseAsString.withDefault(""),
  data_abertura_inicio: parseAsString.withDefault(""),
  data_abertura_final: parseAsString.withDefault(""),
  data_producao_inicio: parseAsString.withDefault(""),
  data_producao_fim: parseAsString.withDefault(""),
  nao_planejado_filtro: parseAsStringLiteral(NAO_PLANEJADO_FILTRO_VALUES).withDefault(
    "todos",
  ),
  status_id: parseAsArrayOf(parseAsString).withDefault([]),
  sort_by: parseAsStringLiteral(CASOS_SORT_BY_VALUES),
  sort_order: parseAsStringLiteral(CASOS_SORT_ORDER_VALUES),
};

/** Valores lidos do nuqs (defaults aplicados). */
export type CasosFiltrosNuqsState = {
  produto: string;
  versao: string;
  modulo: string;
  tipo_categoria: string;
  tipo_abertura: string;
  descricao_resumo: string;
  projeto_id: string;
  setor: string;
  usuario_abertura_id: string;
  usuario_dev_id: string;
  usuario_qa_id: string;
  data_abertura_inicio: string;
  data_abertura_final: string;
  data_producao_inicio: string;
  data_producao_fim: string;
  nao_planejado_filtro: (typeof NAO_PLANEJADO_FILTRO_VALUES)[number];
  status_id: string[];
  sort_by: (typeof CASOS_SORT_BY_VALUES)[number] | null;
  sort_order: (typeof CASOS_SORT_ORDER_VALUES)[number] | null;
};

/** Payload para `setNuqsState` (null remove o parâmetro da URL). */
export type CasosFiltrosNuqsUpdate = {
  [K in keyof CasosFiltrosNuqsState]: CasosFiltrosNuqsState[K] | null;
};
