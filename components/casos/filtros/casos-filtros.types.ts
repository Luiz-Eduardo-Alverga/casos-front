import type { CasoFiltroField, FiltroResumoItem } from "@/lib/types/filtros-resumo";
import { DEFAULT_FILTROS_RESUMO } from "@/lib/types/filtros-resumo";

export type { CasoFiltroField, FiltroResumoItem };
export { DEFAULT_FILTROS_RESUMO };

export const FILTROS_RESUMO_CATALOGO: Array<{
  field: CasoFiltroField;
  label: string;
  tipo: "Texto" | "Seleção" | "Múltiplo";
  defaultColSpan: 1 | 2;
}> = [
  { field: "produto",              label: "Produto",            tipo: "Seleção",  defaultColSpan: 1 },
  { field: "versao",               label: "Versão do Produto",  tipo: "Seleção",  defaultColSpan: 1 },
  { field: "status_ids",           label: "Status",             tipo: "Múltiplo", defaultColSpan: 2 },
  { field: "modulo",               label: "Módulo",             tipo: "Seleção",  defaultColSpan: 1 },
  { field: "categoria",            label: "Categoria",          tipo: "Seleção",  defaultColSpan: 1 },
  { field: "projeto_id",           label: "Projeto",            tipo: "Seleção",  defaultColSpan: 1 },
  { field: "tipo_abertura",        label: "Tipo de Abertura",   tipo: "Seleção",  defaultColSpan: 1 },
  { field: "descricao_resumo",     label: "Descrição / Resumo", tipo: "Texto",    defaultColSpan: 2 },
  { field: "usuario_abertura_id",  label: "Quem abriu",         tipo: "Seleção",  defaultColSpan: 1 },
  { field: "devAtribuido",         label: "Desenvolvedor",      tipo: "Seleção",  defaultColSpan: 1 },
  { field: "qaAtribuido",          label: "QA",                 tipo: "Seleção",  defaultColSpan: 1 },
  { field: "data_producao_inicio", label: "Produção (início)",  tipo: "Seleção",  defaultColSpan: 1 },
  { field: "data_producao_fim",    label: "Produção (fim)",     tipo: "Seleção",  defaultColSpan: 1 },
];

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
