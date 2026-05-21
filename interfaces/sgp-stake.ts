/** Item de stake retornado por GET /sgp-stakes/projeto/{registro} */
export interface SgpStakeItem {
  sequencia: number;
  registro: number;
  caracteristica: string;
  id_tipo: number;
  nomes: string;
  horas_disponiveis: string;
  suporte_id: number;
  dias_uteis: number;
  horas_risco: string;
  horas_nao_planejadas: string;
  projeto_aprovado: number;
  observacoes: string | null;
  ocorrencia_gerada: number;
}

export interface SgpStakePagination {
  per_page: number;
  next_cursor: string | null;
  prev_cursor: string | null;
  has_more: boolean;
}

/** Resposta GET /sgp-stakes/projeto/{registro} */
export interface SgpStakesByProjetoResponse {
  success: boolean;
  data: SgpStakeItem[];
  pagination: SgpStakePagination;
}

/** Corpo POST /sgp-stakes (PascalCase — API externa). */
export interface CreateSgpStakeRequest {
  Registro: number;
  Caracteristica: string;
  Id_Tipo: number;
  Nomes: string;
  HorasDisponiveis: string;
  Suporte_id: number;
  DiasUteis: number;
  HorasRisco: string;
  HorasNaoPlanejadas: string;
  ProjetoAprovado: number;
  Observacoes?: string | null;
  OcorrenciaGerada: number;
}

/** Resposta POST /sgp-stakes */
export interface CreateSgpStakeApiResponse {
  success: boolean;
  message: string;
  data: SgpStakeItem;
}

/** Corpo PUT /sgp-stakes/{sequencia} (mesmo formato do POST). */
export type UpdateSgpStakeRequest = CreateSgpStakeRequest;

/** Resposta PUT /sgp-stakes/{sequencia} */
export interface UpdateSgpStakeApiResponse {
  success: boolean;
  message: string;
  data: SgpStakeItem;
}

/** Resposta DELETE /sgp-stakes/{sequencia} */
export interface DeleteSgpStakeApiResponse {
  success: boolean;
  message: string;
}
