/** Item retornado por GET /sgp-riscos/projeto/{sgp_cadastro_id} */
export interface SgpRiscoItem {
  sequencia: number;
  sgp_cadastro_id: number;
  datas: string | null;
  descricao_risco: string;
  /** Campo conforme retorno da API externa (grafia original). */
  probalidade: string;
  impacto: string;
  prioridade: string;
  contingencia: string | null;
  mitigacao: string | null;
  id_risco: number | null;
}

export interface SgpRiscoPagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

/** Resposta bruta da API externa */
export interface SgpRiscosByProjetoApiResponse {
  data: SgpRiscoItem[];
  next_cursor: string | null;
  prev_cursor: string | null;
}

/** Resposta normalizada para hooks e UI */
export interface SgpRiscosByProjetoResponse {
  success: boolean;
  data: SgpRiscoItem[];
  pagination: SgpRiscoPagination;
}

export interface CreateSgpRiscoRequest {
  sgp_cadastro_id: number;
  datas: string;
  descricao_risco: string;
  probalidade: string;
  impacto: string;
  prioridade: string;
  contingencia: string;
  mitigacao: string;
  id_risco: number;
}

export interface CreateSgpRiscoApiResponse {
  success?: boolean;
  message?: string;
  data: SgpRiscoItem;
}

export type UpdateSgpRiscoRequest = CreateSgpRiscoRequest;
export type UpdateSgpRiscoApiResponse = CreateSgpRiscoApiResponse;

/** Resposta DELETE /sgp-riscos/{sequencia} (API externa pode retornar 204 sem body) */
export interface DeleteSgpRiscoApiResponse {
  success?: boolean;
  message?: string;
}
