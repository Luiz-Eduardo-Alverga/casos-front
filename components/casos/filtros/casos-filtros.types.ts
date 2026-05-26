export interface CasosFiltrosAplicados {
  produto: string;
  versao: string;
  modulo: string;
  tipo_categoria: string;
  tipo_abertura: string;
  descricao_resumo: string;
  status_ids: string[];
  projeto_id: string;
  usuario_abertura_id: string;
  usuario_dev_id: string;
  usuario_qa_id: string;
  data_producao_inicio: string;
  data_producao_fim: string;
}

export interface CasosFiltersForm {
  produto: string;
  versao: string;
  modulo: string;
  categoria: string;
  tipo_abertura: "" | "CASO" | "REPORT";
  descricao_resumo: string;
  projeto_id: string;
  status_ids: string[];
  usuario_abertura_id: string;
  devAtribuido: string;
  qaAtribuido: string;
  data_producao_inicio: Date | undefined;
  data_producao_fim: Date | undefined;
}

export const EMPTY_CASOS_FILTERS_FORM: CasosFiltersForm = {
  produto: "",
  versao: "",
  modulo: "",
  categoria: "",
  tipo_abertura: "",
  descricao_resumo: "",
  projeto_id: "",
  status_ids: [],
  usuario_abertura_id: "",
  devAtribuido: "",
  qaAtribuido: "",
  data_producao_inicio: undefined,
  data_producao_fim: undefined,
};

export const EMPTY_CASOS_FILTROS: CasosFiltrosAplicados = {
  produto: "",
  versao: "",
  modulo: "",
  tipo_categoria: "",
  tipo_abertura: "",
  descricao_resumo: "",
  status_ids: [],
  projeto_id: "",
  usuario_abertura_id: "",
  usuario_dev_id: "",
  usuario_qa_id: "",
  data_producao_inicio: "",
  data_producao_fim: "",
};

/** Chaves dos filtros exibidos apenas na visão expandida do card. */
export const CASOS_FILTROS_EXPANDIDOS_KEYS = [
  "projeto_id",
  "usuario_dev_id",
  "usuario_qa_id",
  "data_producao_inicio",
  "data_producao_fim",
  "tipo_abertura",
] as const satisfies ReadonlyArray<keyof CasosFiltrosAplicados>;
