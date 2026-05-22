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
