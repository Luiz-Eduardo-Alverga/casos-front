/** Versão vinculada a um registro de liberação */
export interface LiberacaoVersao {
  sequencia: number;
  registro: number;
  versao: string;
}

/** Item retornado por GET /sprint/liberacoes */
export interface LiberacaoItem {
  registro: number;
  produto_id: number;
  datas: string;
  tipo_liberacao: string;
  status: string;
  liberacao: string;
  observacao: string | null;
  link_video: string | null;
  link_pdf: string | null;
  previsao_liberacao: string | null;
  previsao_piloto: string | null;
  piloto_data_prevista: string | null;
  piloto_data_liberacao: string | null;
  versao_final_data_prevista: string | null;
  versao_final_data_liberacao: string | null;
  melhorias_data_inicial: string | null;
  melhorias_data_final: string | null;
  gerar_ocorrencias_liberacao: boolean;
  url_versao_piloto: string | null;
  ja_liberado: boolean;
  versoes: LiberacaoVersao[];
}

export interface LiberacaoPagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

/** Resposta bruta da API externa */
export interface LiberacoesApiResponse {
  data: LiberacaoItem[];
  next_cursor: string | null;
  prev_cursor: string | null;
}

/** Resposta normalizada para hooks e UI */
export interface LiberacoesResponse {
  success: boolean;
  data: LiberacaoItem[];
  pagination: LiberacaoPagination;
}

export interface GetLiberacoesParams {
  produto_id?: string | number;
  status?: string;
  tipo_liberacao?: string;
  versao?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc" | string;
  per_page?: number;
  cursor?: string | null;
}

/** Resposta de GET /sprint/liberacoes/{registro} */
export interface LiberacaoByRegistroResponse {
  data: LiberacaoItem;
}

/** Body de POST /sprint/liberacoes */
export interface CreateLiberacaoRequest {
  produto_id: number;
  tipo_liberacao: string;
  status: string;
  versao_final_data_prevista?: string | null;
  observacao?: string | null;
  versoes: string[];
}

/** Resposta de POST /sprint/liberacoes */
export type CreateLiberacaoResponse = LiberacaoByRegistroResponse;

/** Body de PATCH /sprint/liberacoes/{registro} */
export interface UpdateLiberacaoRequest {
  produto_id?: number;
  tipo_liberacao?: string;
  status?: string;
  observacao?: string | null;
  link_video?: string | null;
  link_pdf?: string | null;
  previsao_liberacao?: string | null;
  previsao_piloto?: string | null;
  piloto_data_prevista?: string | null;
  piloto_data_liberacao?: string | null;
  versao_final_data_prevista?: string | null;
  versao_final_data_liberacao?: string | null;
  melhorias_data_inicial?: string | null;
  melhorias_data_final?: string | null;
  gerar_ocorrencias_liberacao?: boolean;
  url_versao_piloto?: string | null;
  versoes?: string[];
}

/** Resposta de PATCH /sprint/liberacoes/{registro} */
export type UpdateLiberacaoResponse = LiberacaoByRegistroResponse;

/** Body de PUT /sprint/liberacoes/{registro} (fechar) */
export interface FecharLiberacaoRequest {
  status: string;
  versao_final_data_liberacao: string;
}

/** Resposta de PUT /sprint/liberacoes/{registro} */
export type FecharLiberacaoResponse = LiberacaoByRegistroResponse;

/** Body de POST /sprint/liberacoes/{registro}/versoes */
export interface AddLiberacaoVersoesRequest {
  versoes: string[];
}

/** Resposta de POST /sprint/liberacoes/{registro}/versoes */
export interface AddLiberacaoVersoesResponse {
  data: {
    adicionadas: LiberacaoVersao[];
    liberacao: LiberacaoItem;
  };
}

/** Resposta normalizada de DELETE /sprint/liberacoes/{registro}/versoes/{sequencia} (API retorna 204) */
export interface DeleteLiberacaoVersaoResponse {
  success: boolean;
  message?: string;
}

/** Resposta normalizada de DELETE /sprint/liberacoes/{registro} (API retorna 204) */
export interface DeleteLiberacaoResponse {
  success: boolean;
  message?: string;
}

/** Item de caso retornado por GET /sprint/liberacoes/{registro}/itens */
export interface LiberacaoCasoItem {
  caso_id: number;
  datas: string;
  prioridade: number;
  nome_produto: string;
  versao: string;
  descricao_resumo: string | null;
  modulo: string | null;
  faq: string | null;
  tempo_estimado: string | null;
  estado_id: number;
  estado: string;
  resolucao_id: number;
  resolucao: string;
  colaborador_id: number;
  cronograma_id: number;
  status_tempo: string;
  passos_para_reproduzir: string | null;
  liberacao: boolean;
  produto_id: number;
}

export interface LiberacaoItensFiltro {
  liberacao_id: number;
  produto_id: number;
  liberacao: string;
  resumo: string | null;
  limit: number;
  offset: number;
}

/** Resposta de GET /sprint/liberacoes/{registro}/itens */
export interface LiberacaoItensResponse {
  data: LiberacaoCasoItem[];
  total: number;
  next_offset: number | null;
  filtro: LiberacaoItensFiltro;
}

export interface GetLiberacaoItensParams {
  liberacao?: string;
  resumo?: string;
  limit?: number;
  offset?: number;
}
