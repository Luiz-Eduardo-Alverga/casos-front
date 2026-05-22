/** Item retornado por GET /sgp-riscos-historico/projeto/{sgp_cadastro_id} */
export interface SgpRiscoHistoricoItem {
  id: number;
  data_historico: string;
  descricao: string;
  impacto: string;
  id_seq: number;
}

export interface SgpRiscoHistoricoPagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

/** Resposta bruta da API externa */
export interface SgpRiscosHistoricoByProjetoApiResponse {
  data: SgpRiscoHistoricoItem[];
  next_cursor: string | null;
  prev_cursor: string | null;
}

/** Resposta normalizada para hooks e UI */
export interface SgpRiscosHistoricoByProjetoResponse {
  success: boolean;
  data: SgpRiscoHistoricoItem[];
  pagination: SgpRiscoHistoricoPagination;
}
