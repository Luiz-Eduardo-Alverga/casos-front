/** Chaves dos campos do formulário de filtros de casos exibidos no painel de filtros. */
export type CasoFiltroField =
  | "produto"
  | "versao"
  | "status_ids"
  | "modulo"
  | "categoria"
  | "projeto_id"
  | "tipo_abertura"
  | "descricao_resumo"
  | "usuario_abertura_id"
  | "devAtribuido"
  | "qaAtribuido"
  | "data_producao_inicio"
  | "data_producao_fim";

/** Um filtro selecionado pelo usuário para exibição, com seu colSpan na grid de 5 colunas. */
export interface FiltroResumoItem {
  field: CasoFiltroField;
  colSpan: 1 | 2;
}

/** Configuração padrão dos filtros (todos os campos, espelha o layout original expandido). */
export const DEFAULT_FILTROS_RESUMO: FiltroResumoItem[] = [
  { field: "produto", colSpan: 1 },
  { field: "versao", colSpan: 1 },
  { field: "status_ids", colSpan: 2 },
  { field: "projeto_id", colSpan: 1 },
  { field: "modulo", colSpan: 1 },
  { field: "categoria", colSpan: 1 },
  { field: "descricao_resumo", colSpan: 2 },
  { field: "tipo_abertura", colSpan: 1 },
  { field: "devAtribuido", colSpan: 1 },
  { field: "qaAtribuido", colSpan: 1 },
  { field: "usuario_abertura_id", colSpan: 1 },
  { field: "data_producao_inicio", colSpan: 1 },
  { field: "data_producao_fim", colSpan: 1 },
];
