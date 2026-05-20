import { parseAsArrayOf, parseAsString } from "nuqs";
import { MAX_STATUS_IDS_FILTRO_CASOS } from "@/components/casos/filtros/constants";

export const casosFiltrosParsers = {
  produto: parseAsString.withDefault(""),
  versao: parseAsString.withDefault(""),
  modulo: parseAsString.withDefault(""),
  tipo_categoria: parseAsString.withDefault(""),
  tipo_abertura: parseAsString.withDefault(""),
  descricao_resumo: parseAsString.withDefault(""),
  projeto_id: parseAsString.withDefault(""),
  usuario_abertura_id: parseAsString.withDefault(""),
  usuario_dev_id: parseAsString.withDefault(""),
  usuario_qa_id: parseAsString.withDefault(""),
  data_producao_inicio: parseAsString.withDefault(""),
  data_producao_fim: parseAsString.withDefault(""),
  status_id: parseAsArrayOf(parseAsString).withDefault([]),
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
  usuario_abertura_id: string;
  usuario_dev_id: string;
  usuario_qa_id: string;
  data_producao_inicio: string;
  data_producao_fim: string;
  status_id: string[];
};

/** Payload para `setNuqsState` (null remove o parâmetro da URL). */
export type CasosFiltrosNuqsUpdate = {
  [K in keyof CasosFiltrosNuqsState]: CasosFiltrosNuqsState[K] | null;
};
