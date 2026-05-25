/** Item retornado por GET /sgp-riscos-historico?id_seq={sequenciaDoRisco} */
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
export interface SgpRiscosHistoricoByRiscoApiResponse {
  data: SgpRiscoHistoricoItem[];
  next_cursor: string | null;
  prev_cursor: string | null;
}

/** Resposta normalizada para hooks e UI */
export interface SgpRiscosHistoricoByRiscoResponse {
  success: boolean;
  data: SgpRiscoHistoricoItem[];
  pagination: SgpRiscoHistoricoPagination;
}

/** @deprecated Use SgpRiscosHistoricoByRiscoApiResponse */
export type SgpRiscosHistoricoByProjetoApiResponse =
  SgpRiscosHistoricoByRiscoApiResponse;

/** @deprecated Use SgpRiscosHistoricoByRiscoResponse */
export type SgpRiscosHistoricoByProjetoResponse =
  SgpRiscosHistoricoByRiscoResponse;

export interface CreateSgpRiscoHistoricoRequest {
  id_seq: number;
  data_historico: string;
  descricao: string;
  impacto: string;
}

export type UpdateSgpRiscoHistoricoRequest = CreateSgpRiscoHistoricoRequest;

export interface CreateSgpRiscoHistoricoApiResponse {
  success?: boolean;
  message?: string;
  data: SgpRiscoHistoricoItem;
}

export type UpdateSgpRiscoHistoricoApiResponse =
  CreateSgpRiscoHistoricoApiResponse;

export interface DeleteSgpRiscoHistoricoApiResponse {
  success?: boolean;
  message?: string;
}
