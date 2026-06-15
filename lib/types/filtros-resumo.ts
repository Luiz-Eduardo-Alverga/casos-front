/** Chaves dos campos do formulário de filtros de casos que podem aparecer na visão resumida. */
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

/** Um filtro selecionado pelo usuário para exibição na visão resumida, com seu colSpan na grid de 5 colunas. */
export interface FiltroResumoItem {
  field: CasoFiltroField;
  colSpan: 1 | 2;
}

/** Configuração padrão dos filtros resumidos (espelha o estado hardcoded original). */
export const DEFAULT_FILTROS_RESUMO: FiltroResumoItem[] = [
  { field: "produto", colSpan: 1 },
  { field: "versao", colSpan: 1 },
  { field: "status_ids", colSpan: 2 },
];
